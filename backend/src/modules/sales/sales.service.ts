import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SalesPdfService } from './sales-pdf.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: SalesPdfService,
  ) {}

  async createSale(branchId: string, userId: string, dto: CreateSaleDto) {
    // Validate branchId
    if (!branchId) {
      throw new BadRequestException(
        'El usuario no tiene una sucursal asignada. Contacte al administrador.',
      );
    }

    // Calculate totals
    let total = 0;
    for (const item of dto.items) {
      const subtotal = item.quantity * item.unitPrice;
      total += subtotal;
    }

    // IGV 18%
    const igvAmount = total - total / 1.18;

    // Determine series based on document type
    const series = dto.documentType === 'FACTURA' ? 'F001' : 'B001';

    // Use a transaction for atomicity
    const sale = await this.prisma.$transaction(async (tx) => {
      // Get next correlative for this series (auto-increment)
      const lastSale = await tx.sale.findFirst({
        where: { series, branchId },
        orderBy: { correlative: 'desc' },
        select: { correlative: true },
      });
      const nextCorrelative = (lastSale?.correlative ?? 0) + 1;

      // Create the sale with its details
      return tx.sale.create({
        data: {
          branchId,
          userId,
          customerId: dto.customerId || null,
          documentType: dto.documentType,
          paymentMethod: dto.paymentMethod,
          notes: dto.notes,
          status: 'CONFIRMED',
          subtotal: total - igvAmount,
          igvAmount,
          total,
          series,
          correlative: nextCorrelative,
          details: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          details: {
            include: { product: { include: { unit: true } } },
          },
          customer: true,
          branch: { include: { company: true } },
          user: true,
        },
      });
    });

    return sale;
  }

  async getSalePdf(saleId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        details: {
          include: { product: { include: { unit: true } } },
        },
        customer: true,
        branch: { include: { company: true } },
        user: true,
      },
    });

    if (!sale) throw new NotFoundException('Venta no encontrada');

    return this.pdfService.generateTicketPdf(sale as any);
  }

  async getSaleById(id: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Venta no encontrada');
    return sale;
  }
}
