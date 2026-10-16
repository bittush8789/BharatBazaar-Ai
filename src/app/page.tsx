import React, { useMemo } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryNav } from '../components/CategoryNav';
import { ProductFilters } from '../components/ProductFilters';
import { ProductGrid } from '../components/ProductGrid';
import { PRODUCTS } from '../data/products';
import { useSearch } from '../context/SearchContext';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { searchQuery, selectedCategory, sortBy } = useSearch();

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount-desc':
        result.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      case 'featured':
      default:
        // Keep initial curated order
        break;
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Category Navigation Bar */}
      <CategoryNav />

      {/* Promotional Hero Banner */}
      <HeroBanner />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 text-[#9f2066] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {selectedCategory === 'All' ? 'Products For You' : selectedCategory}
              </h2>
              <p className="text-xs text-slate-500">
                15 handpicked quality essentials with lowest price guarantee
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Updated with fresh manufacturer stock</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <ProductFilters totalResults={filteredProducts.length} />

        {/* Product Grid */}
        <ProductGrid products={filteredProducts} />
      </main>
    </div>
  );
}
