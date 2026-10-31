import axios from 'axios';
import type { ApiResponse, Category, Product, Table, Order, CheckoutResult, TableStatus } from '../types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Tables API
export const tableApi = {
  getAll: async (): Promise<Table[]> => {
    const res = await apiClient.get<ApiResponse<Table[]>>('/tables');
    return res.data.data;
  },
  getById: async (id: string): Promise<Table> => {
    const res = await apiClient.get<ApiResponse<Table>>(`/tables/${id}`);
    return res.data.data;
  },
  updateStatus: async (id: string, status: TableStatus): Promise<Table> => {
    const res = await apiClient.patch<ApiResponse<Table>>(`/tables/${id}/status`, { status });
    return res.data.data;
  },
};

// Categories API
export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },
};

// Products API
export const productApi = {
  getAll: async (categoryId?: string): Promise<Product[]> => {
    const params = categoryId ? { categoryId } : {};
    const res = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return res.data.data;
  },
};

// Orders API
export const orderApi = {
  getActiveByTable: async (tableId: string): Promise<Order | null> => {
    const res = await apiClient.get<ApiResponse<Order | null>>(`/orders/active/table/${tableId}`);
    return res.data.data;
  },
  createOrAppend: async (tableId: string, items: { productId: string; quantity: number }[]): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>('/orders', { tableId, items });
    return res.data.data;
  },
  updateQuantity: async (orderId: string, itemId: string, quantity: number): Promise<Order> => {
    const res = await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/items/${itemId}`, { quantity });
    return res.data.data;
  },
  checkout: async (orderId: string): Promise<CheckoutResult> => {
    const res = await apiClient.post<ApiResponse<CheckoutResult>>(`/orders/${orderId}/checkout`);
    return res.data.data;
  },
  cancel: async (orderId: string): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`);
    return res.data.data;
  },
};
