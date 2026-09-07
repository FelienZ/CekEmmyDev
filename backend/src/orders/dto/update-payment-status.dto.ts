import { PaymentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus, { message: 'Status pembayaran tidak valid' })
  @IsNotEmpty({ message: 'Status pembayaran tidak boleh kosong' })
  paymentStatus!: PaymentStatus;
}
