import { Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private prisma: PrismaService) {}
  async findAll(params?: { skip?: number; take?: number }) {
    const skip = params?.skip ?? 0;
    const take = params?.take ?? 10;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        skip,
        take,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.order.count(),
    ]);
    return { data, total };
  }
  async findall(params?: { skip?: number; take?: number }) {
    return this.findAll(params);
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
  async findByIdForUpdate(id: string, client: Prisma.TransactionClient) {
    const lockedRows = await client.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "Order" WHERE "id" = ${id} FOR UPDATE
    `;
    if (!lockedRows || lockedRows.length === 0) {
      return null;
    }
    return await client.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
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
  async updateOrderStatusAsCompleted(
    id: string,
    client?: Prisma.TransactionClient,
  ) {
    const db = client ?? this.prisma;
    const order = await db.order.update({
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
  async updatePayment(
    id: string,
    paidAmount: number,
    paymentStatus: PaymentStatus,
    client: Prisma.TransactionClient,
  ) {
    const order = await client.order.update({
      where: { id },
      data: {
        paidAmount,
        paymentStatus,
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
