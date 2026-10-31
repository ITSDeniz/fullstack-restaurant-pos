import React, { useState } from 'react';
import { ShoppingBag, CreditCard, XCircle, AlertCircle } from 'lucide-react';
import { usePosStore } from '../../stores/usePosStore';
import { CartItemRow } from './CartItem';
import { CheckoutModal } from './CheckoutModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { Order, Table } from '../../types';

export const CartPanel: React.FC = () => {
  const {
    selectedTable,
    activeOrder,
    isOrderLoading,
    isCheckingOut,
    checkoutCurrentOrder,
    cancelCurrentOrder,
  } = usePosStore();

  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [lastTable, setLastTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const items = activeOrder?.items || [];
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  const grandTotal = Number(activeOrder?.totalAmount || 0).toFixed(2);
  const vatAmount = (Number(grandTotal) * 0.1).toFixed(2);
  const netAmount = (Number(grandTotal) - Number(vatAmount)).toFixed(2);

  const handleCheckout = async () => {
    if (!activeOrder || items.length === 0 || !selectedTable) return;

    // Cache current order and table snapshot for the receipt modal
    setLastCompletedOrder(activeOrder);
    setLastTable(selectedTable);

    const success = await checkoutCurrentOrder();
    if (success) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="w-full lg:w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl shrink-0">
        {/* Panel Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {selectedTable ? `Table #${selectedTable.tableNumber}` : 'Select a Table'}
                </h3>
                {selectedTable && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedTable.status === 'OCCUPIED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {selectedTable.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {items.length > 0
                  ? `${itemCount} items currently active`
                  : 'No items in order'}
              </p>
            </div>
          </div>

          {/* Cancel Order Action */}
          {activeOrder && items.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this entire order?')) {
                  cancelCurrentOrder();
                }
              }}
              disabled={isOrderLoading || isCheckingOut}
              className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors disabled:opacity-50"
              title="Cancel Order"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Order Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isOrderLoading && items.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <LoadingSpinner label="Fetching order..." />
            </div>
          ) : !selectedTable ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <AlertCircle className="w-10 h-10 mb-2 opacity-40 text-orange-400" />
              <p className="font-semibold text-sm text-slate-300">No Table Selected</p>
              <p className="text-xs mt-1">Select a table from the top bar to view or start an order.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 border-2 border-dashed border-slate-800/80 rounded-2xl">
              <ShoppingBag className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
              <p className="font-semibold text-sm text-slate-300">Order is Empty</p>
              <p className="text-xs mt-1 text-slate-500">
                Click items on the left menu to add them to Table #{selectedTable.tableNumber}.
              </p>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>

        {/* Panel Footer: Summary & Checkout Button */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60">
          <div className="space-y-2 mb-4 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Net Subtotal</span>
              <span className="font-mono text-slate-200">${netAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT / Tax (10%)</span>
              <span className="font-mono text-slate-200">${vatAmount}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Grand Total</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ${grandTotal}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={!activeOrder || items.length === 0 || isCheckingOut || isOrderLoading}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-[0.98] ${
              !activeOrder || items.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 ring-2 ring-orange-400/20'
            }`}
          >
            {isCheckingOut ? (
              <LoadingSpinner size="sm" label="Processing Transaction..." />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pay & Checkout (${grandTotal})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Confirmation on Checkout */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={lastCompletedOrder}
        table={lastTable}
      />
    </>
  );
};
