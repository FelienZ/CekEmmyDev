import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const sortedChanges = [...changes].sort((a, b) =>
      a.productId.localeCompare(b.productId),
    );

    for (const change of sortedChanges) {
      if (change.change < 0) {
        const needed = Math.abs(change.change);
        const result = await client.product.updateMany({
          where: {
            id: change.productId,
            stock: {
              gte: needed,
            },
          },
          data: {
            stock: {
              decrement: needed,
            },
          },
        });

        if (result.count === 0) {
          const product = await client.product.findUnique({
            where: { id: change.productId },
            select: { id: true, name: true, stock: true },
          });

          if (!product) {
            throw new NotFoundException(
              `Produk dengan ID ${change.productId} tidak ditemukan`,
            );
          }

          throw new BadRequestException(
            `Alokasi stok invalid untuk produk "${product.name}", stok saat ini (${product.stock}) tidak mencukupi kebutuhan (${needed})`,
          );
        }
      } else if (change.change > 0) {
        const result = await client.product.updateMany({
          where: {
            id: change.productId,
          },
          data: {
            stock: {
              increment: change.change,
            },
          },
        });

        if (result.count === 0) {
          throw new NotFoundException(
            `Produk dengan ID ${change.productId} tidak ditemukan`,
          );
        }
      }
    }
  }
}
