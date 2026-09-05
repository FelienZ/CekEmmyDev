import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductCategoryDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
