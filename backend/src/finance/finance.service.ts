import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FinanceRepository } from './repositories/finance-repository';
import { TransactionSource } from '@prisma/client';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';
import Slugify from '@/helper/slugify';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(
    private repository: FinanceRepository,
    private prisma: PrismaService,
  ) {}
  async create(
    payload: CreateTransactionDto,
    source?: TransactionSource,
  ): Promise<string> {
    const { categoryId, ...rawPayload } = payload;
    const matchCategory = await this.repository.getCategoryById(categoryId);
    if (!matchCategory || matchCategory === null) {
      throw new BadRequestException('Kategori Transaksi Invalid');
    }
    const finalPayload = {
      ...rawPayload,
      source: source ? source : TransactionSource.MANUAL,
      transactionCategory: {
        connect: {
          categoryId: matchCategory.categoryId,
        },
      },
    };
    const result = await this.repository.create(finalPayload, this.prisma);
    return result.id;
  }
  async createCategory(payload: CreateTransactionCategoryDto): Promise<string> {
    const finalPayload = {
      ...payload,
      isActive: true,
      slug: Slugify(payload.name),
    };
    const result = await this.repository.createCategory(finalPayload);
    return result.categoryId;
  }
  findTransactions() {
    return this.repository.getAll();
  }
  async findTransaction(id: string) {
    const data = await this.repository.getById(id);
    if (!data || data === null) {
      throw new NotFoundException('Transaksi Tidak Ditemukan');
    }
    return data;
  }
  findTransactionCategories() {
    return this.repository.getCategories();
  }

  async findTransactionCategory(id: string) {
    const data = await this.repository.getCategoryById(id);
    if (!data || data === null) {
      throw new NotFoundException('Kategori Transaksi Tidak Ditemukan');
    }
    return data;
  }

  async deleteTransaction(id: string): Promise<string> {
    await this.repository.delete(id);
    return 'Berhasil Menghapus Pesanan';
  }
}
