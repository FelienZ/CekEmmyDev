import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateOrderItemDto } from './update-orderItem.dto';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';
export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
  @IsString()
  @IsOptional()
  customerName?: string;
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  orderItems?: UpdateOrderItemDto[];
}
