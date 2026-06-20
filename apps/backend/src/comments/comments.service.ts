import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  findByProject(projectId: string) {
    return this.prisma.comment.findMany({
      where: { projectId },
      include: { author: { select: { id: true, name: true, color: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  findByTask(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      include: { author: { select: { id: true, name: true, color: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(data: { projectId?: string; taskId?: string; authorId: string; content: string }) {
    return this.prisma.comment.create({
      data,
      include: { author: { select: { id: true, name: true, color: true, avatar: true } } },
    });
  }

  update(id: string, content: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { content },
      include: { author: { select: { id: true, name: true, color: true, avatar: true } } },
    });
  }

  delete(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
