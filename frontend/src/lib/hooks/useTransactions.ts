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
import {
  UpdateTransactionCategoryPayload,
  UpdateTransactionPayload,
} from "@/types/payload";

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

export function useActivateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => FinanceServices.activateCategory(id),
    onSuccess: async (data, id) => {
      await qc.invalidateQueries({ queryKey: ["transaction_categories"] });
      await qc.invalidateQueries({ queryKey: ["transaction_category", id] });
      toast.success(data.data?.message ?? "Kategori berhasil diaktifkan");
    },
    onError: (data: AxiosError<{ message: string }>) => {
      toast.error(data.response?.data.message);
    },
  });
}

export function useDeactivateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => FinanceServices.deactivateCategory(id),
    onSuccess: async (data, id) => {
      await qc.invalidateQueries({ queryKey: ["transaction_categories"] });
      await qc.invalidateQueries({ queryKey: ["transaction_category", id] });
      toast.success(data.data?.message ?? "Kategori berhasil dinonaktifkan");
    },
    onError: (data: AxiosError<{ message: string }>) => {
      toast.error(data.response?.data.message);
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTransactionPayload;
    }) => FinanceServices.updateTransaction(id, payload),
    onSuccess: async (data, variables) => {
      await qc.invalidateQueries({ queryKey: ["transactions"] });
      await qc.invalidateQueries({ queryKey: ["transaction", variables.id] });
      toast.success(data.data?.message ?? "Transaksi berhasil diperbarui");
    },
    onError: (data: AxiosError<{ message: string }>) => {
      toast.error(data.response?.data?.message ?? "Gagal memperbarui transaksi");
    },
  });
}

export function useUpdateTransactionCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTransactionCategoryPayload;
    }) => FinanceServices.updateTransactionCategory(id, payload),
    onSuccess: async (data, variables) => {
      await qc.invalidateQueries({ queryKey: ["transaction_categories"] });
      await qc.invalidateQueries({
        queryKey: ["transaction_category", variables.id],
      });
      await qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(
        typeof data.data === "string"
          ? data.data
          : data.data?.message ?? "Kategori berhasil diperbarui",
      );
    },
    onError: (data: AxiosError<{ message: string }>) => {
      toast.error(
        data.response?.data?.message ?? "Gagal memperbarui kategori",
      );
    },
  });
}

