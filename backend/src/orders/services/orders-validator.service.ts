import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, Product } from '@prisma/client';

@Injectable()
export class OrdersValidator {
  constructor() {}
  isNotAllowedtoUpdate(currentStatus: OrderStatus) {
    return (
      currentStatus === OrderStatus.COMPLETED ||
      currentStatus === OrderStatus.CANCELLED
    );
  }
  isValidDate(pickupDate: Date | string) {
    const pickupTime = new Date(pickupDate);
    pickupTime.setHours(0, 0, 0, 0);
    const currentTime = new Date();
    currentTime.setHours(0, 0, 0, 0);
    return pickupTime > currentTime;
  }
  isProductNotFound(products: Product[], productIds: string[]) {
    const foundIds = new Set(products.map((p) => p.id));
    const missingIds = productIds.filter((i) => !foundIds.has(i));
    return missingIds;
  }
  checkIsValidPaidAmount(paidAmount: number, totalAmount: number) {
    if (Number(paidAmount) < 0) {
      throw new BadRequestException('Jumlah Bayar Invalid, Harus Positif');
    }
    if (Number(paidAmount) > totalAmount) {
      throw new BadRequestException('Jumlah Bayar Invalid, melebihi total');
    }
  }
}
