import { ApiProperty } from '@nestjs/swagger';

export class OrderItemProductResponseDto {
  id!: string;
  name!: string;
  price!: number;
  stock!: number;
  description!: string | null;
  categoryId!: string;
  isAvailable!: boolean;
}

export class OrderItemResponseDto {
  productId!: string;
  orderId!: string;
  quantity!: number;
  preparedQuantity!: number;
  subtotal!: number;
  @ApiProperty({ type: () => OrderItemProductResponseDto, required: false })
  product?: OrderItemProductResponseDto;
}
