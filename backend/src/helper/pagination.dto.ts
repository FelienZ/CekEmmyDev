import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page harus berupa bilangan bulat' })
  @Min(1, { message: 'Page minimal bernilai 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit harus berupa bilangan bulat' })
  @Min(1, { message: 'Limit minimal bernilai 1' })
  @Max(100, { message: 'Limit maksimal bernilai 100' })
  limit?: number = 10;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// Menghitung offset dan fallback default secara aman untuk query database.
export function normalizePagination(
  query?: PaginationQueryDto,
): PaginationParams {
  const page = Math.max(1, Number(query?.page) || 1);
  const rawLimit = Number(query?.limit) || 10;
  const limit = Math.min(100, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// Membentuk struktur response pagination standar.
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit) || 0;
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
