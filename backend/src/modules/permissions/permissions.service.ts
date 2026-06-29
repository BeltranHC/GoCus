// ============================================
// GOCus — Permissions: Service & Module
// ============================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, module?: string) {
    const where: Record<string, unknown> = {};
    if (module) where.module = module;
    if (pagination.search) {
      where.OR = [
        { module: { contains: pagination.search, mode: 'insensitive' } },
        { action: { contains: pagination.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ module: 'asc' }, { action: 'asc' }],
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async findByModule(module: string) {
    return this.prisma.permission.findMany({
      where: { module },
      orderBy: { action: 'asc' },
    });
  }

  async getModules() {
    const permissions = await this.prisma.permission.findMany({
      select: { module: true },
      distinct: ['module'],
      orderBy: { module: 'asc' },
    });
    return permissions.map((p) => p.module);
  }
}
