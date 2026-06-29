import { IsString, IsNotEmpty, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ description: 'Nombre de la unidad (ej. Kilogramo, Unidad, Caja)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Abreviatura de la unidad (ej. KG, UND, CJ)' })
  @IsString()
  @IsNotEmpty()
  abbreviation: string;

  @ApiPropertyOptional({ description: 'Estado de la unidad' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
