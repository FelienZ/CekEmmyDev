import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FinanceRepository {
  constructor(private prisma: PrismaService) {}
  async getAll() {
    return await this.prisma.transaction.findMany({
      include: {
        transactionCategory: true,
      },
    });
  }
  async getById(id: string) {
    return await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        transactionCategory: true,
      },
    });
  }
  async getCategories() {
    return await this.prisma.transactionCategory.findMany();
  }
  async getCategoryById(categoryId: string) {
    return await this.prisma.transactionCategory.findUnique({
      where: { categoryId },
    });
  }
  async getCategoryBySlug(slug: string) {
    return await this.prisma.transactionCategory.findUnique({
      where: { slug },
    });
  }
  async create(
    payload: Prisma.TransactionCreateInput,
    client: Prisma.TransactionClient,
  ) {
    return await client.transaction.create({
      data: payload,
      select: {
        id: true,
      },
    });
  }
  async createCategory(payload: Prisma.TransactionCategoryCreateInput) {
    return await this.prisma.transactionCategory.create({
      data: payload,
      select: {
        categoryId: true,
      },
    });
  }
  async update(id: string, payload: Prisma.TransactionUpdateInput) {
    return await this.prisma.transaction.update({
      where: { id },
      data: payload,
    });
  }
  async delete(id: string) {
    return await this.prisma.transaction.delete({
      where: { id },
    });
  }
}
