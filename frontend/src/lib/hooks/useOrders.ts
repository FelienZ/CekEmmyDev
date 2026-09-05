"use client"

import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderServices } from "../services/orderServices";
import { PaymentStatus } from '../../types/order';
import { UpdateOrderPayload } from "@/types/payload";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useGetOrders(){
    return useQuery({
        queryKey: ["orders"],
        queryFn: orderServices.getOrders
    })
}

export function useGetOrderById(id?: string){
    return useQuery({
        queryKey: ["order", id],
        queryFn: id? () => orderServices.getOrderById(id) : skipToken,
    })
}

// mutation queries

export function useMakeOrder(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: orderServices.createOrder,
        onSuccess: async (data)=> {
            await queryClient.invalidateQueries({queryKey: ["orders"]})
            toast.success(data.data?.message)
        },
        onError: (data: AxiosError<{message: string}>)=>{
            toast.error(data.response?.data.message)
        }
    })
}

export function useUpdateOrder(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, payload}:{id: string, payload: UpdateOrderPayload})=>  orderServices.updateOrder(id, payload),
        onSuccess: async (data, args)=>{
            await queryClient.invalidateQueries({queryKey: ["orders"]})
            await queryClient.invalidateQueries({queryKey: ["products"]})
            await queryClient.invalidateQueries({queryKey: ["order", args.id]})
            await queryClient.invalidateQueries({queryKey: ["transactions"]})
            toast.success(data.data?.message)
        },
        onError: (data: AxiosError<{message: string}>)=>{
            toast.error(data.response?.data.message)
        }
    })
}

export function useMarkCompleted(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => orderServices.markAsCompleted(id),
        onSuccess: async(data, args) => {
            await queryClient.invalidateQueries({queryKey: ["orders"]})
            await queryClient.invalidateQueries({queryKey: ["order", args]})
            toast.success(data.data?.message)
        },
        onError: (data: AxiosError<{message: string}>)=>{
            toast.error(data.response?.data.message)
        }
    })
}

export function useMarkCanceled(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => orderServices.cancelOrder(id),
        onSuccess: async(data, args) => {
            await queryClient.invalidateQueries({queryKey: ["orders"]})
            await queryClient.invalidateQueries({queryKey: ["order", args]})
            toast.success(data.data?.message)
        },
        onError: (data: AxiosError<{message: string}>)=>{
            toast.error(data.response?.data.message)
        }
    })
}

export function useUpdatePaymentStatus (){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, payload}:{id: string, payload: PaymentStatus})=>  orderServices.updatePaymentStatus(id, payload),
        onSuccess: async (_, args)=>{
            await queryClient.invalidateQueries({queryKey: ["orders"]})
            await queryClient.invalidateQueries({queryKey: ["order", args.id]})
        }
    })
}
