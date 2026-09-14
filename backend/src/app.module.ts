import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { FinanceModule } from './finance/finance.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_FILE ?? '.env.development',
    }),
    PrismaModule,
    OrdersModule,
    ProductsModule,
    FinanceModule,
    UsersModule,
    AuthModule,
    MailModule,
  ],
})
export class AppModule {}
