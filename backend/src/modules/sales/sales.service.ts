import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SalesPdfService } from './sales-pdf.service';
import { SaleDocumentType, SaleStatus, PaymentMethod } from '@prisma/client';

export class CreateSaleDto {
  customerId?: string;
  documentType: SaleDocumentType;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: SalesPdfService,
  ) {}

  async createSale(branchId: string, userId: string, dto: CreateSaleDto) {
    let total = 0;
    
    for (const item of dto.items) {
      const subtotal = item.quantity * item.unitPrice;
      total += subtotal;
    }
    
    // Assuming 18% IGV for simplicity
    const igvAmount = total - (total / 1.18);

    const sale = await this.prisma.sale.create({
      data: {
        branchId,
        userId,
        customerId: dto.customerId,
        documentType: dto.documentType,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
        status: 'CONFIRMED',
        subtotal: total - igvAmount,
        igvAmount,
        total,
        series: dto.documentType === 'FACTURA' ? 'F001' : 'B001',
        correlative: Math.floor(Math.random() * 10000) + 1,
        details: {
          create: dto.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          }))
        }
      },
      include: {
        details: {
          include: { product: { include: { unit: true } } }
        },
        customer: true,
        branch: { include: { company: true } },
        user: true,
      }
    });

    return sale;
  }
  
  async getSalePdf(saleId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        details: {
          include: { product: { include: { unit: true } } }
        },
        customer: true,
        branch: { include: { company: true } },
        user: true,
      }
    });

    if (!sale) throw new NotFoundException('Venta no encontrada');

    return this.pdfService.generateTicketPdf(sale as any);
  }
}
