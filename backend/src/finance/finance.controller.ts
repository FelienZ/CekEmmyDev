import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  create(@Body() payload: CreateTransactionDto) {
    const id = this.financeService.create(payload);
    return {
      message: 'Transaksi Berhasil Dibuat',
      data: { id },
    };
  }

  @Post('/categories')
  createCategory(@Body() payload: CreateTransactionCategoryDto) {
    const categoryId = this.financeService.createCategory(payload);
    return {
      message: 'Kategori Transaksi Berhasil Dibuat',
      data: { categoryId },
    };
  }

  @Get()
  getTransactions() {
    return this.financeService.findTransactions();
  }

  @Get('categories')
  getCategories() {
    return this.financeService.findTransactionCategories();
  }

  @Get('categories/:id')
  getCategory(@Param('id') id: string) {
    return this.financeService.findTransactionCategory(id);
  }

  @Get(':id')
  getTransaction(@Param('id') id: string) {
    return this.financeService.findTransaction(id);
  }

  @Delete(':id')
  async deleteTransaction(@Param('id') id: string) {
    const response = await this.financeService.deleteTransaction(id);
    return {
      message: response,
    };
  }
}
