import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaymentStatus, Prisma } from '@prisma/client';

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
  async create(data: Prisma.OrderCreateInput) {
    const order = await this.prisma.order.create({
      data,
    });
    return order;
  }
  async update(id: string, data: Prisma.OrderUpdateInput) {
    const order = await this.prisma.order.update({
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
  async updatePaymentStatus(id: string, data: PaymentStatus) {
    const order = await this.prisma.order.update({
      where: { id },
      data,
    });
    return order;
  }
  async delete(id: string) {
    await this.prisma.order.delete({
      where: { id },
    });
  }
}
