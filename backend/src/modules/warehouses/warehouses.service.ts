import { Injectable, NotFoundException } from '@nestjs/common';
import { WarehousesRepository } from './warehouses.repository';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly warehousesRepository: WarehousesRepository) {}

  async findAll(pagination: PaginationDto, branchId?: string) {
    const { data, total } = await this.warehousesRepository.findAll(pagination, branchId);
    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findById(id: string) {
    const warehouse = await this.warehousesRepository.findById(id);
    if (!warehouse) throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    return warehouse;
  }

  async create(dto: CreateWarehouseDto) {
    return this.warehousesRepository.create({
      name: dto.name,
      address: dto.address,
      branch: { connect: { id: dto.branchId } },
    });
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findById(id);
    return this.warehousesRepository.update(id, {
      ...(dto.name && { name: dto.name }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.branchId && { branch: { connect: { id: dto.branchId } } }),
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.warehousesRepository.delete(id);
    return { message: 'Almacén desactivado exitosamente' };
  }
}
