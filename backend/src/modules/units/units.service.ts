import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.unit.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('Unidad no encontrada');
    return unit;
  }

  async create(data: CreateUnitDto) {
    const existsName = await this.prisma.unit.findUnique({ where: { name: data.name } });
    if (existsName) throw new ConflictException('Ya existe una unidad con este nombre');
    
    const existsAbbr = await this.prisma.unit.findUnique({ where: { abbreviation: data.abbreviation } });
    if (existsAbbr) throw new ConflictException('Ya existe una unidad con esta abreviatura');
    
    return this.prisma.unit.create({ data });
  }

  async update(id: string, data: UpdateUnitDto) {
    await this.findOne(id);
    
    if (data.name) {
      const exists = await this.prisma.unit.findUnique({ where: { name: data.name } });
      if (exists && exists.id !== id) {
        throw new ConflictException('Ya existe otra unidad con este nombre');
      }
    }

    if (data.abbreviation) {
      const exists = await this.prisma.unit.findUnique({ where: { abbreviation: data.abbreviation } });
      if (exists && exists.id !== id) {
        throw new ConflictException('Ya existe otra unidad con esta abreviatura');
      }
    }

    return this.prisma.unit.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.unit.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
