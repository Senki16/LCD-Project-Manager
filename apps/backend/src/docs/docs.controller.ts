import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DocsService } from './docs.service';

@Controller()
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get('projects/:projectId/docs')
  findByProject(@Param('projectId') projectId: string) {
    return this.docsService.findByProject(projectId);
  }

  @Get('docs/:id')
  findOne(@Param('id') id: string) {
    return this.docsService.findOne(id);
  }

  @Post('projects/:projectId/docs')
  create(@Param('projectId') projectId: string, @Body() body: { title: string; content?: string }) {
    return this.docsService.create(projectId, body);
  }

  @Put('docs/:id')
  update(@Param('id') id: string, @Body() body: { title?: string; content?: string }) {
    return this.docsService.update(id, body);
  }

  @Delete('docs/:id')
  delete(@Param('id') id: string) {
    return this.docsService.delete(id);
  }
}
