export type TableStatus = 'AVAILABLE' | 'OCCUPIED';
export type OrderStatus = 'OPEN' | 'PAID' | 'CANCELLED';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: string | number;
  isActive: boolean;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  subTotal: string | number;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  tableId: string;
  status: OrderStatus;
  totalAmount: string | number;
  items: OrderItem[];
  table?: Table;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  tableNumber: number;
  status: TableStatus;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface CheckoutResult {
  orderId: string;
  tableId: string;
  totalAmount: string | number;
  orderStatus: OrderStatus;
  tableStatus: TableStatus;
  paidAt: string;
}

// Temporary in-memory cart item for unsaved changes or optimistic updates
export interface LocalCartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}
