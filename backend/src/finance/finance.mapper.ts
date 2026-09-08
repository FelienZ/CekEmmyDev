import { Prisma, Transaction } from '@prisma/client';
import { GetFinanceResponseDto } from './dto/get-transaction.dto';

export type TransactionEntity = Pick<
  Transaction,
  'id' | 'description' | 'categoryId' | 'transactionDate' | 'source'
> & {
  amount: Prisma.Decimal | number;
};

// Konversi Decimal Prisma menjadi number JavaScript dan mapping ke DTO secara type-safe.
export function mapTransactionToResponseDto(
  transaction: TransactionEntity,
): GetFinanceResponseDto {
  const rawAmount = transaction.amount;
  const amount =
    typeof rawAmount === 'number'
      ? rawAmount
      : typeof (rawAmount as Prisma.Decimal)?.toNumber === 'function'
        ? (rawAmount as Prisma.Decimal).toNumber()
        : Number(rawAmount) || 0;

  return {
    id: transaction.id,
    description: transaction.description ?? null,
    amount,
    categoryId: transaction.categoryId,
    transactionDate: transaction.transactionDate,
    source: transaction.source,
  };
}
