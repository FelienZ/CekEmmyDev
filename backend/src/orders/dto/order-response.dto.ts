import { OrderStatus, OrderType, PaymentStatus } from '@prisma/client';
import { OrderItemResponseDto } from './orderItem-response.dto';
export class OrderResponseDto {
  id!: string;
  customerName!: string;
  totalAmount!: number;
  orderItems!: OrderItemResponseDto[];
  status!: OrderStatus;
  paymentStatus!: PaymentStatus;
  orderType!: OrderType;
  pickupDate!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
