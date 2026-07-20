import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { OrderResponseDto } from '../dto/order-response.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { PaymentStatus } from '@prisma/client';
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}
  @Get()
  async getOrders(): Promise<OrderResponseDto[]> {
    return await this.ordersService.getOrders();
  }
  @Get('/:id')
  async getOrderById(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.ordersService.getOrderById(id);
  }
  @Post()
  async createOrder(
    @Body() order: CreateOrderDto,
  ): Promise<{ message: string; data: { id: string } }> {
    const id = await this.ordersService.createOrder(order);
    return {
      message: 'Order created successfully',
      data: { id },
    };
  }
  @Put('/:id')
  async updateOrder(
    @Param('id') id: string,
    @Body() order: UpdateOrderDto,
  ): Promise<{ message: string }> {
    await this.ordersService.updateOrder(id, order);
    return {
      message: 'Order updated successfully',
    };
  }
  @Patch('/:id/payment')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() status: PaymentStatus,
  ): Promise<{ message: string }> {
    await this.ordersService.updatePaymentStatus(id, status);
    return {
      message: 'Payment status updated successfully',
    };
  }
  @Delete('/:id')
  async deleteOrder(@Param('id') id: string): Promise<{ message: string }> {
    await this.ordersService.deleteOrder(id);
    return {
      message: 'Order deleted successfully',
    };
  }
}
