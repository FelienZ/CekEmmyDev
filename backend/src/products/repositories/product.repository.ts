import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    return this.prisma.product.findMany();
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
    });
  }
  async update(id: string, payload: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data: payload,
    });
  }
  async delete(id: string) {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}
