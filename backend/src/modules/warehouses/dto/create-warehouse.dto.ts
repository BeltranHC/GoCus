import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Almacén Central', description: 'Nombre del almacén' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Av. Principal 123', description: 'Dirección del almacén' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'ID de la sucursal' })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;
}
