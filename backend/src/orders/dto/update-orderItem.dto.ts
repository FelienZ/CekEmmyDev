import { IsInt, Min, IsString, IsNotEmpty } from 'class-validator';

export class UpdateOrderItemDto {
  @IsString()
  @IsNotEmpty({ message: 'ID produk tidak boleh kosong' })
  productId!: string;

  @IsInt()
  @Min(1, { message: 'Jumlah pesanan tidak boleh kurang dari 1' })
  quantity!: number;
}
