import { Transaction, TransactionCategory } from "@/types/finance";
import {
  CreateTransactionCategory,
  CreateTransactionPayload,
  UpdateTransactionCategoryPayload,
  UpdateTransactionPayload,
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
  activateCategory: async (id: string) => {
    const response = await axios.patch(`${baseUrl}/categories/${id}/activate`);
    return response;
  },
  deactivateCategory: async (id: string) => {
    const response = await axios.patch(`${baseUrl}/categories/${id}/deactivate`);
    return response;
  },
  updateTransaction: async (id: string, payload: UpdateTransactionPayload) => {
    const response = await axios.patch(`${baseUrl}/${id}`, payload);
    return response;
  },
  updateTransactionCategory: async (
    id: string,
    payload: UpdateTransactionCategoryPayload,
  ) => {
    const response = await axios.patch(`${baseUrl}/categories/${id}`, payload);
    return response;
  },
};
