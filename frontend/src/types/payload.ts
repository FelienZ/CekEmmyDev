import { OrderStatus, OrderType, PaymentStatus } from "./order"

export interface UpdateOrder {
    customerName?: string,
    orderType?: OrderType,
    paymentStatus?: PaymentStatus,
    pickupDate?: string,
    status?: OrderStatus,
    orderItems?: {
        productId: string,
        quantity: number,
        preparedQuantity?: number
    }[]
}

export interface CreateOrder {
    customerName: string,
    orderType?: OrderType,
    paymentStatus?: PaymentStatus,
    pickupDate?: string,
    orderItems: {
        productId: string,
        quantity: number
    }[]
}