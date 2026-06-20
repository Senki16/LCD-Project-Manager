import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
    // Sirve el frontend compilado (copiado a apps/backend/public en el build de la nube).
    // Excluye /api para no pisar la API. En dev el frontend va por Vite (puerto 1420).
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
      serveStaticOptions: { fallthrough: true },
    }),
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
