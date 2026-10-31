import React from 'react';
import { usePosStore } from '../../stores/usePosStore';

export const CategoryNav: React.FC = () => {
  const { categories, selectedCategoryId, setSelectedCategory, products } = usePosStore();

  const totalProducts = products.length;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 mb-4 no-scrollbar">
      {/* "All" button */}
      <button
        onClick={() => setSelectedCategory(null)}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-2 ${
          selectedCategoryId === null
            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
        }`}
      >
        <span>All Items</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            selectedCategoryId === null
              ? 'bg-orange-600 text-white'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {totalProducts}
        </span>
      </button>

      {/* Dynamic categories */}
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        const count = products.filter((p) => p.categoryId === category.id).length;

        return (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-2 ${
              isSelected
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <span>{category.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

