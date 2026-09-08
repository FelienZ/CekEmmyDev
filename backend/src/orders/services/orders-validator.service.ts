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
    if (Number(paidAmount) < 0) {
      throw new BadRequestException('Jumlah Bayar Invalid, Harus Positif');
    }
    if (Number(paidAmount) > totalAmount) {
      throw new BadRequestException('Jumlah Bayar Invalid, melebihi total');
    }
  }
}
