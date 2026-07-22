"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderServices } from "../services/orderServices";
import { UpdateOrder } from "@/types/payload";
import { PaymentStatus } from '../../types/order';

export function useGetOrders(){
    return useQuery({
        queryKey: ["orders"],
        queryFn: orderServices.getOrders
    })
}

export function useGetOrderById(id: string){
    return useQuery({
        queryKey: ["orders", id],
        queryFn: () => orderServices.getOrderById,
    })
}

// mutation queries

export function useMakeOrder(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: orderServices.createOrder,
        onSuccess: async ()=> {
            await queryClient.invalidateQueries({queryKey: ["orders"]})
        }
    })
}

export function useUpdateOrder(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, payload}:{id: string, payload: UpdateOrder})=>  orderServices.updateOrder(id, payload),
        onSuccess: async (_, args)=>{
            await queryClient.invalidateQueries({queryKey: ["orders"]})
            await queryClient.invalidateQueries({queryKey: ["orders", args.id]})
        }
    })
}

export function useUpdatePaymentStatus (){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, payload}:{id: string, payload: PaymentStatus})=>  orderServices.updatePaymentStatus(id, payload),
        onSuccess: async (_, args)=>{
            await queryClient.invalidateQueries({queryKey: ["orders"]})
            await queryClient.invalidateQueries({queryKey: ["orders", args.id]})
        }
    })
}

export function useDeleteOrder(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => orderServices.deleteOrder(id),
        onSuccess: async ()=> {
            await queryClient.invalidateQueries({queryKey: ["orders"]})
        }
    })
}