import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from './create-orderItem.dto';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama pelanggan tidak boleh kosong' })
  customerName!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems!: CreateOrderItemDto[];
}
