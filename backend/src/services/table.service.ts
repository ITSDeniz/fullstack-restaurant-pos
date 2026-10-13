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

  async updateTableStatus(id: string, status: TableStatus) {
    await this.getTableById(id);

    return prisma.table.update({
      where: { id },
      data: { status },
    });
  }
}
