import React from 'react';
import { CheckCircle2, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Order, Table } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  table: Table | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  order,
  table,
}) => {
  if (!isOpen || !order || !table) return null;

  const total = Number(order.totalAmount).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-white">Payment Received!</h3>
          <p className="text-xs text-slate-400 mt-1">
            Atomic transaction successfully committed.
          </p>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Table #{table.tableNumber} status released to AVAILABLE</span>
          </div>
        </div>

        {/* Order Receipt Details */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 my-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              Order ID
            </span>
            <span className="font-mono text-slate-300">{order.id.slice(0, 8)}...</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Items Ordered</span>
            <span className="font-semibold text-slate-200">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800 font-bold">
            <span className="text-slate-200">Amount Paid</span>
            <span className="text-emerald-400 font-mono text-base">${total}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <span>Done & Back to POS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
