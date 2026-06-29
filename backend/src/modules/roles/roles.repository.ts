// ============================================
// GOCus — Roles: Repository
// ============================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    rolePermissions: { include: { permission: true } },
    _count: { select: { users: true } },
  };

  async findAll(pagination: PaginationDto) {
    const where: Prisma.RoleWhereInput = {};

    if (pagination.search) {
      where.name = { contains: pagination.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        include: this.defaultInclude,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({ where: { name } });
  }

  async create(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({
      data,
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: Prisma.RoleUpdateInput) {
    return this.prisma.role.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async syncPermissions(roleId: string, permissionIds: string[]) {
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      ...permissionIds.map((permissionId) =>
        this.prisma.rolePermission.create({
          data: { roleId, permissionId },
        }),
      ),
    ]);
  }
}
