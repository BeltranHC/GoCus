import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, companyId?: string) {
    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (pagination.search) {
      where.OR = [
        { name: { contains: pagination.search, mode: 'insensitive' } },
        { code: { contains: pagination.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        include: {
          company: { select: { id: true, name: true } },
          _count: { select: { warehouses: true, users: true } },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async findById(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        warehouses: true,
        _count: { select: { users: true } },
      },
    });
    if (!branch) throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    return branch;
  }

  async create(dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        name: dto.name,
        code: dto.code,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        company: { connect: { id: dto.companyId } },
      },
      include: { company: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.findById(id);
    const { companyId, ...updateData } = dto;
    return this.prisma.branch.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.branch.update({ where: { id }, data: { isActive: false } });
    return { message: 'Sucursal desactivada exitosamente' };
  }
}
