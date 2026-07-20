import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
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

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsDateString()
  @IsOptional()
  pickupDate?: string;
}
