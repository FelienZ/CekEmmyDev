import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateOrderItemDto } from '../dto/update-orderItem.dto';
import {
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Prisma,
  Product,
} from '@prisma/client';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Injectable()
export class OrdersCalculator {
  constructor() {}
  mergeDuplicateItem(item: UpdateOrderItemDto[]) {
    const mergedItems = new Map<string, UpdateOrderItemDto>();
    for (const i of item) {
      const matchItem = mergedItems.get(i.productId);
      if (!matchItem) {
        /* klo gk ad cocok, bikin baru */
        mergedItems.set(i.productId, { ...i });
        continue;
      }
      /* klo cocok lanjut */
      matchItem.quantity += i.quantity;
      if (matchItem.preparedQuantity) {
        matchItem.preparedQuantity += Number(i.preparedQuantity);
      }
      mergedItems.set(i.productId, { ...matchItem });
    }
    return [...mergedItems.values()];
  }
  checkStockChange(
    oldItem: OrderItem[],
    newItem: { productId: string; change: number }[],
  ) {
    const oldAllocated = new Map<string, number>();
    for (const item of oldItem) {
      const current = oldAllocated.get(item.productId) ?? 0;
      oldAllocated.set(item.productId, current + (item.preparedQuantity || 0));
    }

    const newAllocated = new Map<string, number>();
    for (const item of newItem) {
      const current = newAllocated.get(item.productId) ?? 0;
      newAllocated.set(item.productId, current + (item.change || 0));
    }

    const allProductIds = new Set([
      ...oldAllocated.keys(),
      ...newAllocated.keys(),
    ]);

    const stockChanges: { productId: string; change: number }[] = [];
    for (const productId of allProductIds) {
      const oldPrep = oldAllocated.get(productId) ?? 0;
      const newPrep = newAllocated.get(productId) ?? 0;
      const delta = oldPrep - newPrep;

      if (delta !== 0) {
        stockChanges.push({
          productId,
          change: delta,
        });
      }
    }

    return stockChanges;
  }
  paymentStatusSetter(paidAmount: number, totalAmount: number): PaymentStatus {
    const paid = Number(paidAmount);
    const total = Number(totalAmount);
    if (paid === total) {
      return PaymentStatus.PAID;
    } else if (paid === 0) {
      return PaymentStatus.UNPAID;
    } else {
      return PaymentStatus.PARTIAL;
    }
  }
  buildOrderItems(
    item: UpdateOrderItemDto[],
    productMap: Map<string, Product>,
    changeData?: { productId: string; change: number }[],
  ) {
    const OrderItems = item.map((i) => {
      const product = productMap.get(i.productId)!;
      if (i.quantity <= 0) {
        throw new BadRequestException('Invalid Order Item Quantity');
      }
      if (changeData) {
        if (Number(i.preparedQuantity) < 0) {
          throw new BadRequestException('Invalid Order Item preparedQuantity');
        }
        if (Number(i.preparedQuantity) > i.quantity) {
          throw new BadRequestException(
            'Invalid preparedQuantity, above ordered quantity',
          );
        }
        changeData.push({
          productId: i.productId,
          change: i.preparedQuantity || 0,
        });
      }
      return {
        quantity: i.quantity,
        preparedQuantity: i.preparedQuantity || 0,
        priceSnapshot: product.price,
        product: {
          connect: { id: i.productId },
        },
        subtotal: product.price * i.quantity,
      };
    });
    return OrderItems;
  }
  orderStatusSetter(
    orderItems: ReturnType<typeof this.buildOrderItems>,
    status: OrderStatus,
  ) {
    const isReady = orderItems.every((o) => o.preparedQuantity === o.quantity);
    const isOnProgress = orderItems.some((o) => Number(o.preparedQuantity) > 0);
    if (isReady) {
      status = OrderStatus.READY;
    } else if (isOnProgress) {
      status = OrderStatus.PREPARING;
    } else {
      status = OrderStatus.PENDING;
    }
    return status;
  }
  buildFinalCreateOrder(
    order: CreateOrderDto,
    orderItems: ReturnType<typeof this.buildOrderItems>,
    totalAmount: number,
    paymentStatus: PaymentStatus,
    paidAmount: number = 0,
  ) {
    return {
      ...order,
      paidAmount: Number(paidAmount ?? 0),
      totalAmount: totalAmount,
      orderItems: {
        create: orderItems,
      },
      pickupDate: order.pickupDate ? new Date(order.pickupDate) : undefined,
      paymentStatus,
      orderType: order.orderType,
    };
  }
  buildFinalUpdateOrder(
    order: UpdateOrderDto,
    totalAmount: number,
    paymentStatus: PaymentStatus,
    status: OrderStatus,
    orderItems?: ReturnType<typeof this.buildOrderItems>,
  ): Prisma.OrderUpdateInput {
    const payload: Prisma.OrderUpdateInput = {
      ...(order.customerName !== undefined
        ? { customerName: order.customerName }
        : {}),
      ...(order.orderType !== undefined ? { orderType: order.orderType } : {}),
      paymentStatus,
      status,
      totalAmount,
      ...(order.paidAmount !== undefined
        ? { paidAmount: order.paidAmount }
        : {}),
      ...(order.pickupDate !== undefined
        ? {
            pickupDate: order.pickupDate ? new Date(order.pickupDate) : null,
          }
        : {}),
      ...(orderItems !== undefined
        ? {
            orderItems: {
              deleteMany: {},
              create: orderItems,
            },
          }
        : {}),
    };
    return payload;
  }
}
