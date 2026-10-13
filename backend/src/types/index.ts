export type TableStatus = 'AVAILABLE' | 'OCCUPIED';
export type OrderStatus = 'OPEN' | 'PAID' | 'CANCELLED';

export interface TableDTO {
  id: string;
  tableNumber: number;
  status: TableStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDTO {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDTO {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  isActive: boolean;
  category?: CategoryDTO;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemDTO {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  product?: ProductDTO;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDTO {
  id: string;
  tableId: string;
  status: OrderStatus;
  totalAmount: number;
  table?: TableDTO;
  items?: OrderItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}

// API Response Envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// DTOs for Actions
export interface CreateProductInput {
  categoryId: string;
  name: string;
  price: number;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface AddOrderItemInput {
  productId: string;
  quantity: number;
}

export interface UpdateOrderItemQuantityInput {
  quantity: number;
}

export interface CheckoutResult {
  orderId: string;
  tableId: string;
  totalAmount: number;
  paidAt: Date;
  tableStatus: TableStatus;
  orderStatus: OrderStatus;
}
