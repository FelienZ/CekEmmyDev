import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderResponseDto } from '../dto/order-response.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ProductRepository } from '@/products/repositories/product.repository';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderStatus, TransactionSource } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { OrdersCalculator } from './orders-calculator.service';
import { OrdersValidator } from './orders-validator.service';
import { FinanceRepository } from '@/finance/repositories/finance-repository';
import { OrderTransactionHelper } from './orders-transaction-helper.service';
import {
  PaginatedResponse,
  PaginationQueryDto,
  createPaginatedResponse,
  normalizePagination,
} from '@/helper/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private productRepository: ProductRepository,
    private financeRepository: FinanceRepository,
    private prisma: PrismaService,
    private calculator: OrdersCalculator,
    private validator: OrdersValidator,
    private transactionHelper: OrderTransactionHelper,
  ) {}
  async getOrders(
    query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    const { page, limit, skip } = normalizePagination(query);
    const { data, total } = await this.ordersRepository.findAll({
      skip,
      take: limit,
    });
    return createPaginatedResponse(data, total, page, limit);
  }
  async getOrderById(id: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
  async createOrder(order: CreateOrderDto): Promise<string> {
    if (order.orderItems.length === 0) {
      throw new BadRequestException('Invalid Empty Order Items');
    }
    if (order.pickupDate) {
      const isValidDate = this.validator.isValidDate(order.pickupDate);
      if (!isValidDate) {
        throw new BadRequestException(
          'Tanggal pengambilan tidak boleh sebelum hari ini',
        );
      }
    }
    const mergedItem = this.calculator.mergeDuplicateItem(order.orderItems);
    const productIds = mergedItem.map((item) => item.productId); // ada 2 id sama blm termerge (merge dulu)
    const products = await this.productRepository.findManyByIds(productIds); // hanya 1
    const isMissing = this.validator.isProductNotFound(products, productIds);
    if (isMissing.length > 0) {
      throw new NotFoundException(
        `Produk Tidak Ditemukan: ${isMissing.join(', ')}`,
      );
    }
    this.validator.validateProductsAvailableForCreate(products);
    /* Perhitungan bisnis: hitung total harga, subTotal item, dkk. */
    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderItems = this.calculator.buildOrderItems(mergedItem, productMap);
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    const paidAmount = Number(order.paidAmount ?? 0);
    this.validator.checkIsValidPaidAmount(paidAmount, totalAmount);
    const paymentStatus = this.calculator.paymentStatusSetter(
      paidAmount,
      totalAmount,
    );
    const finalOrder = this.calculator.buildFinalCreateOrder(
      order,
      orderItems,
      totalAmount,
      paymentStatus,
      paidAmount,
    );
    return await this.prisma.$transaction(async (tx) => {
      const slug = 'order-sales';
      const createdOrder = await this.ordersRepository.create(finalOrder, tx);

      if (paidAmount > 0) {
        // validasi slug ada di kategori tx, kalau gk ada create, kalau notActive 400
        const matchedCategory =
          await this.transactionHelper.ensureOrderSalesCategory(slug, tx);
        const payload = {
          source: TransactionSource.ORDER,
          description: `Pemesanan/Penjualan-${order.customerName}`,
          amount: paidAmount,
          transactionDate: new Date(),
          order: {
            connect: { id: createdOrder.id },
          },
          transactionCategory: {
            connect: {
              categoryId: matchedCategory.categoryId,
            },
          },
        };
        await this.financeRepository.create(payload, tx);
      }

      return createdOrder.id;
    });
  }

  async updateOrder(id: string, order: UpdateOrderDto): Promise<string> {
    return await this.prisma.$transaction(async (tx) => {
      const existingOrder = await this.ordersRepository.findByIdForUpdate(
        id,
        tx,
      );
      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }
      const isInvalidUpdate = this.validator.isNotAllowedtoUpdate(
        existingOrder.status,
      );
      if (isInvalidUpdate)
        throw new BadRequestException(
          'Pesanan yang selesai/dibatalkan tidak dapat diubah',
        );
      if (order.pickupDate) {
        const isValidDate = this.validator.isValidDate(order.pickupDate);
        if (!isValidDate) {
          throw new BadRequestException(
            'Tanggal pengambilan tidak boleh sebelum hari ini',
          );
        }
      }
      if (
        (order.orderItems !== undefined && order.orderItems.length === 0) ||
        (!order.orderItems && existingOrder.orderItems.length === 0)
      ) {
        throw new BadRequestException('Item Pesanan Invalid, minimal 1 buah');
      }

      const newPaidAmount =
        order.paidAmount !== undefined
          ? Number(order.paidAmount)
          : existingOrder.paidAmount;

      if (newPaidAmount < existingOrder.paidAmount) {
        throw new BadRequestException('Pengurangan payment amount invalid');
      }

      let currentStatus = existingOrder.status;

      if (order.orderItems) {
        const mergedItems = this.calculator.mergeDuplicateItem(
          order.orderItems,
        );
        if (mergedItems.length === 0) {
          throw new BadRequestException('Item Pesanan Invalid, minimal 1 buah');
        }

        const productIds = mergedItems.map((item) => item.productId);
        const oldProductIds = existingOrder.orderItems.map(
          (item) => item.productId,
        );
        const allProductIds = Array.from(
          new Set([...productIds, ...oldProductIds]),
        );
        const products =
          await this.productRepository.findManyByIds(allProductIds);

        const isMissing = this.validator.isProductNotFound(
          products,
          productIds,
        );
        if (isMissing.length > 0) {
          throw new NotFoundException(
            `Produk Tidak ditemukan: ${isMissing.join(', ')}`,
          );
        }

        this.validator.validateProductsAvailableForUpdate(
          products,
          existingOrder.orderItems,
          mergedItems,
        );

        const productMap = new Map(products.map((p) => [p.id, p]));
        const changeData: { productId: string; change: number }[] = [];
        const OrderItems = this.calculator.buildOrderItems(
          mergedItems,
          productMap,
          changeData,
        );

        /* Validasi Status pembayaran */
        const newTotalAmount = OrderItems?.reduce((a, v) => a + v.subtotal, 0);
        this.validator.checkIsValidPaidAmount(newPaidAmount, newTotalAmount);
        const paymentStatus = this.calculator.paymentStatusSetter(
          newPaidAmount,
          newTotalAmount,
        );
        currentStatus = this.calculator.orderStatusSetter(
          OrderItems,
          currentStatus,
        );

        /* orderItems baru -> timpa yang lama */
        const finalupdate = this.calculator.buildFinalUpdateOrder(
          order,
          newTotalAmount,
          paymentStatus,
          currentStatus,
          OrderItems,
        );
        const stockChanges = this.calculator.checkStockChange(
          existingOrder.orderItems,
          changeData,
        );

        for (const p of stockChanges) {
          if (p.change < 0) {
            const matchProduct = products.find((pr) => pr.id === p.productId);
            if (matchProduct && matchProduct.stock < Number(-p.change)) {
              throw new BadRequestException(
                'Alokasi stok invalid, di atas stok saat ini',
              );
            }
          }
        }

        await this.productRepository.allocateProductStock(stockChanges, tx);
        await this.ordersRepository.update(id, finalupdate, tx);

        if (newPaidAmount > existingOrder.paidAmount) {
          const diff = newPaidAmount - existingOrder.paidAmount;
          const slug = 'order-sales';
          const matchedCategory =
            await this.transactionHelper.ensureOrderSalesCategory(slug, tx);
          const payload = {
            source: TransactionSource.ORDER,
            description: `Pembayaran Tambahan Pemesanan/Penjualan-${existingOrder.customerName}`,
            amount: diff,
            transactionDate: new Date(),
            order: { connect: { id: existingOrder.id } },
            transactionCategory: {
              connect: { categoryId: matchedCategory.categoryId },
            },
          };
          await this.financeRepository.create(payload, tx);
        }
        return 'Berhasil Memperbarui Pesanan';
      }

      /* Case Kalau tidak ada perubahan item */
      const totalAmount = existingOrder.orderItems?.reduce(
        (a, v) => a + v.subtotal,
        0,
      );
      this.validator.checkIsValidPaidAmount(newPaidAmount, totalAmount);
      const paymentStatus = this.calculator.paymentStatusSetter(
        newPaidAmount,
        totalAmount,
      );
      const isReady = existingOrder.orderItems.every(
        (o) => Number(o.preparedQuantity) === Number(o.quantity),
      );
      const isOnProgress = existingOrder.orderItems.some(
        (o) => Number(o.preparedQuantity) > 0,
      );
      if (isReady) {
        currentStatus = OrderStatus.READY;
      } else if (isOnProgress) {
        currentStatus = OrderStatus.PREPARING;
      } else {
        currentStatus = OrderStatus.PENDING;
      }
      const finalupdate = this.calculator.buildFinalUpdateOrder(
        order,
        totalAmount,
        paymentStatus,
        currentStatus,
        undefined,
      );

      await this.ordersRepository.update(id, finalupdate, tx);

      if (newPaidAmount > existingOrder.paidAmount) {
        const diff = newPaidAmount - existingOrder.paidAmount;
        const slug = 'order-sales';
        const matchedCategory =
          await this.transactionHelper.ensureOrderSalesCategory(slug, tx);
        const payload = {
          source: TransactionSource.ORDER,
          description: `Pembayaran Tambahan Pemesanan/Penjualan-${existingOrder.customerName}`,
          amount: diff,
          transactionDate: new Date(),
          order: { connect: { id: existingOrder.id } },
          transactionCategory: {
            connect: { categoryId: matchedCategory.categoryId },
          },
        };
        await this.financeRepository.create(payload, tx);
      }
      return 'Berhasil Memperbarui Pesanan';
    });
  }

  async updateStatusAsCompleted(id: string): Promise<string> {
    return await this.prisma.$transaction(async (tx) => {
      const existingOrder = await this.ordersRepository.findByIdForUpdate(
        id,
        tx,
      );
      if (!existingOrder) throw new NotFoundException('Order not found');
      if (existingOrder.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(
          'Unable to update status, order has cancelled ',
        );
      }
      if (existingOrder.status === OrderStatus.COMPLETED) {
        throw new BadRequestException(
          'Unable to update status, order has completed ',
        );
      }
      if (existingOrder.paidAmount !== existingOrder.totalAmount) {
        throw new BadRequestException(
          'Gagal Memperbarui Status, Belum dilunasi',
        );
      }
      const notAllowedUpdate = existingOrder.orderItems.some(
        (o) => o.preparedQuantity !== o.quantity,
      );
      if (notAllowedUpdate) {
        throw new BadRequestException(
          'Gagal Memperbarui Status, Belum Dipenuhi',
        );
      }
      await this.ordersRepository.updateOrderStatusAsCompleted(id, tx);
      return 'Berhasil Memperbarui Status Pemesanan';
    });
  }

  async recordPayment(id: string, paidAmount: number): Promise<string> {
    const newPaidAmount = Number(paidAmount);
    if (isNaN(newPaidAmount) || newPaidAmount < 0) {
      throw new BadRequestException('Jumlah Bayar Invalid, Harus Positif');
    }

    return await this.prisma.$transaction(async (tx) => {
      const existingOrder = await this.ordersRepository.findByIdForUpdate(
        id,
        tx,
      );
      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }
      const isInvalidUpdate = this.validator.isNotAllowedtoUpdate(
        existingOrder.status,
      );
      if (isInvalidUpdate) {
        throw new BadRequestException(
          'Pesanan yang selesai/dibatalkan tidak dapat diubah',
        );
      }
      if (newPaidAmount < existingOrder.paidAmount) {
        throw new BadRequestException('Pengurangan payment amount invalid');
      }
      this.validator.checkIsValidPaidAmount(
        newPaidAmount,
        existingOrder.totalAmount,
      );

      const paymentStatus = this.calculator.paymentStatusSetter(
        newPaidAmount,
        existingOrder.totalAmount,
      );

      await this.ordersRepository.updatePayment(
        id,
        newPaidAmount,
        paymentStatus,
        tx,
      );

      if (newPaidAmount > existingOrder.paidAmount) {
        const diff = newPaidAmount - existingOrder.paidAmount;
        const slug = 'order-sales';
        const matchedCategory =
          await this.transactionHelper.ensureOrderSalesCategory(slug, tx);
        const payload = {
          source: TransactionSource.ORDER,
          description: `Pembayaran Tambahan Pemesanan/Penjualan-${existingOrder.customerName}`,
          amount: diff,
          transactionDate: new Date(),
          order: { connect: { id: existingOrder.id } },
          transactionCategory: {
            connect: { categoryId: matchedCategory.categoryId },
          },
        };
        await this.financeRepository.create(payload, tx);
      }

      return 'Berhasil Memperbarui Status Pembayaran';
    });
  }

  async updatePaymentStatus(id: string, paidAmount: number): Promise<string> {
    return await this.recordPayment(id, paidAmount);
  }

  async cancelOrder(id: string): Promise<string> {
    return await this.prisma.$transaction(async (tx) => {
      const matchOrder = await this.ordersRepository.findByIdForUpdate(id, tx);
      if (!matchOrder) throw new BadRequestException('Pesanan Tidak Ditemukan');
      const isNotAllowed = this.validator.isNotAllowedtoUpdate(
        matchOrder.status,
      );
      if (isNotAllowed)
        throw new BadRequestException(
          'Pesanan selesai/dibatalkan Tidak Dapat diperbarui',
        );
      const allocatedItems = matchOrder.orderItems.filter(
        (o) => Number(o.preparedQuantity) > 0,
      );
      // recover item pesanan
      const changeData = allocatedItems.map((a) => {
        return { productId: a.productId, change: 0 };
      });
      const stockChanges = this.calculator.checkStockChange(
        matchOrder.orderItems,
        changeData,
      );
      await this.productRepository.allocateProductStock(stockChanges, tx);
      await this.ordersRepository.updateOrderStatusAsCanceled(id, tx);
      return 'Berhasil Membatalkan Pesanan';
    });
  }
}
