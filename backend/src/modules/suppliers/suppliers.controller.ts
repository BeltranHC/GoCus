import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Proveedores')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  // TODO: Implementar endpoints de proveedores
}
