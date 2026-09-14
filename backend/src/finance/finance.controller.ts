import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category.dto';
import { PaginatedResponse, PaginationQueryDto } from '@/helper/pagination.dto';
import {
  GetFinanceResponseDto,
  GetTransactionCategoriesDto,
} from './dto/get-transaction.dto';
import { ApiPaginatedResponse } from '@/helper/swagger.helper';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Finance')
@ApiCookieAuth('cookie')
@ApiBearerAuth('bearer')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Buat transaksi keuangan baru' })
  @ApiResponse({ status: 201, description: 'Transaksi berhasil dibuat' })
  async create(@Body() payload: CreateTransactionDto) {
    const id = await this.financeService.create(payload);
    return {
      message: 'Transaksi Berhasil Dibuat',
      data: { id },
    };
  }

  @Post('/categories')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Buat kategori transaksi keuangan baru' })
  @ApiResponse({
    status: 201,
    description: 'Kategori transaksi berhasil dibuat',
  })
  async createCategory(@Body() payload: CreateTransactionCategoryDto) {
    const categoryId = await this.financeService.createCategory(payload);
    return {
      message: 'Kategori Transaksi Berhasil Dibuat',
      data: { categoryId },
    };
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Daftar transaksi keuangan (paginated)' })
  @ApiPaginatedResponse(
    GetFinanceResponseDto,
    'Daftar transaksi berhasil diambil',
  )
  async getTransactions(
    @Query() query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<GetFinanceResponseDto>> {
    return await this.financeService.findTransactions(query);
  }

  @Get('categories')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Daftar semua kategori transaksi keuangan' })
  @ApiResponse({
    status: 200,
    description: 'Daftar kategori transaksi',
    type: [GetTransactionCategoriesDto],
  })
  async getCategories() {
    return this.financeService.findTransactionCategories();
  }

  @Get('categories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Ambil detail kategori transaksi berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Detail kategori transaksi',
    type: GetTransactionCategoriesDto,
  })
  @ApiResponse({ status: 404, description: 'Kategori tidak ditemukan' })
  async getCategory(@Param('id') id: string) {
    return await this.financeService.findTransactionCategory(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Ambil detail transaksi keuangan berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Detail transaksi keuangan',
    type: GetFinanceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaksi tidak ditemukan' })
  async getTransaction(@Param('id') id: string) {
    return await this.financeService.findTransaction(id);
  }

  @Patch('categories/:id/activate')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Aktifkan kategori transaksi' })
  @ApiResponse({ status: 200, description: 'Kategori berhasil diaktifkan' })
  async activateCategory(@Param('id') id: string) {
    const response = await this.financeService.activateCategory(id);
    return { message: response };
  }

  @Patch('categories/:id/deactivate')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Nonaktifkan kategori transaksi' })
  @ApiResponse({ status: 200, description: 'Kategori berhasil dinonaktifkan' })
  async deactivateCategory(@Param('id') id: string) {
    const response = await this.financeService.deactivateCategory(id);
    return { message: response };
  }

  @Patch('categories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Perbarui metadata kategori transaksi' })
  @ApiResponse({
    status: 200,
    description: 'Kategori transaksi berhasil diperbarui',
  })
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

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Perbarui metadata transaksi keuangan' })
  @ApiResponse({
    status: 200,
    description: 'Transaksi keuangan berhasil diperbarui',
  })
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
