import z from "zod";

export const TransactionSource = {
  ORDER: "ORDER",
  MANUAL: "MANUAL",
} as const;

export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type TransactionSource =
  (typeof TransactionSource)[keyof typeof TransactionSource];
export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: Date | string;

  categoryId: string;
  orderId: string;
  source: TransactionSource;
  transactionCategory: TransactionCategory;

  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionCategory {
  categoryId: string;
  name: string;
  description: string;

  type: TransactionType;

  createdAt: Date;
  updatedAt: Date;
}

export const CreateTransactionSchema = z.object({
  description: z.string().nonempty("Keterangan Transaksi Tidak Boleh Kosong"),
  amount: z.coerce
    .number({ error: "Wajib diisi dengan angka" })
    .min(0, "Harga Tidak Boleh Negatif"),
  categoryId: z.string({ error: "Kategori Invalid" }),
  transactionDate: z.date({ error: "Tanggal Transaksi Tidak Boleh Kosong" }),
});

export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;

export const CreateTransactionCategorySchema = z.object({
  name: z.string().nonempty("Nama Kategori Tidak Boleh Kosong"),
  description: z.string().optional(),
  type: z.enum(TransactionType),
});

export type CreateTransactionCategory = z.infer<
  typeof CreateTransactionCategorySchema
>;
