import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { ProductService } from '../services/product.service';
import {
  GetProductCategoriesDto,
  GetProductResponseDto,
} from '../dto/get-response.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';
import { UpdateProductCategoryStatusDto } from '../dto/update-product-category-status.dto';
import { PaginatedResponse, PaginationQueryDto } from '@/helper/pagination.dto';
import { ApiPaginatedResponse } from '@/helper/swagger.helper';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar semua produk (paginated)' })
  @ApiPaginatedResponse(GetProductResponseDto, 'Daftar produk berhasil diambil')
  async findAllProducts(
    @Query() query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<GetProductResponseDto>> {
    return await this.productService.findAllProducts(query);
  }

  @Get(['categories', 'productcategories'])
  @ApiOperation({ summary: 'Daftar semua kategori produk' })
  @ApiResponse({
    status: 200,
    description: 'Daftar kategori produk',
    type: [GetProductCategoriesDto],
  })
  async findAllCategories(): Promise<GetProductCategoriesDto[]> {
    return await this.productService.findAllProductCategories();
  }

  @Post(['categories', 'productcategories'])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth('cookie')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Buat kategori produk baru' })
  @ApiResponse({ status: 201, description: 'Kategori produk berhasil dibuat' })
  async createCategory(
    @Body() payload: CreateProductCategoryDto,
  ): Promise<{ message: string; data: { categoryId: string } }> {
    const categoryId = await this.productService.createProductCategory(payload);
    return {
      message: 'Kategori Produk Berhasil Dibuat',
      data: { categoryId },
    };
  }

  @Put(['categories/:categoryId', 'productcategories/:categoryId'])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth('cookie')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Perbarui kategori produk' })
  @ApiResponse({
    status: 200,
    description: 'Kategori produk berhasil diperbarui',
  })
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() payload: UpdateProductCategoryDto,
  ): Promise<{ message: string; data: { categoryId: string } }> {
    const updatedId = await this.productService.updateProductCategory(
      categoryId,
      payload,
    );
    return {
      message: 'Kategori Produk Berhasil Diperbarui',
      data: { categoryId: updatedId },
    };
  }

  @Patch([
    'categories/:categoryId/status',
    'productcategories/:categoryId/status',
  ])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth('cookie')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Perbarui status aktif/nonaktif kategori produk' })
  @ApiResponse({
    status: 200,
    description: 'Status kategori produk berhasil diperbarui',
  })
  async updateCategoryStatus(
    @Param('categoryId') categoryId: string,
    @Body() payload: UpdateProductCategoryStatusDto,
  ): Promise<{
    message: string;
    data: { categoryId: string; isActive: boolean };
  }> {
    const updatedId = await this.productService.updateProductCategoryStatus(
      categoryId,
      payload,
    );
    return {
      message: 'Status Kategori Produk Berhasil Diperbarui',
      data: { categoryId: updatedId, isActive: payload.isActive },
    };
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Ambil detail produk berdasarkan ID' })
  @ApiResponse({
    status: 200,
    description: 'Detail produk ditemukan',
    type: GetProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Produk tidak ditemukan' })
  async findProductById(
    @Param('id') id: string,
  ): Promise<GetProductResponseDto | string> {
    return await this.productService.findProductById(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth('cookie')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Buat produk baru' })
  @ApiResponse({ status: 201, description: 'Produk berhasil dibuat' })
  async createProduct(
    @Body() payload: CreateProductDto,
  ): Promise<{ message: string; data: { id: string } }> {
    const id = await this.productService.createProduct(payload);
    return { message: 'Product created successfully', data: { id } };
  }

  @Put('/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth('cookie')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Perbarui produk' })
  @ApiResponse({ status: 200, description: 'Produk berhasil diperbarui' })
  async updateProduct(
    @Param('id') id: string,
    @Body() payload: UpdateProductDto,
  ): Promise<{ message: string }> {
    await this.productService.updateProduct(id, payload);
    return { message: 'Product updated successfully' };
  }
}
