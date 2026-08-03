import { OrderStatus, OrderType, PaymentStatus } from "./order"

export interface UpdateOrderPayload {
    customerName?: string,
    orderType?: OrderType,
    paymentStatus?: PaymentStatus,
    paidAmount?: number,
    pickupDate?: string | Date,
    status?: OrderStatus,
    orderItems?: {
        productId: string,
        quantity: number,
        preparedQuantity?: number
    }[]
}

export interface CreateOrderPayload {
    customerName: string,
    orderType?: OrderType,
    paymentStatus?: PaymentStatus,
    paidAmount?: number,
    pickupDate?: string | Date,
    orderItems: {
        productId: string,
        quantity: number
    }[]
}

export interface CreateProductPayload{
    name: string;
    price: number;
    stock: number;
    description?: string;
    categoryId:string;
}

export interface UpdateProductPayload{
    name: string;
    price: number;
    stock: number;
    description?: string;
    categoryId:string;
}