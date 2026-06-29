import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Productos')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  create(
    @CurrentUser('branchId') branchId: string,
    @Body() createProductDto: CreateProductDto
  ) {
    return this.productsService.create(branchId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos con filtro opcional' })
  findAll(
    @CurrentUser('branchId') branchId: string,
    @Query('search') search?: string
  ) {
    return this.productsService.findAll(branchId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un producto' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('branchId') branchId: string
  ) {
    return this.productsService.findOne(id, branchId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
  update(
    @Param('id') id: string,
    @CurrentUser('branchId') branchId: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, branchId, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar producto (Soft Delete)' })
  remove(
    @Param('id') id: string,
    @CurrentUser('branchId') branchId: string
  ) {
    return this.productsService.remove(id, branchId);
  }
}
