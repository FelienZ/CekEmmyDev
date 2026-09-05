import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category.dto';

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

  // --- Category PATCH routes MUST come before the generic ':id' PATCH ---

  @Patch('categories/:id/activate')
  async activateCategory(@Param('id') id: string) {
    const response = await this.financeService.activateCategory(id);
    return { message: response };
  }

  @Patch('categories/:id/deactivate')
  async deactivateCategory(@Param('id') id: string) {
    const response = await this.financeService.deactivateCategory(id);
    return { message: response };
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() payload: UpdateTransactionCategoryDto,
  ) {
    const response = await this.financeService.updateCategoryMetadata(
      id,
      payload,
    );
    return { message: response };
  }

  // --- Generic transaction PATCH must be LAST to avoid swallowing 'categories' as ':id' ---

  @Patch(':id')
  async updateTransaction(
    @Param('id') id: string,
    @Body() payload: UpdateTransactionDto,
  ) {
    const response = await this.financeService.updateTransactionMetadata(
      id,
      payload,
    );
    return { message: response };
  }
}
