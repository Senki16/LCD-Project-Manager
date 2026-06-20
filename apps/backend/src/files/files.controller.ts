import {
  Controller, Get, Post, Delete, Patch, Body, Param,
  Query, UseInterceptors, UploadedFile, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import * as fs from 'fs';
import { FilesService } from './files.service';
import { isCloudStorage, publicUrl, localPath } from '../common/storage';

// Subida a memoria: el buffer se reenvía a Supabase Storage (o a disco en local).
const UPLOAD_LIMIT = 50 * 1024 * 1024; // 50 MB (límite del plan gratis de Supabase)

@Controller()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('projects/:projectId/files')
  findByProject(
    @Param('projectId') projectId: string,
    @Query('folderId') folderId?: string,
  ) {
    return this.filesService.findByProject(projectId, folderId);
  }

  @Get('projects/:projectId/folders')
  findFolders(
    @Param('projectId') projectId: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.filesService.findFolders(projectId, parentId);
  }

  @Get('files/recent')
  findRecent(@Query('limit') limit?: string) {
    return this.filesService.findRecent(limit ? parseInt(limit) : 10);
  }

  @Post('projects/:projectId/files')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: UPLOAD_LIMIT } }))
  upload(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string,
  ) {
    return this.filesService.saveFile(file, projectId, folderId);
  }

  @Get('files/:id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.findOne(id);
    if (!file) return res.status(404).json({ message: 'Not found' });

    // Nube: redirige a la URL pública de Supabase (descarga directa, sin pasar por el server)
    if (isCloudStorage()) {
      const url = publicUrl(file.path);
      if (!url) return res.status(404).json({ message: 'No URL' });
      return res.redirect(url);
    }

    // Local: sirve desde disco
    const abs = localPath(file.path);
    if (!fs.existsSync(abs)) return res.status(404).json({ message: 'File missing' });
    return res.download(abs, file.originalName);
  }

  @Patch('files/:id/rename')
  rename(@Param('id') id: string, @Body('name') name: string) {
    return this.filesService.rename(id, name);
  }

  @Delete('files/:id')
  delete(@Param('id') id: string) {
    return this.filesService.delete(id);
  }

  @Post('projects/:projectId/folders')
  createFolder(
    @Param('projectId') projectId: string,
    @Body() body: { name: string; parentId?: string },
  ) {
    return this.filesService.createFolder(projectId, body.name, body.parentId);
  }

  @Delete('folders/:id')
  deleteFolder(@Param('id') id: string) {
    return this.filesService.deleteFolder(id);
  }
}
