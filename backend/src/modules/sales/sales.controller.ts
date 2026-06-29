import { Controller, Post, Body, Get, Param, Res, UseGuards } from '@nestjs/common';
import { SalesService, CreateSaleDto } from './sales.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async createSale(@Body() dto: CreateSaleDto, @CurrentUser() user: any) {
    return this.salesService.createSale(user.branchId, user.id, dto);
  }

  @Get(':id/pdf')
  async getSalePdf(@Param('id') id: string, @Res() res: any) {
    const pdfBuffer = await this.salesService.getSalePdf(id);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Boleta-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.end(pdfBuffer);
  }
}
