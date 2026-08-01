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
import { OrdersHelper } from '../helper/orders.helper';

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private productRepository: ProductRepository,
    private prisma: PrismaService,
    private helper: OrdersHelper,
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
    const mergedItem = this.helper.normalizeOrderItems(order.orderItems);
    const productIds = mergedItem.map((item) => item.productId); // ada 2 id sama blm termerge (merge dulu)
    const products = await this.productRepository.findManyByIds(productIds); // hanya 1
    const foundIds = new Set(products.map((p) => p.id));
    const missingIds = productIds.filter((i) => !foundIds.has(i));
    if (products.length !== productIds.length) {
      throw new NotFoundException(
        `Products not found: ${missingIds.join(', ')}`,
      );
    }
    /* Perhitungan bisnis: hitung total harga, subTotal item, dkk. */
    const productMap = new Map(products.map((p) => [p.id, p])); // model product key-value
    const eachOrderItem = mergedItem.map((item) => {
      const product = productMap.get(item.productId)!;
      //skip tolak < stok, kmungkinan butuh catat lebih
      if (item.quantity <= 0) {
        throw new BadRequestException('Invalid Order Item Quantity');
      }
      return {
        quantity: item.quantity,
        priceSnapshot: product.price,
        subtotal: product.price * item.quantity,
        product: {
          connect: { id: item.productId },
        },
      };
    });
    const totalAmount = eachOrderItem.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    let paymentStatus = order.paymentStatus;
    if (Number(order.paidAmount) < 0) {
      throw new BadRequestException('Invalid paidAmount, non-negative');
    }
    if (Number(order.paidAmount) > totalAmount) {
      throw new BadRequestException('Invalid paidAmount, above total');
    }
    if (order.paidAmount === totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (order.paidAmount === 0) {
      paymentStatus = PaymentStatus.UNPAID;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }
    if (order.pickupDate) {
      const datePickup = new Date(order.pickupDate);
      datePickup.setHours(0, 0, 0, 0);
      const currentTime = new Date();
      currentTime.setHours(0, 0, 0, 0);
      if (datePickup < currentTime) {
        throw new BadRequestException('Invalid pickupDate, below currentTime');
      }
    }
    const finalOrder = {
      ...order,
      totalAmount: totalAmount,
      orderItems: {
        create: eachOrderItem,
      },
      pickupDate: order.pickupDate ? new Date(order.pickupDate) : new Date(),
      paymentStatus,
      orderType: order.orderType,
    };
    const createdOrder = await this.ordersRepository.create(finalOrder);
    return createdOrder.id;
  }

  async updateOrder(id: string, order: UpdateOrderDto): Promise<string> {
    const existingOrder = await this.ordersRepository.findById(id);
    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }
    if (
      existingOrder.status === OrderStatus.COMPLETED ||
      existingOrder.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Completed/Cancelled orders cannot be updated',
      );
    }
    if (order.pickupDate) {
      const pickupDate = new Date(order.pickupDate);
      pickupDate.setHours(0, 0, 0, 0);
      const currentTime = new Date();
      currentTime.setHours(0, 0, 0, 0);
      if (pickupDate < currentTime) {
        throw new BadRequestException('Invalid pickupDate, below current Date');
      }
    }
    if (
      /* misal ada di payload, harusnya existing ada */
      (!order.orderItems || order.orderItems?.length === 0) &&
      existingOrder.orderItems.length === 0
    ) {
      throw new BadRequestException('Invalid Order Items, at least 1 product');
    }

    let paymentStatus = order.paymentStatus;
    let currentStatus = existingOrder.status;

    const mergedItems = this.helper.normalizeOrderItems(order.orderItems!);
    const productIds = mergedItems?.map((item) => item.productId);
    /* Kalau ada perubahan di items */
    if (productIds && productIds.length > 0) {
      const products = await this.productRepository.findManyByIds(productIds);
      const foundIds = new Set(products.map((p) => p.id));
      const missingIds = productIds.filter((i) => !foundIds.has(i));
      if (products.length !== productIds.length) {
        throw new NotFoundException(
          `Products not found: ${missingIds.join(', ')}`,
        );
      }
      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products not found');
      }
      const productMap = new Map(products.map((p) => [p.id, p]));
      const changeData: { productId: string; change: number }[] = [];
      const eachOrderItem = mergedItems?.map((item) => {
        const product = productMap.get(item.productId)!;
        if (item.quantity <= 0) {
          throw new BadRequestException('Invalid Order Item Quantity');
        }
        if (Number(item.preparedQuantity) < 0) {
          throw new BadRequestException('Invalid Order Item preparedQuantity');
        }
        if (Number(item.preparedQuantity) > item.quantity) {
          throw new BadRequestException(
            'Invalid preparedQuantity, above ordered quantity',
          );
        }
        changeData.push({
          productId: item.productId,
          change: item.preparedQuantity || 0,
        });
        return {
          quantity: item.quantity,
          preparedQuantity: item.preparedQuantity,
          priceSnapshot: product.price,
          product: {
            connect: { id: item.productId },
          },
          subtotal: product.price * item.quantity,
        };
      });
      /* Validasi Status pembayaran */
      const newTotalAmount = eachOrderItem?.reduce((a, v) => a + v.subtotal, 0);
      if (Number(order.paidAmount) < 0) {
        throw new BadRequestException('Invalid paidAmount, non-negative');
      }
      if (Number(order.paidAmount) > Number(newTotalAmount)) {
        throw new BadRequestException('Invalid paidAmount, above total');
      }
      if (order.paidAmount === Number(newTotalAmount)) {
        paymentStatus = PaymentStatus.PAID;
      } else if (order.paidAmount === 0) {
        paymentStatus = PaymentStatus.UNPAID;
      } else {
        paymentStatus = PaymentStatus.PARTIAL;
      }
      const isReady = eachOrderItem?.every(
        (o) => Number(o.preparedQuantity) === Number(o.quantity),
      );
      const isOnProgress = eachOrderItem?.some(
        (o) => Number(o.preparedQuantity) > 0,
      );
      if (isReady) {
        currentStatus = OrderStatus.READY;
      } else if (isOnProgress) {
        currentStatus = OrderStatus.PREPARING;
      } else {
        currentStatus = OrderStatus.PENDING;
      }

      /* orderItems baru -> timpa yang lama */
      const finalupdate = {
        ...order,
        pickupDate: order.pickupDate ? new Date(order.pickupDate) : undefined,
        paymentStatus: paymentStatus,
        status: currentStatus,
        totalAmount: newTotalAmount,
        orderItems: {
          deleteMany: {},
          create: eachOrderItem,
        },
      };
      const stockChanges = this.helper.checkItemChanges(
        existingOrder.orderItems,
        changeData,
      );
      await this.prisma.$transaction(async (tx) => {
        await this.productRepository.allocateProductStock(stockChanges, tx);
        await this.ordersRepository.update(id, finalupdate, tx);
      });
      return 'Berhasil Memperbarui Pesanan';
    }
    /* Case Kalau tidak ada perubahan item */
    const totalAmount = existingOrder.orderItems?.reduce(
      (a, v) => a + v.subtotal,
      0,
    );
    if (Number(order.paidAmount) < 0) {
      throw new BadRequestException('Invalid paidAmount, non-negative');
    }
    if (Number(order.paidAmount) > Number(totalAmount)) {
      throw new BadRequestException('Invalid paidAmount, above total');
    }
    if (order.paidAmount === Number(totalAmount)) {
      paymentStatus = PaymentStatus.PAID;
    } else if (order.paidAmount === 0) {
      paymentStatus = PaymentStatus.UNPAID;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }
    const isReady = existingOrder.orderItems?.every(
      (o) => Number(o.preparedQuantity) === Number(o.quantity),
    );
    const isOnProgress = existingOrder.orderItems?.some(
      (o) => Number(o.preparedQuantity) > 0,
    );
    if (isReady) {
      currentStatus = OrderStatus.READY;
    } else if (isOnProgress) {
      currentStatus = OrderStatus.PREPARING;
    } else {
      currentStatus = OrderStatus.PENDING;
    }

    const finalupdate = {
      ...order,
      pickupDate: order.pickupDate ? new Date(order.pickupDate) : undefined,
      paymentStatus: paymentStatus,
      status: currentStatus,
      totalAmount: totalAmount,
      orderItems: undefined,
    };
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
