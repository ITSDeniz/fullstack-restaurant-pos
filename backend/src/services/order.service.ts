import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { OrderStatus, TableStatus, Prisma } from '@prisma/client';

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export class OrderService {
  async getActiveOrderByTable(tableId: string) {
    return prisma.order.findFirst({
      where: {
        tableId,
        status: OrderStatus.OPEN,
      },
      include: {
        table: true,
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new AppError(404, `Order with ID ${orderId} not found`);
    }

    return order;
  }

  // Create new order or append to existing open order
  async createOrAppendOrder(tableId: string, items: OrderItemInput[]) {
    // 1. Verify Table exists
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new AppError(404, `Table with ID ${tableId} not found`);
    }

    // 2. Fetch all products to capture unit_price snapshot
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true, // Only allow ordering active products
      },
    });

    if (products.length !== productIds.length) {
      throw new AppError(400, 'One or more selected products are invalid or inactive');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Check if table already has an OPEN order
    let existingOrder = await prisma.order.findFirst({
      where: { tableId, status: OrderStatus.OPEN },
      include: { items: true },
    });

    return prisma.$transaction(async (tx) => {
      let orderId: string;

      if (!existingOrder) {
        // Create new order
        const createdOrder = await tx.order.create({
          data: {
            tableId,
            status: OrderStatus.OPEN,
            totalAmount: 0,
          },
        });
        orderId = createdOrder.id;

        // Set table status to OCCUPIED
        await tx.table.update({
          where: { id: tableId },
          data: { status: TableStatus.OCCUPIED },
        });
      } else {
        orderId = existingOrder.id;
      }

      // Add or update order items
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        const unitPrice = new Prisma.Decimal(product.price);

        const existingItem = await tx.orderItem.findFirst({
          where: { orderId, productId: item.productId },
        });

        if (existingItem) {
          const newQuantity = existingItem.quantity + item.quantity;
          const subTotal = unitPrice.mul(newQuantity);

          await tx.orderItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQuantity,
              subTotal,
            },
          });
        } else {
          const subTotal = unitPrice.mul(item.quantity);

          await tx.orderItem.create({
            data: {
              orderId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice, // SNAPSHOT of product price at order time
              subTotal,
            },
          });
        }
      }

      // Recalculate total_amount for the order
      const allItems = await tx.orderItem.findMany({ where: { orderId } });
      const grandTotal = allItems.reduce(
        (sum, it) => sum.add(it.subTotal),
        new Prisma.Decimal(0)
      );

      await tx.order.update({
        where: { id: orderId },
        data: { totalAmount: grandTotal },
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          table: true,
          items: {
            include: { product: true },
          },
        },
      });
    });
  }

  // Update item quantity (0 removes the item)
  async updateOrderItemQuantity(orderId: string, orderItemId: string, quantity: number) {
    const order = await this.getOrderById(orderId);
    if (order.status !== OrderStatus.OPEN) {
      throw new AppError(400, 'Cannot modify a closed or cancelled order');
    }

    return prisma.$transaction(async (tx) => {
      if (quantity <= 0) {
        // Remove item from order
        await tx.orderItem.delete({ where: { id: orderItemId } });
      } else {
        const item = await tx.orderItem.findUnique({ where: { id: orderItemId } });
        if (!item) {
          throw new AppError(404, 'Order item not found');
        }

        const subTotal = new Prisma.Decimal(item.unitPrice).mul(quantity);
        await tx.orderItem.update({
          where: { id: orderItemId },
          data: { quantity, subTotal },
        });
      }

      // Recalculate total order amount
      const remainingItems = await tx.orderItem.findMany({ where: { orderId } });
      const grandTotal = remainingItems.reduce(
        (sum, it) => sum.add(it.subTotal),
        new Prisma.Decimal(0)
      );

      await tx.order.update({
        where: { id: orderId },
        data: { totalAmount: grandTotal },
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          table: true,
          items: {
            include: { product: true },
          },
        },
      });
    });
  }

  /**
   * ATOMIC CHECKOUT TRANSACTION
   * 1. Order status is updated to PAID
   * 2. Associated Table status is set to AVAILABLE
   * If any step fails, all operations roll back atomically.
   */
  async checkoutOrder(orderId: string) {
    const order = await this.getOrderById(orderId);

    if (order.status !== OrderStatus.OPEN) {
      throw new AppError(400, `Order is already ${order.status.toLowerCase()}`);
    }

    if (order.items.length === 0) {
      throw new AppError(400, 'Cannot checkout an empty order');
    }

    // Atomic transaction across Order & Table
    return prisma.$transaction(async (tx) => {
      // Step 1: Update order status to PAID
      const paidOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });

      // Step 2: Release Table back to AVAILABLE
      const updatedTable = await tx.table.update({
        where: { id: order.tableId },
        data: { status: TableStatus.AVAILABLE },
      });

      return {
        orderId: paidOrder.id,
        tableId: updatedTable.id,
        totalAmount: paidOrder.totalAmount,
        orderStatus: paidOrder.status,
        tableStatus: updatedTable.status,
        paidAt: paidOrder.updatedAt,
      };
    });
  }

  // Cancel order & release table if empty
  async cancelOrder(orderId: string) {
    const order = await this.getOrderById(orderId);

    if (order.status !== OrderStatus.OPEN) {
      throw new AppError(400, `Order cannot be cancelled because it is ${order.status}`);
    }

    return prisma.$transaction(async (tx) => {
      const cancelledOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.table.update({
        where: { id: order.tableId },
        data: { status: TableStatus.AVAILABLE },
      });

      return cancelledOrder;
    });
  }
}
