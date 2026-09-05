import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FinanceRepository } from './repositories/finance-repository';
import { Prisma, TransactionSource } from '@prisma/client';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category.dto';
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
    try {
      const result = await this.repository.createCategory(finalPayload);
      return result.categoryId;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Nama Kategori Sudah digunakan');
      }
      throw error;
    }
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

  async activateCategory(id: string): Promise<string> {
    const category = await this.repository.getCategoryById(id);
    if (!category) throw new NotFoundException('Kategori Transaksi Tidak Ditemukan');
    await this.repository.updateCategoryStatus(id, true);
    return 'Kategori Transaksi Berhasil Diaktifkan';
  }

  async deactivateCategory(id: string): Promise<string> {
    const category = await this.repository.getCategoryById(id);
    if (!category) throw new NotFoundException('Kategori Transaksi Tidak Ditemukan');
    await this.repository.updateCategoryStatus(id, false);
    return 'Kategori Transaksi Berhasil Dinonaktifkan';
  }

  async updateTransactionMetadata(
    id: string,
    payload: UpdateTransactionDto,
  ): Promise<string> {
    const existing = await this.repository.getById(id);
    if (!existing) throw new NotFoundException('Transaksi Tidak Ditemukan');

    const safePayload = {
      description: payload.description,
    };

    await this.repository.update(id, safePayload);
    return 'Metadata Transaksi Berhasil Diperbarui';
  }

  async updateCategoryMetadata(
    id: string,
    payload: UpdateTransactionCategoryDto,
  ): Promise<string> {
    const existing = await this.repository.getCategoryById(id);
    if (!existing)
      throw new NotFoundException('Kategori Transaksi Tidak Ditemukan');

    const safePayload = {
      name: payload.name,
      description: payload.description,
    };

    try {
      await this.repository.updateCategory(id, safePayload);
      return 'Metadata Kategori Berhasil Diperbarui';
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Nama kategori sudah digunakan');
      }

  throw error;
    }
  }
}
