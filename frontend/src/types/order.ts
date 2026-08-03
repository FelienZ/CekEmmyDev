import z from "zod"
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
  PAID: 'PAID',
  PARTIAL: 'PARTIAL'
} as const

export type OrderType = typeof OrderType[keyof typeof OrderType]
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus]
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus]

export interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  orderItems: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  pickupDate: Date | null | string;
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

export const CreateOrderSchema = z.object({
  customerName: z.string().min(3, "Minimal 3 Karakter"),
  pickupDate : z.coerce.date("Tanggal Wajib Dipilih").refine(d => {
    d.setHours(0,0,0,0)
    const time = new Date()
    time.setHours(0, 0, 0, 0)
    return d >= time
  }, "Tanggal Tidak Valid"),
  orderType: z.enum(OrderType, {error: "Tipe Pemesanan Invalid"}),
  status: z.enum(OrderStatus, {error: "Status Pengerjaan Invalid"}).optional(),
  paymentStatus: z.enum(PaymentStatus, {error: "Status Pembayaran Invalid"}),
  paidAmount: z.coerce.number().min(0,"Jumlah Bayar Invalid").default(0).optional(),
  orderItems : z.object({
    productId: z.string().nonempty("Id Produk Invalid"),
    quantity: z.coerce.number().min(1, "Minimal 1 Item"),
    preparedQuantity: z.coerce.number().min(0, "Progress Invalid").optional(),
    subtotal: z.coerce.number().optional(),
    product: z.object({
      name: z.string().min(3, "Minimal 3 Karakter"),
      price: z.coerce.number({ error: "Wajib diisi angka" }).min(0,"Harga Invalid"),
      stock: z.coerce.number({ error: "Wajib diisi angka" }).min(0, "Stok Invalid"),
      })
  }).array().min(1)
})

export type CreateOrder = z.infer<typeof CreateOrderSchema>
