import { Transaction, TransactionCategory } from "@/types/finance";
import {
  CreateTransactionCategory,
  CreateTransactionPayload,
} from "@/types/payload";
import axios from "axios";

const baseUrl = "http://localhost:3000/finance";

export const FinanceServices = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await axios.get(`${baseUrl}`);
    return response.data;
  },
  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await axios.get(`${baseUrl}/${id}`);
    return response.data;
  },
  getTransactionCategories: async (): Promise<TransactionCategory[]> => {
    const response = await axios.get(`${baseUrl}/categories`);
    return response.data;
  },
  getTransactionCategoryById: async (
    id: string,
  ): Promise<TransactionCategory> => {
    const response = await axios.get(`${baseUrl}/categories/${id}`);
    return response.data;
  },
  createTransaction: async (payload: CreateTransactionPayload) => {
    const response = await axios.post(`${baseUrl}`, payload);
    return response;
  },
  createTransactionCategory: async (payload: CreateTransactionCategory) => {
    const response = await axios.post(`${baseUrl}/categories`, payload);
    return response;
  },
  /*   updateTransaction: async (id: string, payload: UpdateOrderPayload) => {
    const response = await axios.put(`${baseUrl}/${id}`, payload);
    return response;
  },
  updateTransactionCategory: async (
    id: string,
    payload: UpdateOrderPayload,
  ) => {
    const response = await axios.put(`${baseUrl}/${id}`, payload);
    return response;
  }, */
  cancelTransaction: async (id: string) => {
    const response = await axios.delete(`${baseUrl}/${id}/cancel`);
    return response;
  },
  deleteTransaction: async (id: string) => {
    const response = await axios.delete(`${baseUrl}/${id}`);
    return response;
  },
};
