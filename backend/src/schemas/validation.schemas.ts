import { z } from 'zod';

export const updateTableStatusSchema = z.object({
  body: z.object({
    status: z.enum(['AVAILABLE', 'OCCUPIED'], {
      required_error: 'Status is required and must be AVAILABLE or OCCUPIED',
    }),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid({ message: 'Valid categoryId is required' }),
    name: z.string().min(2, { message: 'Product name must have at least 2 characters' }),
    price: z.number().positive({ message: 'Price must be greater than 0' }),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid().optional(),
    name: z.string().min(2).optional(),
    price: z.number().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    tableId: z.string().uuid({ message: 'Valid tableId is required' }),
    items: z
      .array(
        z.object({
          productId: z.string().uuid({ message: 'Valid productId is required' }),
          quantity: z.number().int().positive({ message: 'Quantity must be at least 1' }),
        })
      )
      .min(1, { message: 'At least one item is required to create an order' }),
  }),
});

export const addItemsToOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid({ message: 'Valid productId is required' }),
          quantity: z.number().int().positive({ message: 'Quantity must be at least 1' }),
        })
      )
      .min(1, { message: 'At least one item is required' }),
  }),
});

export const updateOrderItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0, { message: 'Quantity must be 0 or greater' }),
  }),
});
