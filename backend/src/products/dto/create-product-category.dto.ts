import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString({ message: 'Nama kategori harus berupa teks' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Nama kategori tidak boleh kosong' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Deskripsi kategori harus berupa teks' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;
}

export { CreateProductCategoryDto as CreateProductCategoryDTO };
