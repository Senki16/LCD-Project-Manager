import {
  Controller, Get, Post, Delete, Patch, Body, Param,
  Query, UseInterceptors, UploadedFile, Res, StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FilesService } from './files.service';
import { uploadsRoot, resolveUploadPath } from '../common/uploads';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const projectId = (req.params as any).projectId || 'misc';
    const dir = path.join(uploadsRoot(), 'projects', projectId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

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
  @UseInterceptors(FileInterceptor('file', { storage }))
  upload(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string,
  ) {
    return this.filesService.saveFile(file, projectId, folderId);
  }

  @Get('files/:id/download')
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const file = await this.filesService.findOne(id);
    if (!file) return res.status(404).json({ message: 'Not found' });
    const abs = resolveUploadPath(file.path);
    if (!fs.existsSync(abs)) return res.status(404).json({ message: 'File missing on disk' });
    const stream = fs.createReadStream(abs);
    res.set({ 'Content-Disposition': `attachment; filename="${file.originalName}"` });
    return new StreamableFile(stream);
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
