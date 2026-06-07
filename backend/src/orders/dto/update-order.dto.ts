import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateOrderItemDto } from './update-orderItem.dto';
import { Type } from 'class-transformer';
import { OrderStatus, OrderType, PaymentStatus } from '@prisma/client';
export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
  @IsString()
  @IsOptional()
  customerName?: string;
  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType 
  
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus 
  
  @IsDateString()
  @IsOptional()
  pickupDate?: string;
  
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  orderItems?: UpdateOrderItemDto[];
}
