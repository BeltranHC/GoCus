import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto';
import { PaginationDto } from '../../common/dto';
import { ParseUuidPipe } from '../../common/pipes';
import { RequirePermissions } from '../../common/decorators';

@ApiTags('Almacenes')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @RequirePermissions('warehouses:read')
  @ApiOperation({ summary: 'Listar almacenes' })
  findAll(@Query() pagination: PaginationDto, @Query('branchId') branchId?: string) {
    return this.warehousesService.findAll(pagination, branchId);
  }

  @Get(':id')
  @RequirePermissions('warehouses:read')
  @ApiOperation({ summary: 'Obtener almacén por ID' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.warehousesService.findById(id);
  }

  @Post()
  @RequirePermissions('warehouses:create')
  @ApiOperation({ summary: 'Crear almacén' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  @Put(':id')
  @RequirePermissions('warehouses:update')
  @ApiOperation({ summary: 'Actualizar almacén' })
  update(@Param('id', ParseUuidPipe) id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('warehouses:delete')
  @ApiOperation({ summary: 'Desactivar almacén' })
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.warehousesService.remove(id);
  }
}
