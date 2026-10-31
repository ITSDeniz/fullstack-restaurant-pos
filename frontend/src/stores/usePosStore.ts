import { create } from 'zustand';
import type { Table, Category, Product, Order } from '../types';
import { tableApi, categoryApi, productApi, orderApi } from '../services/api';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface PosState {
  tables: Table[];
  selectedTable: Table | null;
  categories: Category[];
  selectedCategoryId: string | null;
  products: Product[];
  activeOrder: Order | null;
  isLoading: boolean;
  isOrderLoading: boolean;
  isCheckingOut: boolean;
  toasts: ToastNotification[];

  // Actions
  fetchInitialData: () => Promise<void>;
  selectTable: (table: Table) => Promise<void>;
  setSelectedCategory: (categoryId: string | null) => void;
  addItemToOrder: (product: Product) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  checkoutCurrentOrder: () => Promise<boolean>;
  cancelCurrentOrder: () => Promise<boolean>;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  tables: [],
  selectedTable: null,
  categories: [],
  selectedCategoryId: null,
  products: [],
  activeOrder: null,
  isLoading: false,
  isOrderLoading: false,
  isCheckingOut: false,
  toasts: [],

  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [tables, categories, products] = await Promise.all([
        tableApi.getAll(),
        categoryApi.getAll(),
        productApi.getAll(),
      ]);

      set({
        tables,
        categories,
        products,
        // Auto-select Table 1 by default if available
        selectedTable: tables.length > 0 ? tables[0] : null,
      });

      if (tables.length > 0) {
        await get().selectTable(tables[0]);
      }
    } catch (error) {
      console.error('Failed to fetch POS initial data:', error);
      get().addToast('error', 'Failed to connect to backend API. Please make sure the server is running.');
    } finally {
      set({ isLoading: false });
    }
  },

  selectTable: async (table: Table) => {
    set({ selectedTable: table, isOrderLoading: true });
    try {
      const activeOrder = await orderApi.getActiveByTable(table.id);
      set({ activeOrder });
    } catch (error) {
      console.error(`Failed to fetch active order for Table #${table.tableNumber}:`, error);
      set({ activeOrder: null });
    } finally {
      set({ isOrderLoading: false });
    }
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategoryId: categoryId });
  },

  addItemToOrder: async (product: Product) => {
    const { selectedTable } = get();
    if (!selectedTable) {
      get().addToast('error', 'Please select a table first!');
      return;
    }

    set({ isOrderLoading: true });
    try {
      const updatedOrder = await orderApi.createOrAppend(selectedTable.id, [
        { productId: product.id, quantity: 1 },
      ]);

      set({ activeOrder: updatedOrder });

      // Refresh table status in state (table will now be OCCUPIED)
      set((state) => ({
        tables: state.tables.map((t) =>
          t.id === selectedTable.id ? { ...t, status: 'OCCUPIED' } : t
        ),
        selectedTable: { ...selectedTable, status: 'OCCUPIED' },
      }));

      get().addToast('success', `Added ${product.name} to Table #${selectedTable.tableNumber}`);
    } catch (error) {
      console.error('Failed to add item to order:', error);
      get().addToast('error', 'Failed to add item to order.');
    } finally {
      set({ isOrderLoading: false });
    }
  },

  updateItemQuantity: async (itemId: string, quantity: number) => {
    const { activeOrder } = get();
    if (!activeOrder) return;

    set({ isOrderLoading: true });
    try {
      const updatedOrder = await orderApi.updateQuantity(activeOrder.id, itemId, quantity);
      set({ activeOrder: updatedOrder });

      // If items are now empty, refresh tables
      if (updatedOrder && updatedOrder.items.length === 0) {
        const refreshedTables = await tableApi.getAll();
        set({ tables: refreshedTables });
      }
    } catch (error) {
      console.error('Failed to update item quantity:', error);
      get().addToast('error', 'Failed to update item quantity.');
    } finally {
      set({ isOrderLoading: false });
    }
  },

  checkoutCurrentOrder: async (): Promise<boolean> => {
    const { activeOrder, selectedTable } = get();
    if (!activeOrder || !selectedTable) return false;

    set({ isCheckingOut: true });
    try {
      const result = await orderApi.checkout(activeOrder.id);

      get().addToast(
        'success',
        `Payment successful! Total: $${Number(result.totalAmount).toFixed(2)}. Table #${selectedTable.tableNumber} is now Available.`
      );

      // Refresh all tables and clear active order
      const refreshedTables = await tableApi.getAll();
      const updatedSelected = refreshedTables.find((t) => t.id === selectedTable.id) || null;

      set({
        tables: refreshedTables,
        selectedTable: updatedSelected,
        activeOrder: null,
      });

      return true;
    } catch (error) {
      console.error('Checkout failed:', error);
      get().addToast('error', 'Checkout failed. Please try again.');
      return false;
    } finally {
      set({ isCheckingOut: false });
    }
  },

  cancelCurrentOrder: async (): Promise<boolean> => {
    const { activeOrder, selectedTable } = get();
    if (!activeOrder || !selectedTable) return false;

    set({ isOrderLoading: true });
    try {
      await orderApi.cancel(activeOrder.id);
      get().addToast('info', `Order cancelled for Table #${selectedTable.tableNumber}.`);

      const refreshedTables = await tableApi.getAll();
      const updatedSelected = refreshedTables.find((t) => t.id === selectedTable.id) || null;

      set({
        tables: refreshedTables,
        selectedTable: updatedSelected,
        activeOrder: null,
      });

      return true;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      get().addToast('error', 'Failed to cancel order.');
      return false;
    } finally {
      set({ isOrderLoading: false });
    }
  },
}));

