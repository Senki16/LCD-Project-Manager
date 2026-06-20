import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocsService {
  constructor(private prisma: PrismaService) {}

  findByProject(projectId: string) {
    return this.prisma.doc.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.doc.findUnique({ where: { id } });
  }

  create(projectId: string, data: { title: string; content?: string }) {
    return this.prisma.doc.create({ data: { ...data, projectId } });
  }

  update(id: string, data: { title?: string; content?: string }) {
    return this.prisma.doc.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.doc.delete({ where: { id } });
  }
}
