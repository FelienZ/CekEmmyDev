import { OrderStatus } from '@prisma/client';
import { OrderItemResponseDto } from './orderItem-response.dto';
export class OrderResponseDto {
  id!: string;
  customerName!: string;
  totalAmount!: number;
  orderItems!: OrderItemResponseDto[];
  status!: OrderStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
