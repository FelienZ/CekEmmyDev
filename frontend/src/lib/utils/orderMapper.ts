import { OrderStatus, OrderType } from "@/types/order";
import { PaymentStatus } from '../../types/order';

export const OrderStatusLabel: Record<string, string> = {
  [OrderStatus.PENDING]: 'Menunggu',
  [OrderStatus.PREPARING]: 'Mempersiapkan',
  [OrderStatus.READY]: 'Siap',
  [OrderStatus.COMPLETED]: 'Selesai',
  [OrderStatus.CANCELLED]: 'Dibatalkan'
};

export const OrderPaymentStatusLabel: Record<string, string>  = {
  [PaymentStatus.UNPAID]: 'Belum Bayar',
  [PaymentStatus.PAID]: 'Lunas',
  [PaymentStatus.PARTIAL]: 'Panjar'
}

export const OrderTypeLabel: Record<string, string>  = {
  [OrderType.TAKEAWAY]: 'Ambil di Tempat',
  [OrderType.DINE_IN]: 'Makan di Tempat',
  [OrderType.DELIVERY]: 'Pengiriman'
}