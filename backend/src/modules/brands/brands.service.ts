import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Marca no encontrada');
    return brand;
  }

  async create(data: CreateBrandDto) {
    const exists = await this.prisma.brand.findUnique({ where: { name: data.name } });
    if (exists) throw new ConflictException('Ya existe una marca con este nombre');
    return this.prisma.brand.create({ data });
  }

  async update(id: string, data: UpdateBrandDto) {
    await this.findOne(id);
    if (data.name) {
      const exists = await this.prisma.brand.findUnique({ where: { name: data.name } });
      if (exists && exists.id !== id) {
        throw new ConflictException('Ya existe otra marca con este nombre');
      }
    }
    return this.prisma.brand.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.brand.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
