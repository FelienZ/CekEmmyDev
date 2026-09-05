import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    return this.prisma.product.findMany();
  }
  async findAllCategories() {
    return this.prisma.productCategory.findMany({
      include: {
        products: true,
      },
    });
  }
  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        productCategory: true,
      },
    });
  }
  async findManyByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
  async create(payload: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data: payload,
      select: {
        id: true,
      },
    });
  }
  async createCategory(payload: Prisma.ProductCategoryCreateInput) {
    return this.prisma.productCategory.create({
      data: payload,
      select: {
        categoryId: true,
      },
    });
  }
  async update(id: string, payload: Prisma.ProductUpdateInput) {
    return await this.prisma.product.update({
      where: { id },
      data: payload,
    });
  }
  async allocateProductStock(
    changes: { productId: string; change: number }[],
    client: Prisma.TransactionClient,
  ) {
    for (const change of changes) {
      await client.product.update({
        where: { id: change.productId },
        data: {
          stock: {
            increment: change.change,
          },
        },
      });
    }
  }
}
