import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateOrderItemDto } from '../dto/update-orderItem.dto';
import { OrderItem, OrderStatus, PaymentStatus, Product } from '@prisma/client';
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
    }
    return [...mergedItems.values()];
  }
  checkStockChange(
    oldItem: OrderItem[],
    newItem: { productId: string; change: number }[],
  ) {
    // payload untuk update {id, change}
    const payload = new Map<string, { productId: string; change: number }>();
    for (const n of newItem) {
      const matchItem = oldItem.find((o) => o.productId === n.productId);
      if (matchItem) {
        const delta = matchItem.preparedQuantity - n.change;
        payload.set(n.productId, {
          productId: matchItem.productId,
          change: delta,
        });
        continue;
      }
      payload.set(n.productId, {
        productId: n.productId,
        change: -n.change,
      });
    }
    return [...payload.values()];
  }
  paymentStatusSetter(
    paidAmount: number,
    totalAmount: number,
    paymentStatus: PaymentStatus,
  ) {
    if (paidAmount === totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (paidAmount === 0) {
      paymentStatus = PaymentStatus.UNPAID;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }
    return paymentStatus;
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
  ) {
    return {
      ...order,
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
  ) {
    return {
      ...order,
      pickupDate: order.pickupDate ? new Date(order.pickupDate) : undefined,
      paymentStatus: paymentStatus,
      status,
      totalAmount,
      orderItems: {
        deleteMany: {},
        create: orderItems,
      },
    };
  }
}
