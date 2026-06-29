import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IgvType {
  GRAVADO = 'GRAVADO',
  EXONERADO = 'EXONERADO',
  INAFECTO = 'INAFECTO',
}

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción opcional' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Código SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Código de barras' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ enum: IgvType, default: IgvType.GRAVADO })
  @IsEnum(IgvType)
  igvType: IgvType;

  @ApiProperty({ description: 'Precio de compra' })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({ description: 'Precio de venta' })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiPropertyOptional({ description: 'Stock mínimo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ description: 'Stock máximo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({ description: 'URL de la imagen' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'ID de la Categoría' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ID de la Marca' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ description: 'ID de la Unidad de medida' })
  @IsOptional()
  @IsUUID()
  unitId?: string;
}
