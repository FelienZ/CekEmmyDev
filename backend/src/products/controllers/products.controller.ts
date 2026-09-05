import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import {
  GetProductCategoriesDto,
  GetProductResponseDto,
} from '../dto/get-response.dto';
import { CreateProductDto } from '../dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAllProducts(): Promise<GetProductResponseDto[]> {
    return await this.productService.findAllProducts();
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
    @Body() payload: CreateProductDto,
  ): Promise<{ message: string }> {
    await this.productService.updateProduct(id, payload);
    return { message: 'Product updated successfully' };
  }

}
