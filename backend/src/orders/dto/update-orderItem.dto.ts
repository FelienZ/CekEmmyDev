import { IsInt, Min, IsOptional } from 'class-validator';
import { CreateOrderItemDto } from './create-orderItem.dto';

export class UpdateOrderItemDto extends CreateOrderItemDto {
  @IsInt()
  @Min(0, { message: 'Progress tidak boleh kurang dari 0' })
  @IsOptional()
  preparedQuantity?: number;
}
