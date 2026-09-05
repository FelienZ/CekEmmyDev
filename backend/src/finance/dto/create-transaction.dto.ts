import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsPositive({ message: 'Jumlah transaksi harus positif' })
  amount!: number;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: string;
}
