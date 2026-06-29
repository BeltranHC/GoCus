import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PaginationDto } from '../../common/dto';
import { RequirePermissions } from '../../common/decorators';

@ApiTags('Permisos')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Listar permisos' })
  findAll(@Query() pagination: PaginationDto, @Query('module') module?: string) {
    return this.permissionsService.findAll(pagination, module);
  }

  @Get('modules')
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Listar módulos disponibles' })
  getModules() {
    return this.permissionsService.getModules();
  }
}
