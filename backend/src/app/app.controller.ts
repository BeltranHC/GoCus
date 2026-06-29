// ============================================
// GOCus — Health Check Controller
// ============================================

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators';

@ApiTags('Sistema')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check del sistema' })
  health() {
    return {
      status: 'ok',
      name: 'GOCus ERP/POS',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
