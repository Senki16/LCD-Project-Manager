import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as fs from 'fs';
import { uploadsRoot } from './common/uploads';
import { ensureBucket, isCloudStorage } from './common/storage';

// Crea los 3 usuarios del equipo si la BD está vacía (necesario en la nube,
// donde el volumen arranca sin datos). Idempotente.
async function ensureSeedUsers(prisma: PrismaService) {
  const count = await prisma.user.count();
  if (count > 0) return;
  const users = [
    { name: 'David Zuluaga', email: 'david@lcdprojects.com', color: '#007AFF', role: 'ADMIN' },
    { name: 'Claudia Mónica Henao', email: 'claudia@lcdprojects.com', color: '#FF2D55', role: 'ADMIN' },
    { name: 'Luis Julián Zuluaga', email: 'luis@lcdprojects.com', color: '#34C759', role: 'ADMIN' },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u });
  }
  console.log('✅ Usuarios iniciales creados (David, Claudia, Luis)');
}

// Orígenes permitidos para CORS: localhost (dev), cualquier *.vercel.app,
// y el dominio definido en FRONTEND_URL (lista separada por comas).
function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true; // peticiones sin origin (curl, apps nativas)
  const allowed = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^tauri:\/\//.test(origin)) return true;
  if (/\.vercel\.app$/.test(origin)) return true;
  return false;
}

async function bootstrap() {
  // Ensure uploads directory exists
  const uploadsDir = uploadsRoot();
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Crear el bucket de almacenamiento en la nube si hace falta
  if (isCloudStorage()) await ensureBucket();

  // Sembrar usuarios si hace falta
  await ensureSeedUsers(app.get(PrismaService));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 LCD Projects Hub Backend corriendo en el puerto ${port} (/api)`);
}

bootstrap();
