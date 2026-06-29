// ============================================
// GOCus — DTO: Respuesta API Estandarizada
// ============================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional()
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
  }

  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto<T>({
      success: true,
      data,
      message,
    });
  }

  static paginated<T>(
    data: T,
    total: number,
    page: number,
    limit: number,
  ): ApiResponseDto<T> {
    return new ApiResponseDto<T>({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static error(message: string): ApiResponseDto<null> {
    return new ApiResponseDto<null>({
      success: false,
      message,
    });
  }
}
