import { TransactionSource, TransactionType } from '@prisma/client';

export class GetFinanceResponseDto {
  id!: string;
  description!: string | null;
  amount!: number;
  categoryId!: string;
  transactionDate!: Date | null;
  source!: TransactionSource;
}

export class GetTransactionCategoriesDto {
  categoryId!: string;
  name!: string;
  description!: string | null;
  type!: TransactionType;
}
