import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { PaginationDto } from '../../common/dto';
import { ParseUuidPipe } from '../../common/pipes';
import { RequirePermissions } from '../../common/decorators';

@ApiTags('Empresas')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @RequirePermissions('companies:read')
  @ApiOperation({ summary: 'Listar empresas' })
  findAll(@Query() pagination: PaginationDto) {
    return this.companiesService.findAll(pagination);
  }

  @Get(':id')
  @RequirePermissions('companies:read')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.companiesService.findById(id);
  }

  @Post()
  @RequirePermissions('companies:create')
  @ApiOperation({ summary: 'Crear empresa' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Put(':id')
  @RequirePermissions('companies:update')
  @ApiOperation({ summary: 'Actualizar empresa' })
  update(@Param('id', ParseUuidPipe) id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('companies:delete')
  @ApiOperation({ summary: 'Desactivar empresa' })
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.companiesService.remove(id);
  }
}
