import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import Slugify from '@/helper/slugify';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from '@/helper/prisma-error.helper';

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
      slug: Slugify(productData.name),
      productCategory: {
        connect: { categoryId },
      },
    };
    try {
      const result = await this.productRepository.create(finalPayload);
      return result.id;
    } catch (error) {
      handlePrismaError(error, {
        entityName: 'Product',
        conflictMessage: 'Product name or slug already exists',
      });
    }
  }
  async updateProduct(id: string, payload: UpdateProductDto) {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }
    const updateData: Prisma.ProductUpdateInput = {
      ...payload,
      ...(payload.name ? { slug: Slugify(payload.name) } : {}),
    };
    try {
      const result = await this.productRepository.update(id, updateData);
      return result.id;
    } catch (error) {
      handlePrismaError(error, {
        entityName: 'Product',
        conflictMessage: 'Product name or slug already exists',
      });
    }
  }
}
