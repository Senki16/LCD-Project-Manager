import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { FilesModule } from './files/files.module';
import { ActivityModule } from './activity/activity.module';
import { CommentsModule } from './comments/comments.module';
import { DocsModule } from './docs/docs.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    FilesModule,
    ActivityModule,
    CommentsModule,
    DocsModule,
    SearchModule,
  ],
})
export class AppModule {}
