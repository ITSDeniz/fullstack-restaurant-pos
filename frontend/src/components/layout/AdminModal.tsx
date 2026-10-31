import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, Utensils } from 'lucide-react';
import { tableApi, productApi } from '../../services/api';
import { usePosStore } from '../../stores/usePosStore';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { tables, categories, products, fetchInitialData, addToast } = usePosStore();
  const [activeTab, setActiveTab] = useState<'tables' | 'products'>('tables');

  // Product Form State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState(categories[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Next Table Number
  const maxTableNumber = tables.reduce((max, t) => Math.max(max, t.tableNumber), 0);
  const nextTableNumber = maxTableNumber + 1;

  const handleAddTable = async () => {
    setIsSubmitting(true);
    try {
      await tableApi.create(nextTableNumber);
      addToast('success', `Table #${nextTableNumber} added successfully!`);
      await fetchInitialData();
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Failed to add table');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async (id: string, num: number) => {
    if (!window.confirm(`Are you sure you want to remove Table #${num}?`)) return;

    setIsSubmitting(true);
    try {
      await tableApi.delete(id);
      addToast('success', `Table #${num} deleted successfully!`);
      await fetchInitialData();
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Cannot delete occupied table');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productPrice || !productCategory) {
      addToast('error', 'Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await productApi.create({
        name: productName,
        price: parseFloat(productPrice),
        categoryId: productCategory,
      });

      addToast('success', `Product "${productName}" added to menu!`);
      setProductName('');
      setProductPrice('');
      await fetchInitialData();
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSoftDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Archive "${name}" from menu? (Past orders will remain safe)`)) return;

    setIsSubmitting(true);
    try {
      await productApi.delete(id);
      addToast('info', `Archived "${name}"`);
      await fetchInitialData();
    } catch (error) {
      addToast('error', 'Failed to archive product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h3 className="font-extrabold text-lg text-white">POS Management</h3>
            <p className="text-xs text-slate-400">Add or manage restaurant tables & catalog</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'tables'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tables ({tables.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'tables' ? (
            <div className="space-y-4">
              {/* Quick Add Table Button */}
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Add Next Table</h4>
                  <p className="text-xs text-slate-400">
                    Will create <strong>Table #{nextTableNumber}</strong> automatically
                  </p>
                </div>
                <button
                  onClick={handleAddTable}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Table #{nextTableNumber}</span>
                </button>
              </div>

              {/* Table List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                  Active Tables
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            table.status === 'OCCUPIED' ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="font-bold text-xs text-slate-200">
                          Table {table.tableNumber}
                        </span>
                      </div>

                      {table.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleDeleteTable(table.id, table.tableNumber)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Delete Table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add Product Form */}
              <form
                onSubmit={handleAddProduct}
                className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-3"
              >
                <h4 className="font-bold text-sm text-white">Create New Product</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Avocado Toast"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/60"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="e.g. 11.50"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={productCategory || categories[0]?.id}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/60"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product to POS</span>
                </button>
              </form>

              {/* Products List with Soft-delete Archive button */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                  Active Products Catalog
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-950/60 border border-slate-800/80 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white mr-2">{p.name}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                          {p.category?.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-400">
                          ${Number(p.price).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleSoftDeleteProduct(p.id, p.name)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Archive Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
