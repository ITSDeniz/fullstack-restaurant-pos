import { prisma } from '../config/prisma';

export class CategoryService {
  async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
