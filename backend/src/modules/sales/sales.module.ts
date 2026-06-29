import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesPdfService } from './sales-pdf.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, SalesPdfService],
  exports: [SalesService],
})
export class SalesModule {}
