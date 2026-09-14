import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';

@Injectable()
export class OrderTransactionHelper {
  constructor() {}
  async ensureOrderSalesCategory(slug: string, tx: Prisma.TransactionClient) {
    const category = await tx.transactionCategory.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: 'Penjualan Order',
        type: TransactionType.INCOME,
        isActive: true,
      },
    });
    if (!category || !category.isActive) {
      throw new BadRequestException(
        'Kategori Penjualan Order sedang tidak aktif',
      );
    }
    return category;
  }
}
