import { IsInt, Min, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateOrderItemDto {
  @IsString()
  @IsNotEmpty({ message: 'ID produk tidak boleh kosong' })
  productId!: string;

  @IsInt()
  @Min(1, { message: 'Jumlah pesanan tidak boleh kurang dari 1' })
  quantity!: number;

  @IsInt()
  @Min(0, { message: 'Progress tidak boleh kurang dari 0' })
  @IsOptional()
  preparedQuantity?: number;
}
