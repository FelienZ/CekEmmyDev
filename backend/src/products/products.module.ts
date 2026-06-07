import { Module } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { ProductsController } from './controllers/products.controller';
import { ProductService } from './services/product.service';

@Module({
  providers: [ProductRepository, ProductService],
  exports: [ProductRepository],
  controllers: [ProductsController],
})
export class ProductsModule {}
