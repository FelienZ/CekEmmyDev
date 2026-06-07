import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;
  @IsInt()
  @IsOptional()
  price?: number;
  @IsInt()
  @IsOptional()
  stock?: number;
  @IsString()
  @IsOptional()
  categoryId?: string;
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
