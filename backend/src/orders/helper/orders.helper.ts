import { Injectable } from '@nestjs/common';
import { UpdateOrderItemDto } from '../dto/update-orderItem.dto';
import { OrderItem } from '@prisma/client';

@Injectable()
export class OrdersHelper {
  constructor() {}
  normalizeOrderItems(item: UpdateOrderItemDto[]) {
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
  checkItemChanges(
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
}
