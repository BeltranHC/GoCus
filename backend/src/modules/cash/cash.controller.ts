import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Caja')
@ApiBearerAuth()
@Controller('cash')
export class CashController {
  // TODO: Implementar endpoints de caja
}
