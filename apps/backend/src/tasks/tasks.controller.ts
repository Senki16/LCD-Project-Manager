import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('projects/:projectId/tasks')
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  @Get('tasks/:id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post('projects/:projectId/tasks')
  create(@Param('projectId') projectId: string, @Body() body: any) {
    return this.tasksService.create(projectId, body);
  }

  @Put('tasks/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Patch('tasks/:id/move')
  moveTask(@Param('id') id: string, @Body() body: { column: string; position: number }) {
    return this.tasksService.moveTask(id, body.column, body.position);
  }

  @Patch('tasks/:taskId/checklist/:itemId')
  updateChecklist(
    @Param('taskId') taskId: string,
    @Param('itemId') itemId: string,
    @Body() body: { completed: boolean },
  ) {
    return this.tasksService.updateChecklist(taskId, itemId, body.completed);
  }

  @Delete('tasks/:id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}
