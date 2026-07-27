import { Order } from "@/types/order"
import { CreateOrderPayload, UpdateOrderPayload } from "@/types/payload"
import axios from "axios"
import { PaymentStatus } from '../../types/order';

const baseUrl = 'http://localhost:3000/orders'

export const orderServices = {
    getOrders: async(): Promise<Order[]>=> {
        const response = await axios.get(`${baseUrl}`)
        return response.data
    },
    getOrderById: async(id: string): Promise<Order>=>{
        const response = await axios.get(`${baseUrl}/${id}`)
        return response.data
    },
    createOrder: async(payload: CreateOrderPayload)=>{
        const response = await axios.post(`${baseUrl}`, payload)
        return response
    },
    updateOrder: async(id: string, payload: UpdateOrderPayload)=>{
        const response = await axios.put(`${baseUrl}/${id}`, payload)
        return response
    },
    updatePaymentStatus: async(id: string, payload: PaymentStatus)=>{
        const response = await axios.patch(`${baseUrl}/${id}/payment`, {paymentStatus: payload})
        return response
    },
    deleteOrder: async(id: string)=>{
        const response = await axios.delete(`${baseUrl}/${id}`)
        return response
    }
}