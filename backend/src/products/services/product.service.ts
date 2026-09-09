import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import Slugify from '@/helper/slugify';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from '@/helper/prisma-error.helper';
import {
  PaginatedResponse,
  PaginationQueryDto,
  createPaginatedResponse,
  normalizePagination,
} from '@/helper/pagination.dto';
import { GetProductResponseDto } from '../dto/get-response.dto';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';
import { UpdateProductCategoryStatusDto } from '../dto/update-product-category-status.dto';

@Injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository) {}
  async findAllProducts(
    query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<GetProductResponseDto>> {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.productRepository.findAll({
      skip,
      take: limit,
    });
    return createPaginatedResponse(data, total, page, limit);
  }
  async findAllProductCategories() {
    return await this.productRepository.findAllCategories();
  }
  async createProductCategory(
    payload: CreateProductCategoryDto,
  ): Promise<string> {
    const finalPayload: Prisma.ProductCategoryCreateInput = {
      name: payload.name,
      slug: Slugify(payload.name),
      description: payload.description,
    };
    try {
      const result = await this.productRepository.createCategory(finalPayload);
      return result.categoryId;
    } catch (error) {
      handlePrismaError(error, {
        entityName: 'Kategori Produk',
        conflictMessage: 'Nama atau slug kategori produk sudah digunakan',
      });
    }
  }
  async updateProductCategory(
    categoryId: string,
    payload: UpdateProductCategoryDto,
  ): Promise<string> {
    const existingCategory =
      await this.productRepository.findCategoryById(categoryId);
    if (!existingCategory) {
      throw new NotFoundException('Kategori produk tidak ditemukan');
    }

    const updateData: Prisma.ProductCategoryUpdateInput = {};

    if (payload.name !== undefined) {
      updateData.name = payload.name;
      updateData.slug = Slugify(payload.name);
    }

    if (payload.description !== undefined) {
      updateData.description = payload.description;
    }

    try {
      const result = await this.productRepository.updateCategory(
        categoryId,
        updateData,
      );
      return result.categoryId;
    } catch (error) {
      handlePrismaError(error, {
        entityName: 'Kategori Produk',
        conflictMessage: 'Nama atau slug kategori produk sudah digunakan',
      });
    }
  }
  async updateProductCategoryStatus(
    categoryId: string,
    payload: UpdateProductCategoryStatusDto,
  ): Promise<string> {
    const existingCategory =
      await this.productRepository.findCategoryById(categoryId);
    if (!existingCategory) {
      throw new NotFoundException('Kategori produk tidak ditemukan');
    }

    try {
      const result = await this.productRepository.updateCategoryStatus(
        categoryId,
        payload.isActive,
      );
      return result.categoryId;
    } catch (error) {
      handlePrismaError(error, {
        entityName: 'Kategori Produk',
      });
    }
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

    const category = await this.productRepository.findCategoryById(categoryId);
    if (!category) {
      throw new NotFoundException('Kategori produk tidak ditemukan');
    }
    if (!category.isActive) {
      throw new BadRequestException('Kategori produk tidak aktif');
    }

    if (productData.stock > 0) {
      productData.isAvailable = true;
    }
    const finalPayload: Prisma.ProductCreateInput = {
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

    const { categoryId, ...productData } = payload;

    if (categoryId !== undefined && categoryId !== existingProduct.categoryId) {
      const category =
        await this.productRepository.findCategoryById(categoryId);
      if (!category) {
        throw new NotFoundException('Kategori produk tidak ditemukan');
      }
      if (!category.isActive) {
        throw new BadRequestException('Kategori produk tidak aktif');
      }
    }

    const updateData: Prisma.ProductUpdateInput = {
      ...productData,
      ...(productData.name ? { slug: Slugify(productData.name) } : {}),
      ...(categoryId ? { productCategory: { connect: { categoryId } } } : {}),
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
