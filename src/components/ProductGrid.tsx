import React from 'react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { SearchX, RotateCcw } from 'lucide-react';
import { useSearch } from '../context/SearchContext';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const { resetFilters } = useSearch();

  if (products.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs my-8">
        <div className="w-16 h-16 rounded-2xl bg-pink-50 text-[#9f2066] flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
        <p className="text-sm text-slate-500 mb-6">
          We couldn't find any items matching your current search or category filters. Try searching with different keywords.
        </p>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9f2066] hover:bg-[#831843] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="product-catalog"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
