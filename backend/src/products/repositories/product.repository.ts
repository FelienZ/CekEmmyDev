import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}
  async findAll(params?: { skip?: number; take?: number }) {
    const skip = params?.skip ?? 0;
    const take = params?.take ?? 10;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.product.count(),
    ]);
    return { data, total };
  }
  async findAllCategories() {
    return this.prisma.productCategory.findMany({
      select: {
        categoryId: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
  async findCategoryById(categoryId: string) {
    return this.prisma.productCategory.findUnique({
      where: { categoryId },
      select: {
        categoryId: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
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
  async updateCategory(
    categoryId: string,
    payload: Prisma.ProductCategoryUpdateInput,
  ) {
    return this.prisma.productCategory.update({
      where: { categoryId },
      data: payload,
      select: {
        categoryId: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
    });
  }
  async updateCategoryStatus(categoryId: string, isActive: boolean) {
    return this.prisma.productCategory.update({
      where: { categoryId },
      data: { isActive },
      select: {
        categoryId: true,
        isActive: true,
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
