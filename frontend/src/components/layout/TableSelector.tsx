import React from 'react';
import { usePosStore } from '../../stores/usePosStore';
import type { Table } from '../../types';

export const TableSelector: React.FC = () => {
  const { tables, selectedTable, selectTable } = usePosStore();

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0 mr-1">
        Tables:
      </span>

      {tables.map((table: Table) => {
        const isSelected = selectedTable?.id === table.id;
        const isOccupied = table.status === 'OCCUPIED';

        return (
          <button
            key={table.id}
            onClick={() => selectTable(table)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
              isSelected
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/40'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSelected
                  ? 'bg-white'
                  : isOccupied
                  ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                  : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
              }`}
            />
            <span>Table {table.tableNumber}</span>

            {isOccupied && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-orange-600 text-white' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                OCCUPIED
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
