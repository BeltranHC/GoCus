import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, icon: true } },
      }
    });
  }

  async getTree() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        children: {
          orderBy: { name: 'asc' },
          include: {
            children: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true
      }
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async create(data: CreateCategoryDto) {
    if (data.parentId) {
      await this.findOne(data.parentId);
    }
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: UpdateCategoryDto) {
    await this.findOne(id);
    if (data.parentId) {
      await this.findOne(data.parentId);
    }
    return this.prisma.category.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
