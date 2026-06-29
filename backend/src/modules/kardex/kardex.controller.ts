import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Kardex')
@ApiBearerAuth()
@Controller('kardex')
export class KardexController {
  // TODO: Implementar endpoints de kardex
}
