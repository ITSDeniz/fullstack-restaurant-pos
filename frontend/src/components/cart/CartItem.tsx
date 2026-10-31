import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { OrderItem } from '../../types';
import { usePosStore } from '../../stores/usePosStore';

interface CartItemProps {
  item: OrderItem;
}

export const CartItemRow: React.FC<CartItemProps> = ({ item }) => {
  const { updateItemQuantity, isOrderLoading } = usePosStore();

  const unitPrice = Number(item.unitPrice).toFixed(2);
  const subTotal = Number(item.subTotal).toFixed(2);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col gap-2.5 transition-all hover:border-slate-700/80">
      {/* Product Name & Subtotal */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-bold text-sm text-slate-100 leading-snug">
            {item.product?.name || 'Item'}
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            ${unitPrice} each
          </span>
        </div>

        <div className="text-right">
          <span className="font-extrabold text-sm text-emerald-400 font-mono">
            ${subTotal}
          </span>
        </div>
      </div>

      {/* Quantity & Action Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
        {/* Remove Button */}
        <button
          onClick={() => updateItemQuantity(item.id, 0)}
          disabled={isOrderLoading}
          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors disabled:opacity-50"
          title="Remove item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Counter (+ / -) */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
          <button
            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
            disabled={isOrderLoading}
            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
            title="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="w-6 text-center text-xs font-bold font-mono text-white">
            {item.quantity}
          </span>

          <button
            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
            disabled={isOrderLoading}
            className="w-6 h-6 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
            title="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

