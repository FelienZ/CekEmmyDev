import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty({ message: 'ID produk tidak boleh kosong' })
  productId!: string;

  @IsInt()
  @Min(1, { message: 'Jumlah pesanan tidak boleh kurang dari 1' })
  quantity!: number;
}
