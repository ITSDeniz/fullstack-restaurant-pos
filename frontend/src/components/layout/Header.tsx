import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, RefreshCw, Layers } from 'lucide-react';
import { usePosStore } from '../../stores/usePosStore';

export const Header: React.FC = () => {
  const { tables, fetchInitialData, isLoading } = usePosStore();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Brand & Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg text-white tracking-tight">GourmetPOS</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">
              POS Terminal
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Decoupled Architecture Edition</p>
        </div>
      </div>

      {/* Table Statistics & Clock */}
      <div className="flex items-center gap-4">
        {/* Table Metrics */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800/80 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{availableCount} Available</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{occupiedCount} Occupied</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{tables.length} Tables</span>
          </div>
        </div>

        {/* Live Clock */}
        <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono text-xs font-medium text-slate-300 tracking-wider">
          {time || '--:--:--'}
        </div>

        {/* Sync Button */}
        <button
          onClick={() => fetchInitialData()}
          disabled={isLoading}
          title="Refresh Data from Server"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
