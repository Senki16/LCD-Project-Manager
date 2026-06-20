import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed default users
  const david = await prisma.user.upsert({
    where: { email: 'david@lcdprojects.com' },
    update: {},
    create: {
      name: 'David Zuluaga',
      email: 'david@lcdprojects.com',
      color: '#007AFF',
      role: 'ADMIN',
    },
  });

  const claudia = await prisma.user.upsert({
    where: { email: 'claudia@lcdprojects.com' },
    update: {},
    create: {
      name: 'Claudia Mónica Henao',
      email: 'claudia@lcdprojects.com',
      color: '#FF2D55',
      role: 'ADMIN',
    },
  });

  const luis = await prisma.user.upsert({
    where: { email: 'luis@lcdprojects.com' },
    update: {},
    create: {
      name: 'Luis Julián Zuluaga',
      email: 'luis@lcdprojects.com',
      color: '#34C759',
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuarios creados: David, Claudia, Luis');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
