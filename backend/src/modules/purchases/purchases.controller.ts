import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Compras')
@ApiBearerAuth()
@Controller('purchases')
export class PurchasesController {
  // TODO: Implementar endpoints de compras
}
