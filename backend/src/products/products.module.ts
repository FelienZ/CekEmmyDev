import { Module } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { ProductsController } from './controllers/products.controller';
import { ProductService } from './services/product.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ProductRepository, ProductService],
  exports: [ProductRepository],
  controllers: [ProductsController],
})
export class ProductsModule {}
