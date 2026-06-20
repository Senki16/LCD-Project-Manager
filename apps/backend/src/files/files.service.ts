import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { putObject, deleteObject } from '../common/storage';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  findByProject(projectId: string, folderId?: string) {
    return this.prisma.file.findMany({
      where: { projectId, folderId: folderId || null },
      orderBy: { createdAt: 'desc' },
    });
  }

  findFolders(projectId: string, parentId?: string) {
    return this.prisma.folder.findMany({
      where: { projectId, parentId: parentId || null },
      include: { _count: { select: { files: true, children: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async saveFile(
    file: Express.Multer.File,
    projectId: string,
    folderId?: string,
  ) {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    // Sube el buffer a la nube (o disco) y guarda la key relativa
    const key = `projects/${projectId}/${uuidv4()}${ext ? '.' + ext : ''}`;
    await putObject(key, file.buffer, file.mimetype || 'application/octet-stream');

    const record = await this.prisma.file.create({
      data: {
        projectId,
        folderId: folderId || null,
        name: file.originalname,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        extension: ext,
        path: key,
      },
    });
    return record;
  }

  async delete(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Archivo no encontrado');
    await deleteObject(file.path);
    return this.prisma.file.delete({ where: { id } });
  }

  async findOne(id: string) {
    return this.prisma.file.findUnique({ where: { id } });
  }

  createFolder(projectId: string, name: string, parentId?: string) {
    return this.prisma.folder.create({
      data: { projectId, name, parentId: parentId || null },
    });
  }

  deleteFolder(id: string) {
    return this.prisma.folder.delete({ where: { id } });
  }

  async rename(id: string, name: string) {
    return this.prisma.file.update({ where: { id }, data: { name } });
  }

  findRecent(limit = 10) {
    return this.prisma.file.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true, emoji: true } } },
    });
  }
}
