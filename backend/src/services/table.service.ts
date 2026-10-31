import { prisma } from '../config/prisma';
import { TableStatus } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

export class TableService {
  async getAllTables() {
    return prisma.table.findMany({
      orderBy: { tableNumber: 'asc' },
      include: {
        orders: {
          where: { status: 'OPEN' },
          include: {
            items: {
              include: { product: true },
            },
          },
        },
      },
    });
  }

  async getTableById(id: string) {
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: 'OPEN' },
          include: {
            items: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!table) {
      throw new AppError(404, `Table with ID ${id} not found`);
    }

    return table;
  }

  async createTable(tableNumber?: number) {
    let nextNumber = tableNumber;
    if (!nextNumber) {
      const highestTable = await prisma.table.findFirst({
        orderBy: { tableNumber: 'desc' },
      });
      nextNumber = (highestTable?.tableNumber || 0) + 1;
    }

    const existing = await prisma.table.findUnique({
      where: { tableNumber: nextNumber },
    });

    if (existing) {
      throw new AppError(400, `Table #${nextNumber} already exists`);
    }

    return prisma.table.create({
      data: {
        tableNumber: nextNumber,
        status: TableStatus.AVAILABLE,
      },
    });
  }

  async deleteTable(id: string) {
    const table = await this.getTableById(id);
    const openOrders = table.orders.filter((o) => o.status === 'OPEN');
    if (openOrders.length > 0) {
      throw new AppError(
        400,
        `Cannot delete Table #${table.tableNumber} because it has an active open order`
      );
    }

    // Cascade delete any past closed orders before removing table
    await prisma.order.deleteMany({
      where: { tableId: id },
    });

    return prisma.table.delete({ where: { id } });
  }

  async updateTableStatus(id: string, status: TableStatus) {
    await this.getTableById(id);

    return prisma.table.update({
      where: { id },
      data: { status },
    });
  }
}
