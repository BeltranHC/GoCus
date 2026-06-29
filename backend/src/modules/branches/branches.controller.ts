import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { PaginationDto } from '../../common/dto';
import { ParseUuidPipe } from '../../common/pipes';
import { RequirePermissions } from '../../common/decorators';

@ApiTags('Sucursales')
@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @RequirePermissions('branches:read')
  @ApiOperation({ summary: 'Listar sucursales' })
  findAll(@Query() pagination: PaginationDto, @Query('companyId') companyId?: string) {
    return this.branchesService.findAll(pagination, companyId);
  }

  @Get(':id')
  @RequirePermissions('branches:read')
  @ApiOperation({ summary: 'Obtener sucursal por ID' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.branchesService.findById(id);
  }

  @Post()
  @RequirePermissions('branches:create')
  @ApiOperation({ summary: 'Crear sucursal' })
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Put(':id')
  @RequirePermissions('branches:update')
  @ApiOperation({ summary: 'Actualizar sucursal' })
  update(@Param('id', ParseUuidPipe) id: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('branches:delete')
  @ApiOperation({ summary: 'Desactivar sucursal' })
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.branchesService.remove(id);
  }
}
