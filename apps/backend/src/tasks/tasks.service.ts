import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, color: true, avatar: true } } } },
        checklists: { orderBy: { position: 'asc' } },
        _count: { select: { comments: true, attachments: true } },
      },
      orderBy: [{ column: 'asc' }, { position: 'asc' }],
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, color: true, avatar: true } } } },
        checklists: { orderBy: { position: 'asc' } },
        comments: {
          include: { author: { select: { id: true, name: true, color: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    });
  }

  create(projectId: string, data: any) {
    const { assigneeIds, tags, checklists, ...rest } = data;
    return this.prisma.task.create({
      data: {
        ...rest,
        projectId,
        tags: tags ? JSON.stringify(tags) : null,
        assignees: assigneeIds?.length
          ? { create: assigneeIds.map((userId: string) => ({ userId })) }
          : undefined,
        checklists: checklists?.length
          ? { create: checklists.map((item: any, i: number) => ({ text: item.text, position: i })) }
          : undefined,
      },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, color: true, avatar: true } } } },
        checklists: true,
      },
    });
  }

  async update(id: string, data: any) {
    const { assigneeIds, tags, ...rest } = data;

    if (assigneeIds !== undefined) {
      await this.prisma.taskAssignee.deleteMany({ where: { taskId: id } });
      if (assigneeIds.length > 0) {
        await this.prisma.taskAssignee.createMany({
          data: assigneeIds.map((userId: string) => ({ taskId: id, userId })),
        });
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        tags: tags ? JSON.stringify(tags) : undefined,
      },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, color: true, avatar: true } } } },
        checklists: { orderBy: { position: 'asc' } },
      },
    });
  }

  async moveTask(id: string, column: string, position: number) {
    return this.prisma.task.update({
      where: { id },
      data: { column, position, status: this.columnToStatus(column) },
    });
  }

  delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  async updateChecklist(taskId: string, itemId: string, completed: boolean) {
    return this.prisma.checklistItem.update({
      where: { id: itemId },
      data: { completed },
    });
  }

  private columnToStatus(column: string): string {
    const map: Record<string, string> = {
      PENDING: 'PENDING',
      IN_PROGRESS: 'IN_PROGRESS',
      BLOCKED: 'BLOCKED',
      IN_REVIEW: 'IN_REVIEW',
      COMPLETED: 'COMPLETED',
    };
    return map[column] || 'PENDING';
  }
}
