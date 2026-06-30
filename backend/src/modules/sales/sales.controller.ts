import { Controller, Post, Body, Get, Param, Res, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipTransform } from '../../common/decorators/skip-transform.decorator';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async createSale(@Body() dto: CreateSaleDto, @CurrentUser() user: any) {
    return this.salesService.createSale(user.branchId, user.id, dto);
  }

  @Get(':id/pdf')
  @SkipTransform()
  async getSalePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.salesService.getSalePdf(id);
    const sale = await this.salesService.getSaleById(id);

    const docName = `Comprobante-${sale.series ?? 'DOC'}-${(sale.correlative ?? 0).toString().padStart(7, '0')}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${docName}"`,
      'Content-Length': pdfBuffer.length.toString(),
      'Cache-Control': 'no-cache',
    });

    res.end(pdfBuffer);
  }
}
