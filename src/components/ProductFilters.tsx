import React from 'react';
import { useSearch } from '../context/SearchContext';
import { CATEGORIES } from '../data/products';
import { SlidersHorizontal, ArrowUpDown, X, RotateCcw } from 'lucide-react';

interface ProductFiltersProps {
  totalResults: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ totalResults }) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    resetFilters,
  } = useSearch();

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All' || sortBy !== 'featured';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Results Count & Current Filter Label */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9f2066]" />
            <span>Products</span>
            <span className="text-slate-400">({totalResults} items found)</span>
          </div>

          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 text-xs bg-pink-50 text-[#9f2066] border border-pink-200 px-2 py-0.5 rounded-md font-medium">
              <span>{selectedCategory}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="hover:text-pink-900 cursor-pointer"
                aria-label="Clear category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
              <span>"{searchQuery}"</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="hover:text-slate-900 cursor-pointer"
                aria-label="Clear search keyword"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:underline ml-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          )}
        </div>

        {/* Sorting Dropdown & Category Quick Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <label htmlFor="category-select" className="font-medium whitespace-nowrap">
              Category:
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-pink-500 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="sort-select" className="font-medium whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-pink-500 outline-none"
            >
              <option value="featured">Featured / Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Customer Rating: High to Low</option>
              <option value="discount-desc">Biggest Discount %</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
