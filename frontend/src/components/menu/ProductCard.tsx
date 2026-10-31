import React from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../../types';
import { usePosStore } from '../../stores/usePosStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItemToOrder, isOrderLoading } = usePosStore();

  const numericPrice = Number(product.price).toFixed(2);

  return (
    <div
      onClick={() => {
        if (!isOrderLoading) {
          addItemToOrder(product);
        }
      }}
      className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-orange-500/5 active:scale-[0.98]"
    >
      <div>
        {/* Category tag & status */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700/40">
            {product.category?.name || 'Menu'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-slate-100 text-sm md:text-base leading-snug group-hover:text-orange-400 transition-colors line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Price & Add Button */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-medium">Price</span>
          <p className="font-extrabold text-base md:text-lg text-emerald-400">
            ${numericPrice}
          </p>
        </div>

        <button
          className="w-8 h-8 rounded-xl bg-orange-500/10 group-hover:bg-orange-500 text-orange-400 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
          title="Add to order"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

