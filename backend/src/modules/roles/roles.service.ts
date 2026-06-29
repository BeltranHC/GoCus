// ============================================
// GOCus — Roles: Service
// ============================================

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async findAll(pagination: PaginationDto) {
    const { data, total } = await this.rolesRepository.findAll(pagination);
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
    const role = await this.rolesRepository.findById(id);
    if (!role) throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    return role;
  }

  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.rolesRepository.findByName(createRoleDto.name);
    if (existing) throw new ConflictException(`El rol "${createRoleDto.name}" ya existe`);

    const role = await this.rolesRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });

    if (createRoleDto.permissionIds?.length) {
      await this.rolesRepository.syncPermissions(role.id, createRoleDto.permissionIds);
      return this.rolesRepository.findById(role.id);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findById(id);
    if (role.isSystem) throw new BadRequestException('No se pueden modificar roles del sistema');

    const updated = await this.rolesRepository.update(id, {
      name: updateRoleDto.name,
      description: updateRoleDto.description,
      isActive: updateRoleDto.isActive,
    });

    if (updateRoleDto.permissionIds) {
      await this.rolesRepository.syncPermissions(id, updateRoleDto.permissionIds);
      return this.rolesRepository.findById(id);
    }

    return updated;
  }
}
