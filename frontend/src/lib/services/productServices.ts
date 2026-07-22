import { CreateProduct, Product, ProductCategories } from "@/types/product"
import axios from "axios"

const baseUrl = 'http://localhost:3000/products'

export const productServices = {
    getProducts: async(): Promise<Product[]> => {
        const response = await axios.get(`${baseUrl}`)
        return response.data
    },
    getProductById: async(id: string): Promise<Product> => {
        const response = await axios.get(`${baseUrl}/${id}`)
        return response.data
    },
    getProductCategories: async(): Promise<ProductCategories[]> => {
        const response = await axios.get(`${baseUrl}/productcategories`)
        return response.data
    },
    createProduct: async(payload: CreateProduct ): Promise<{message: string; data: { id: string }}> => {
        const response = await axios.post(`${baseUrl}`, payload)
        return response.data
    }
}
