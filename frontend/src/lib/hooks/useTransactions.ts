"use client";

import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FinanceServices } from "../services/financeServices";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useTransactions() {
  return useQuery({
    queryFn: FinanceServices.getTransactions,
    queryKey: ["transactions"],
  });
}

export function useTransaction(id?: string) {
  return useQuery({
    queryFn: id ? () => FinanceServices.getTransactionById(id) : skipToken,
    queryKey: ["transaction", id],
  });
}

export function useTransactionCategories() {
  return useQuery({
    queryFn: FinanceServices.getTransactionCategories,
    queryKey: ["transaction_categories"],
  });
}

export function useTransactionCategory(id?: string) {
  return useQuery({
    queryFn: id
      ? () => FinanceServices.getTransactionCategoryById(id)
      : skipToken,
    queryKey: ["transaction_category", id],
  });
}

export function useMakeTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: FinanceServices.createTransaction,
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(data.data?.message);
    },
    onError: (data: AxiosError<{ message: string }>) => {
      toast.error(data.response?.data.message);
    },
  });
}

export function useMakeTransactionCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: FinanceServices.createTransactionCategory,
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: ["transaction_categories"] });
      toast.success(data.data?.message);
    },
    onError: (data: AxiosError<{ message: string }>) => {
      toast.error(data.response?.data.message);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => FinanceServices.deleteTransaction(id),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(data.data?.message);
    },
    onError: (data) => {
      toast.error(data.message);
    },
  });
}
