import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    if (!query || query.trim().length < 2) return { projects: [], tasks: [], files: [] };

    const q = query.toLowerCase();

    const [projects, tasks, files] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        select: { id: true, name: true, description: true, status: true, emoji: true, color: true },
        take: 5,
      }),
      this.prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: { id: true, title: true, status: true, priority: true, projectId: true, project: { select: { name: true } } },
        take: 5,
      }),
      this.prisma.file.findMany({
        where: { name: { contains: q } },
        select: { id: true, name: true, extension: true, mimeType: true, projectId: true, project: { select: { name: true } } },
        take: 5,
      }),
    ]);

    return { projects, tasks, files };
  }
}
