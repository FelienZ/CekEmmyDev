import { IsOptional, IsString } from 'class-validator';

export class UpdateTransactionCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
