import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Configuración')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  // TODO: Implementar endpoints de configuración
}
