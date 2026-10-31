import React, { useState, useEffect } from 'react';
import { X, Receipt, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { orderApi } from '../../services/api';
import type { Order } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load order history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Order History</h3>
              <p className="text-xs text-slate-400">All completed and closed POS transactions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner label="Loading past receipts..." />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm text-slate-300">No Orders Found</p>
              <p className="text-xs mt-1 text-slate-500">
                Completed orders will appear here automatically after checkout.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isPaid = order.status === 'PAID';
              const isCancelled = order.status === 'CANCELLED';
              const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeStr = new Date(order.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 hover:border-slate-700 transition-all"
                >
                  {/* Top Bar: Table, Status & Total */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-sm text-white">
                        Table {order.table?.tableNumber || '?'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isCancelled
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isPaid && <CheckCircle className="w-3 h-3" />}
                        {isCancelled && <XCircle className="w-3 h-3" />}
                        <span>{order.status}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-extrabold text-base text-emerald-400">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-slate-300 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-slate-400">
                        <span>
                          {item.quantity}x {item.product?.name || 'Item'}
                        </span>
                        <span className="font-mono text-slate-300">
                          ${Number(item.subTotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer with date & time */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-800/40 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {timeStr}
                    </span>
                    <span className="text-slate-600">ID: {order.id.slice(0, 8)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
