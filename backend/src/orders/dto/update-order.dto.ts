import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { UpdateOrderItemDto } from './update-orderItem.dto';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, ['orderItems'] as const),
) {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  orderItems?: UpdateOrderItemDto[];
}
