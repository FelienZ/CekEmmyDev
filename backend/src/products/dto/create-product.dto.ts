import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  name!: string;
  @IsInt()
  @Min(0, { message: 'Harga barang tidak boleh negatif' })
  price!: number;
  @IsInt()
  @Min(0, { message: 'Stok tidak boleh negatif' })
  stock!: number;
  @IsString()
  @IsNotEmpty({ message: 'ID Kategori tidak boleh kosong' })
  categoryId!: string;
  @IsBoolean()
  @IsOptional()
  isAvailable!: boolean;
}
