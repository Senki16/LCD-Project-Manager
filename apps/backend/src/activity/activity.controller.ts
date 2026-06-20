import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  findAll() {
    return this.activityService.findAll();
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.activityService.findByProject(projectId);
  }

  @Post()
  create(@Body() body: any) {
    return this.activityService.create(body);
  }
}
