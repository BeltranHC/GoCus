import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class WarehousesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, branchId?: string) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.WarehouseWhereInput = {
      ...(branchId && { branchId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        include: {
          branch: {
            select: { id: true, name: true, companyId: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        branch: {
          select: { id: true, name: true, companyId: true },
        },
      },
    });
  }

  async create(data: Prisma.WarehouseCreateInput) {
    return this.prisma.warehouse.create({
      data,
      include: {
        branch: {
          select: { id: true, name: true, companyId: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.WarehouseUpdateInput) {
    return this.prisma.warehouse.update({
      where: { id },
      data,
      include: {
        branch: {
          select: { id: true, name: true, companyId: true },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.warehouse.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
