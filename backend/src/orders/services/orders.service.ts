import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderResponseDto } from '../dto/order-response.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ProductRepository } from '@/products/repositories/product.repository';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderStatus, OrderType, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private productRepository: ProductRepository,
  ) {}
  async getOrders(): Promise<OrderResponseDto[]> {
    return this.ordersRepository.findall();
  }
  async getOrderById(id: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
  async createOrder(order: CreateOrderDto): Promise<string> {
    const productIds = order.orderItems.map((item) => item.productId);
    const products = await this.productRepository.findManyByIds(productIds);
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }
    const eachOrderItem = order.orderItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }
      const price = product.price;
      return {
        quantity: item.quantity,
        priceSnapshot: price,
        product: {
          connect: { id: item.productId },
        },
        subtotal: price * item.quantity,
      };
    });
    const finalOrder = {
      customerName: order.customerName,
      totalAmount: eachOrderItem.reduce((sum, item) => sum + item.subtotal, 0),
      orderItems: {
        create: eachOrderItem,
      },
      // status: OrderStatus.PENDING,
      // paymentStatus: PaymentStatus.UNPAID,
      pickupDate: order.pickupDate ? new Date(order.pickupDate) : null,
      orderType: order.orderType || OrderType.TAKEAWAY,
      paymentStatus: order.paymentStatus || PaymentStatus.UNPAID,
    };
    const createdOrder = await this.ordersRepository.create(finalOrder);
    return createdOrder.id;
  }

  async updateOrder(id: string, order: UpdateOrderDto): Promise<string> {
    const existingOrder = await this.ordersRepository.findById(id);
    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }
    if (
      existingOrder.status === OrderStatus.COMPLETED ||
      existingOrder.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Completed/Cancelled orders cannot be updated',
      );
    }
    const updatedOrder = {
      customerName: order.customerName || existingOrder.customerName,
      status: order.status || existingOrder.status,
      paymentStatus: order.paymentStatus || existingOrder.paymentStatus,
      pickupDate: order.pickupDate
        ? new Date(order.pickupDate)
        : existingOrder.pickupDate,
    };
    const productIds = order.orderItems?.map((item) => item.productId);
    if (!productIds || productIds.length === 0) {
      await this.ordersRepository.update(id, updatedOrder);
      return id;
    }
    const products = await this.productRepository.findManyByIds(productIds);
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }
    const eachOrderItem = order.orderItems?.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }
      return {
        quantity: item.quantity,
        preparedQuantity: item.preparedQuantity ?? 0,
        priceSnapshot: product.price,
        product: {
          connect: { id: item.productId },
        },
        subtotal: product.price * item.quantity,
      };
    });
    const finalUpdateOrder = {
      ...updatedOrder,
      totalAmount: eachOrderItem
        ? eachOrderItem.reduce((sum, item) => sum + item.subtotal, 0)
        : existingOrder.totalAmount,
      orderItems: {
        deleteMany: {},
        create: eachOrderItem,
      },
    };
    await this.ordersRepository.update(id, finalUpdateOrder);
    return id;
  }
  async updateStatus(id: string, status: OrderStatus): Promise<string> {
    const existingOrder = await this.ordersRepository.findById(id);
    if (!existingOrder) throw new NotFoundException('Order not found');

    await this.ordersRepository.update(id, { status });
    return id;
  }
  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<string> {
    const existingOrder = await this.ordersRepository.findById(id);
    if (!existingOrder) throw new NotFoundException('Order not found');
    if (
      existingOrder.status === OrderStatus.CANCELLED ||
      existingOrder.paymentStatus === PaymentStatus.PAID
    ) {
      throw new BadRequestException('Gagal Memperbarui Status Pembayaran');
    }
    await this.ordersRepository.updatePaymentStatus(id, paymentStatus);

    return id;
  }
  async deleteOrder(id: string): Promise<void> {
    return this.ordersRepository.delete(id);
  }
}
