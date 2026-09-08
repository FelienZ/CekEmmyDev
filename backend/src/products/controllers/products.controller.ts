import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import {
  GetProductCategoriesDto,
  GetProductResponseDto,
} from '../dto/get-response.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { PaginatedResponse, PaginationQueryDto } from '@/helper/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAllProducts(
    @Query() query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<GetProductResponseDto>> {
    return await this.productService.findAllProducts(query);
  }

  @Get('productcategories')
  async findAllCategories(): Promise<GetProductCategoriesDto[]> {
    return await this.productService.findAllProductCategories();
  }

  @Get('/:id')
  async findProductById(
    @Param('id') id: string,
  ): Promise<GetProductResponseDto | string> {
    return await this.productService.findProductById(id);
  }

  @Post()
  async createProduct(
    @Body() payload: CreateProductDto,
  ): Promise<{ message: string; data: { id: string } }> {
    const id = await this.productService.createProduct(payload);
    return { message: 'Product created successfully', data: { id } };
  }

  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() payload: UpdateProductDto,
  ): Promise<{ message: string }> {
    await this.productService.updateProduct(id, payload);
    return { message: 'Product updated successfully' };
  }
}
