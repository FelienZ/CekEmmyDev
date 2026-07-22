import { Product } from "./product"

export const OrderType = {
  TAKEAWAY: 'TAKEAWAY',
  DINE_IN: 'DINE_IN',
  DELIVERY: 'DELIVERY'
} as const

export const OrderStatus = {
  PENDING : 'PENDING',
  PREPARING: 'PREPARING',
  READY: 'READY', 
  COMPLETED: 'COMPLETED', 
  CANCELLED: 'CANCELLED'
} as const


export const PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID'
} as const

export type OrderType = typeof OrderType[keyof typeof OrderType]
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus]
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus]

export interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  orderItems: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  pickupDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  orderId: string;
  quantity: number;
  preparedQuantity: number;
  subtotal: number;
  product: Product
}
