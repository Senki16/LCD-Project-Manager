import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { status?: string; priority?: string; userId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.userId) {
      where.OR = [
        { ownerId: filters.userId },
        { collaborators: { some: { userId: filters.userId } } },
      ];
    }

    return this.prisma.project.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true, color: true, avatar: true } },
        collaborators: {
          include: { user: { select: { id: true, name: true, email: true, color: true, avatar: true } } },
        },
        tasks: { select: { id: true, status: true, column: true } },
        _count: { select: { tasks: true, files: true, comments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, color: true, avatar: true } },
        collaborators: {
          include: { user: { select: { id: true, name: true, email: true, color: true, avatar: true } } },
        },
        tasks: {
          include: {
            assignees: { include: { user: { select: { id: true, name: true, color: true, avatar: true } } } },
            checklists: { orderBy: { position: 'asc' } },
            _count: { select: { comments: true, attachments: true } },
          },
          orderBy: { position: 'asc' },
        },
        _count: { select: { files: true, comments: true, activities: true } },
      },
    });
  }

  create(data: any) {
    const { collaboratorIds, tags, ...rest } = data;
    return this.prisma.project.create({
      data: {
        ...rest,
        tags: tags ? JSON.stringify(tags) : null,
        collaborators: collaboratorIds?.length
          ? { create: collaboratorIds.map((userId: string) => ({ userId, role: 'MEMBER' })) }
          : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, color: true } },
        collaborators: { include: { user: { select: { id: true, name: true, email: true, color: true } } } },
      },
    });
  }

  async update(id: string, data: any) {
    const { collaboratorIds, tags, ...rest } = data;
    return this.prisma.project.update({
      where: { id },
      data: {
        ...rest,
        tags: tags ? JSON.stringify(tags) : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, color: true } },
        collaborators: { include: { user: { select: { id: true, name: true, email: true, color: true } } } },
      },
    });
  }

  delete(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  async getStats() {
    const [total, byStatus, taskStats, recentActivity] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.groupBy({ by: ['status'], _count: true }),
      this.prisma.task.groupBy({ by: ['status'], _count: true }),
      this.prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, color: true, avatar: true } },
          project: { select: { id: true, name: true, emoji: true } },
        },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of byStatus) statusMap[String(s.status)] = Number(s._count);
    const taskMap: Record<string, number> = {};
    for (const s of taskStats) taskMap[String(s.status)] = Number(s._count);

    return {
      totalProjects: total,
      activeProjects: (statusMap['IN_DEVELOPMENT'] || 0) + (statusMap['PLANNING'] || 0),
      completedProjects: statusMap['COMPLETED'] || 0,
      archivedProjects: statusMap['ARCHIVED'] || 0,
      byStatus: statusMap,
      totalTasks: Object.values(taskMap).reduce((a, b) => a + b, 0),
      completedTasks: taskMap['COMPLETED'] || 0,
      pendingTasks: (taskMap['PENDING'] || 0) + (taskMap['IN_PROGRESS'] || 0),
      recentActivity,
    };
  }
}
