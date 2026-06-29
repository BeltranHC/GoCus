// ============================================
// GOCus — Users: Service
// ============================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(pagination: PaginationDto, companyId?: string, branchId?: string) {
    const { data, total } = await this.usersRepository.findAll(pagination, companyId, branchId);

    const users = data.map((user) => this.excludePassword(user));

    return {
      data: users,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return this.excludePassword(user);
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException(`El email ${createUserDto.email} ya está registrado`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = await this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone,
      role: { connect: { id: createUserDto.roleId } },
      company: { connect: { id: createUserDto.companyId } },
      ...(createUserDto.branchId && {
        branch: { connect: { id: createUserDto.branchId } },
      }),
    });

    return this.excludePassword(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findById(id);

    const updateData: Record<string, unknown> = {};

    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.firstName) updateData.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) updateData.lastName = updateUserDto.lastName;
    if (updateUserDto.phone !== undefined) updateData.phone = updateUserDto.phone;
    if (updateUserDto.isActive !== undefined) updateData.isActive = updateUserDto.isActive;
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 12);
    }
    if (updateUserDto.roleId) {
      updateData.role = { connect: { id: updateUserDto.roleId } };
    }
    if (updateUserDto.branchId) {
      updateData.branch = { connect: { id: updateUserDto.branchId } };
    }

    const user = await this.usersRepository.update(id, updateData);
    return this.excludePassword(user);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.usersRepository.delete(id);
    return { message: 'Usuario desactivado exitosamente' };
  }

  private excludePassword(user: Record<string, unknown>) {
    const { password, refreshToken, ...result } = user;
    return result;
  }
}
