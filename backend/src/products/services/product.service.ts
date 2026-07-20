import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository) {}
  async findAllProducts() {
    return await this.productRepository.findAll();
  }
  async findAllProductCategories() {
    return await this.productRepository.findAllCategories();
  }
  async findProductById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
  async findManyProductsByIds(ids: string[]) {
    return await this.productRepository.findManyByIds(ids);
  }
  async createProduct(payload: CreateProductDto) {
    const { categoryId, ...productData } = payload;
    if (productData.stock > 0) {
      productData.isAvailable = true;
    }
    const finalPayload = {
      ...productData,
      productCategory: {
        connect: { categoryId },
      },
    };
    const result = await this.productRepository.create(finalPayload);
    return result.id;
  }
  async updateProduct(id: string, payload: UpdateProductDto) {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }
    const result = await this.productRepository.update(id, payload);
    return result.id;
  }
  async deleteProduct(id: string) {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.delete(id);
  }
}
