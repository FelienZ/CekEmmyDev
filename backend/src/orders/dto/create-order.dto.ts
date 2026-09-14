import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-orderItem.dto';
import { Type } from 'class-transformer';
import { OrderType, PaymentStatus } from '@prisma/client';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama pelanggan tidak boleh kosong' })
  customerName!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems!: CreateOrderItemDto[];

  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType;

  /**
   * @deprecated Transitional field kept for backward compatibility.
   * Payment status is strictly derived by the server from paidAmount and totalAmount.
   */
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsNumber({}, { message: 'Jumlah bayar harus berupa angka' })
  @Min(0, { message: 'Jumlah bayar tidak boleh negatif' })
  @IsOptional()
  paidAmount?: number;

  @IsDateString()
  @IsOptional()
  pickupDate?: string;
}
