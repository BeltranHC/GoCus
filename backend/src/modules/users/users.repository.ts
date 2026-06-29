// ============================================
// GOCus — Users: Repository
// ============================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    role: true,
    company: { select: { id: true, name: true } },
    branch: { select: { id: true, name: true } },
  };

  async findAll(pagination: PaginationDto, companyId?: string, branchId?: string) {
    const where: Prisma.UserWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    if (pagination.search) {
      where.OR = [
        { firstName: { contains: pagination.search, mode: 'insensitive' } },
        { lastName: { contains: pagination.search, mode: 'insensitive' } },
        { email: { contains: pagination.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: this.defaultInclude,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: this.defaultInclude,
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
