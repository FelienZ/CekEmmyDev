import { PaymentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdatePaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'ID produk tidak boleh kosong' })
  productId!: string;

  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatus;
}
