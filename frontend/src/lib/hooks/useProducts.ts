"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productServices } from "../services/productServices";

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

export function useGetProductById(id: string){
    return useQuery({
        queryKey: ["products", id],
        queryFn: () => productServices.getProductById(id),
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