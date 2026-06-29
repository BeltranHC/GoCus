import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventario')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  // TODO: Implementar endpoints de inventario
}
