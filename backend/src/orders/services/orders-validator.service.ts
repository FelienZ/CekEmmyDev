import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, Product } from '@prisma/client';
import { isBusinessDateOnOrAfterToday } from '@/helper/date.helper';

@Injectable()
export class OrdersValidator {
  constructor() {}
  isNotAllowedtoUpdate(currentStatus: OrderStatus) {
    return (
      currentStatus === OrderStatus.COMPLETED ||
      currentStatus === OrderStatus.CANCELLED
    );
  }
  // Pickup date dibandingkan berdasarkan calendar date di business timezone.
  isValidDate(
    pickupDate: Date | string | null | undefined,
    referenceNow?: Date,
  ) {
    return isBusinessDateOnOrAfterToday(pickupDate, referenceNow);
  }
  isProductNotFound(products: Product[], productIds: string[]) {
    const foundIds = new Set(products.map((p) => p.id));
    const missingIds = productIds.filter((i) => !foundIds.has(i));
    return missingIds;
  }
  checkIsValidPaidAmount(paidAmount: number, totalAmount: number) {
    if (isNaN(Number(paidAmount)) || Number(paidAmount) < 0) {
      throw new BadRequestException('Jumlah Bayar Invalid, Harus Positif');
    }
    if (Number(paidAmount) > totalAmount) {
      throw new BadRequestException('Jumlah Bayar Invalid, melebihi total');
    }
  }
  validateProductsAvailableForCreate(products: Product[]) {
    const unavailable = products.filter((p) => !p.isAvailable);
    if (unavailable.length > 0) {
      const names = unavailable.map((p) => p.name || p.id).join(', ');
      throw new BadRequestException(
        `Produk tidak tersedia untuk dipesan: ${names}`,
      );
    }
  }
  validateProductsAvailableForUpdate(
    products: Product[],
    existingItems: {
      productId: string;
      quantity: number;
      preparedQuantity: number;
    }[],
    newItems: {
      productId: string;
      quantity: number;
      preparedQuantity?: number;
    }[],
  ) {
    const productMap = new Map(products.map((p) => [p.id, p]));
    const existingMap = new Map<
      string,
      { quantity: number; preparedQuantity: number }
    >();
    for (const item of existingItems) {
      const curr = existingMap.get(item.productId) ?? {
        quantity: 0,
        preparedQuantity: 0,
      };
      existingMap.set(item.productId, {
        quantity: curr.quantity + item.quantity,
        preparedQuantity: curr.preparedQuantity + (item.preparedQuantity || 0),
      });
    }

    for (const item of newItems) {
      const product = productMap.get(item.productId);
      if (!product || product.isAvailable) {
        continue;
      }
      const existing = existingMap.get(item.productId);
      if (!existing) {
        throw new BadRequestException(
          `Produk tidak tersedia untuk ditambahkan ke pesanan: ${product.name}`,
        );
      }
      const newPrep =
        item.preparedQuantity !== undefined
          ? item.preparedQuantity
          : existing.preparedQuantity;
      if (newPrep > existing.preparedQuantity) {
        throw new BadRequestException(
          `Produk tidak tersedia untuk penambahan alokasi: ${product.name}`,
        );
      }
      if (item.quantity > existing.quantity) {
        throw new BadRequestException(
          `Produk tidak tersedia untuk penambahan kuantitas: ${product.name}`,
        );
      }
    }
  }
}
