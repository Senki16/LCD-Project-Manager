import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  findByProject(projectId: string) {
    return this.prisma.activity.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, color: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  findAll() {
    return this.prisma.activity.findMany({
      include: {
        user: { select: { id: true, name: true, color: true, avatar: true } },
        project: { select: { id: true, name: true, emoji: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  create(data: { projectId?: string; userId: string; type: string; description: string; metadata?: any }) {
    return this.prisma.activity.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
      include: { user: { select: { id: true, name: true, color: true, avatar: true } } },
    });
  }
}
