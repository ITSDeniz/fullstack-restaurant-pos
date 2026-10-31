import React, { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { usePosStore } from '../../stores/usePosStore';
import { CategoryNav } from './CategoryNav';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const MenuSection: React.FC = () => {
  const { products, selectedCategoryId, isLoading } = usePosStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategoryId === null || product.categoryId === selectedCategoryId;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Menu Catalog</span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </h2>
          <p className="text-xs text-slate-400">Click any product to add to the active order</p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <CategoryNav />

      {/* Product Grid Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner label="Loading menu items..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800/80 rounded-2xl">
            <p className="text-slate-400 font-medium text-sm">No products found</p>
            <p className="text-slate-600 text-xs mt-1">
              Try adjusting your search query or selecting another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
