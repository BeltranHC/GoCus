import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        branchId,
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, abbreviation: true } }
      }
    });
  }

  async findOne(id: string, branchId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, branchId },
      include: {
        category: true,
        brand: true,
        unit: true
      }
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(branchId: string, data: CreateProductDto) {
    if (data.barcode) {
      const existing = await this.prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existing) throw new ConflictException('El código de barras ya existe');
    }
    if (data.sku) {
      const existing = await this.prisma.product.findUnique({ where: { sku: data.sku } });
      if (existing) throw new ConflictException('El SKU ya existe');
    }

    return this.prisma.product.create({
      data: {
        ...data,
        branchId
      }
    });
  }

  async update(id: string, branchId: string, data: UpdateProductDto) {
    await this.findOne(id, branchId); // Validate exists in this branch

    if (data.barcode) {
      const existing = await this.prisma.product.findFirst({
        where: { barcode: data.barcode, id: { not: id } }
      });
      if (existing) throw new ConflictException('El código de barras ya existe');
    }

    return this.prisma.product.update({
      where: { id },
      data
    });
  }

  async remove(id: string, branchId: string) {
    await this.findOne(id, branchId);
    // Soft delete
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
