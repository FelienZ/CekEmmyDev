import { Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private prisma: PrismaService) {}
  async findall() {
    const orders = await this.prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    return orders;
  }
  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    return order;
  }
  async create(
    data: Prisma.OrderCreateInput,
    client: Prisma.TransactionClient,
  ) {
    const order = await client.order.create({
      data,
    });
    return order;
  }
  async update(
    id: string,
    data: Prisma.OrderUpdateInput,
    client: Prisma.TransactionClient,
  ) {
    const order = await client.order.update({
      where: { id },
      data,
    });
    return order;
  }
  async updateOrderStatusAsCompleted(id: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
    });
    return order;
  }
  async updateOrderStatusAsCanceled(
    id: string,
    client: Prisma.TransactionClient,
  ) {
    const order = await client.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
    return order;
  }
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
      },
    });
    return order;
  }
}
