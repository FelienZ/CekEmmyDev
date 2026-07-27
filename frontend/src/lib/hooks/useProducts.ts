"use client"

import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productServices } from "../services/productServices";
import { UpdateProductPayload } from "@/types/payload";

export function useGetProducts(){
    return useQuery({
        queryKey: ["products"],
        queryFn: productServices.getProducts
    })
}

export function useGetProductCategories(){
    return useQuery({
        queryKey: ["productCategories"],
        queryFn: productServices.getProductCategories
    })
}

export function useGetProductById(id?: string){
    return useQuery({
        queryKey: ["product", id],
        queryFn: id? () => productServices.getProductById(id) : skipToken,
    })
}

export function useCreateProduct(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: productServices.createProduct,
        onSuccess: async ()=> {
            await queryClient.invalidateQueries({queryKey: ["products"]})
        }
    })
}

export function useUpdateProduct(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, payload}:{id: string, payload: UpdateProductPayload}) => productServices.updateProduct(id, payload),
        onSuccess: async (_, args)=>{
            queryClient.invalidateQueries({queryKey: ["products"]})
            queryClient.invalidateQueries({queryKey: ["product", args.id]})
        }
    })
}

export function useDeleteProduct(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id:string ) => productServices.deleteProduct(id),
        onSuccess: async() => {
            queryClient.invalidateQueries({queryKey: ["products"]})
        }
    })
}