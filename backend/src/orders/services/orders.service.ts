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
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { OrdersCalculator } from './orders-calculator.service';
import { OrdersValidator } from './orders-validator.service';

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private productRepository: ProductRepository,
    private prisma: PrismaService,
    private calculator: OrdersCalculator,
    private validator: OrdersValidator,
  ) {}
  async getOrders(): Promise<OrderResponseDto[]> {
    return this.ordersRepository.findall();
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
    const mergedItem = this.calculator.mergeDuplicateItem(order.orderItems);
    const productIds = mergedItem.map((item) => item.productId); // ada 2 id sama blm termerge (merge dulu)
    const products = await this.productRepository.findManyByIds(productIds); // hanya 1
    const isMissing = this.validator.isProductNotFound(products, productIds);
    if (isMissing.length > 0) {
      throw new NotFoundException(
        `Produk Tidak Ditemukan: ${isMissing.join(', ')}`,
      );
    }
    /* Perhitungan bisnis: hitung total harga, subTotal item, dkk. */
    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderItems = this.calculator.buildOrderItems(mergedItem, productMap);
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    this.validator.checkIsValidPaidAmount(
      Number(order.paidAmount),
      totalAmount,
    );
    let paymentStatus = order.paymentStatus || PaymentStatus.UNPAID;
    paymentStatus = this.calculator.paymentStatusSetter(
      Number(order.paidAmount),
      totalAmount,
      paymentStatus,
    );
    if (order.pickupDate) {
      const isValidDate = this.validator.isValidDate(order.pickupDate);
      if (!isValidDate) {
        throw new BadRequestException(
          'Tanggal Pengambilan Invalid, harus di atas hari ini',
        );
      }
    }
    const finalOrder = this.calculator.buildFinalCreateOrder(
      order,
      orderItems,
      totalAmount,
      paymentStatus,
    );
    const createdOrder = await this.ordersRepository.create(finalOrder);
    return createdOrder.id;
  }

  async updateOrder(id: string, order: UpdateOrderDto): Promise<string> {
    const existingOrder = await this.ordersRepository.findById(id);
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
          'Tanggal Pengambilan di bawah hari ini Invalid',
        );
      }
    }
    if (
      /* misal ada di payload, harusnya existing ada */
      (!order.orderItems || order.orderItems?.length === 0) &&
      existingOrder.orderItems.length === 0
    ) {
      throw new BadRequestException('Item Pesanan Invalid, minimal 1 buah');
    }

    let paymentStatus = order.paymentStatus || PaymentStatus.UNPAID;
    let currentStatus = existingOrder.status;

    /* Masalah Sekarang, kalau order lama ada, dan baru ada blm fully merged */
    const mergedItems = this.calculator.mergeDuplicateItem(order.orderItems!);
    const productIds = mergedItems?.map((item) => item.productId);
    const products = await this.productRepository.findManyByIds(productIds);
    /* Kalau ada perubahan di items */
    if (productIds && productIds.length > 0) {
      const isMissing = this.validator.isProductNotFound(products, productIds);
      if (isMissing.length > 0) {
        throw new NotFoundException(
          `Produk Tidak ditemukan: ${isMissing.join(', ')}`,
        );
      }
      // bandingkan payload.prepared dgn matchproduct
      const productMap = new Map(products.map((p) => [p.id, p]));
      const changeData: { productId: string; change: number }[] = [];
      if (order.orderItems) {
        const OrderItems = this.calculator.buildOrderItems(
          mergedItems,
          productMap,
          changeData,
        );
        /* Validasi Status pembayaran */
        const newTotalAmount = OrderItems?.reduce((a, v) => a + v.subtotal, 0);
        this.validator.checkIsValidPaidAmount(
          Number(order.paidAmount),
          newTotalAmount,
        );
        paymentStatus = this.calculator.paymentStatusSetter(
          Number(order.paidAmount),
          newTotalAmount,
          paymentStatus,
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
        // console.log('cek changes: ', stockChanges);
        for (const p of stockChanges) {
          const matchProduct = products.find((pr) => pr.id === p.productId);
          if (matchProduct && matchProduct.stock < Number(-p?.change)) {
            throw new BadRequestException(
              'Alokasi stok invalid, di atas stok saat ini',
            );
          }
        }
        await this.prisma.$transaction(async (tx) => {
          try {
            await this.productRepository.allocateProductStock(stockChanges, tx);
            await this.ordersRepository.update(id, finalupdate, tx);
          } catch (error) {
            console.log(error);
          }
        });
        return 'Berhasil Memperbarui Pesanan';
      }
    }
    /* Case Kalau tidak ada perubahan item */
    const totalAmount = existingOrder.orderItems?.reduce(
      (a, v) => a + v.subtotal,
      0,
    );
    this.validator.checkIsValidPaidAmount(
      Number(order.paidAmount),
      totalAmount,
    );
    paymentStatus = this.calculator.paymentStatusSetter(
      Number(order.paidAmount),
      totalAmount,
      paymentStatus,
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
    await this.ordersRepository.update(id, finalupdate, this.prisma);
    return 'Berhasil Memperbarui Pesanan';
  }
  async updateStatusAsCompleted(id: string): Promise<string> {
    const existingOrder = await this.ordersRepository.findById(id);
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
      throw new BadRequestException('Gagal Memperbarui Status, Belum dilunasi');
    }
    const notAllowedUpdate = existingOrder.orderItems.some(
      (o) => o.preparedQuantity !== o.quantity,
    );
    if (notAllowedUpdate) {
      throw new BadRequestException('Gagal Memperbarui Status, Belum Dipenuhi');
    }
    await this.ordersRepository.updateOrderStatusAsCompleted(id);
    return 'Berhasil Memperbarui Status Pemesanan';
  }
  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<string> {
    const existingOrder = await this.ordersRepository.findById(id);
    if (!existingOrder) throw new NotFoundException('Order not found');
    if (
      existingOrder.status === OrderStatus.CANCELLED ||
      existingOrder.paymentStatus === PaymentStatus.PAID
    ) {
      throw new BadRequestException('Gagal Memperbarui Status Pembayaran');
    }
    await this.ordersRepository.updatePaymentStatus(id, paymentStatus);

    return 'Berhasil Memperbarui Status Pembayaran';
  }
  async deleteOrder(id: string): Promise<string> {
    await this.ordersRepository.delete(id);
    return 'Berhasil Menghapus Pesanan';
  }
}
