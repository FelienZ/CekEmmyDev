import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { OrderResponseDto } from '../dto/order-response.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { UpdatePaymentStatusDto } from '../dto/update-payment-status.dto';
import { PaginatedResponse, PaginationQueryDto } from '@/helper/pagination.dto';
import { ApiPaginatedResponse } from '@/helper/swagger.helper';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Orders')
@ApiCookieAuth('cookie')
@ApiBearerAuth('bearer')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Daftar semua pesanan (paginated)' })
  @ApiPaginatedResponse(OrderResponseDto, 'Daftar pesanan berhasil diambil')
  async getOrders(
    @Query() query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    return await this.ordersService.getOrders(query);
  }

  @Get('/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Ambil detail pesanan berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Detail pesanan ditemukan',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  async getOrderById(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.ordersService.getOrderById(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Buat pesanan baru' })
  @ApiResponse({ status: 201, description: 'Pesanan berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Data atau stok tidak valid' })
  async createOrder(
    @Body() order: CreateOrderDto,
  ): Promise<{ message: string; data: { id: string } }> {
    const id = await this.ordersService.createOrder(order);
    return {
      message: 'Pesanan Berhasil Dibuat',
      data: { id },
    };
  }

  @Put('/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Perbarui pesanan' })
  @ApiResponse({ status: 200, description: 'Pesanan berhasil diperbarui' })
  @ApiResponse({ status: 400, description: 'Perubahan pesanan tidak valid' })
  async updateOrder(
    @Param('id') id: string,
    @Body() order: UpdateOrderDto,
  ): Promise<{ message: string }> {
    const response = await this.ordersService.updateOrder(id, order);
    return {
      message: response,
    };
  }

  @Patch('/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tandai status pesanan menjadi COMPLETED' })
  @ApiResponse({
    status: 200,
    description: 'Status pesanan berhasil diperbarui',
  })
  async updateOrderStatusAsCompleted(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const response = await this.ordersService.updateStatusAsCompleted(id);
    return {
      message: response,
    };
  }

  @Patch('/:id/payment')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Catat pembayaran pesanan (payment status diturunkan otomatis dari paidAmount)',
  })
  @ApiResponse({
    status: 200,
    description: 'Status pembayaran berhasil diperbarui',
  })
  @ApiResponse({ status: 400, description: 'Nominal pembayaran tidak valid' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ): Promise<{ message: string }> {
    await this.ordersService.updatePaymentStatus(id, dto.paidAmount);
    return {
      message: 'Berhasil Memperbarui Status Pembayaran',
    };
  }

  @Patch('/:id/cancel')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Batalkan pesanan dan kembalikan stok cadangan' })
  @ApiResponse({ status: 200, description: 'Pesanan berhasil dibatalkan' })
  @ApiResponse({ status: 400, description: 'Pesanan tidak dapat dibatalkan' })
  async cancelOrder(@Param('id') id: string): Promise<{ message: string }> {
    const response = await this.ordersService.cancelOrder(id);
    return {
      message: response,
    };
  }
}
