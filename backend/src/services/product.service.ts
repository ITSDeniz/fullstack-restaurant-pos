import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { CreateProductInput, UpdateProductInput } from '../types';

export class ProductService {
  async getAllProducts(categoryId?: string, includeInactive = false) {
    return prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(!includeInactive ? { isActive: true } : {}),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new AppError(404, `Product with ID ${id} not found`);
    }

    return product;
  }

  async createProduct(input: CreateProductInput) {
    return prisma.product.create({
      data: {
        name: input.name,
        price: input.price,
        categoryId: input.categoryId,
        isActive: true,
      },
      include: { category: true },
    });
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    await this.getProductById(id);

    return prisma.product.update({
      where: { id },
      data: input,
      include: { category: true },
    });
  }

  // Soft delete: Do NOT delete from DB, mark isActive = false
  async softDeleteProduct(id: string) {
    await this.getProductById(id);

    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
