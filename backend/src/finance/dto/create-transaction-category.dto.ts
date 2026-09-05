import { TransactionType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTransactionCategoryDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(TransactionType, { message: 'Tipe transaksi invalid' })
  @IsNotEmpty()
  type!: TransactionType;
}
