import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: { name: string; email: string; color?: string; role?: string }) {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
