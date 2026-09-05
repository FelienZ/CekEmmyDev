import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { OrdersRepository } from './repositories/orders.repository';
import { ProductsModule } from '@/products/products.module';
import { OrdersCalculator } from './services/orders-calculator.service';
import { OrdersValidator } from './services/orders-validator.service';
import { FinanceModule } from '@/finance/finance.module';
import { OrderTransactionHelper } from './services/orders-transaction-helper.service';
@Module({
  imports: [ProductsModule, FinanceModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersRepository,
    OrdersCalculator,
    OrdersValidator,
    OrderTransactionHelper,
  ],
})
export class OrdersModule {}
