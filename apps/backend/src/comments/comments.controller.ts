import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('projects/:projectId/comments')
  findByProject(@Param('projectId') projectId: string) {
    return this.commentsService.findByProject(projectId);
  }

  @Get('tasks/:taskId/comments')
  findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findByTask(taskId);
  }

  @Post('comments')
  create(@Body() body: { projectId?: string; taskId?: string; authorId: string; content: string }) {
    return this.commentsService.create(body);
  }

  @Put('comments/:id')
  update(@Param('id') id: string, @Body('content') content: string) {
    return this.commentsService.update(id, content);
  }

  @Delete('comments/:id')
  delete(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }
}
