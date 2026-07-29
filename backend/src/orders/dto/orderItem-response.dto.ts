import { Product } from '@prisma/client';

export class OrderItemResponseDto {
  productId!: string;
  orderId!: string;
  quantity!: number;
  preparedQuantity!: number;
  subtotal!: number;
  product!: Product;
}
