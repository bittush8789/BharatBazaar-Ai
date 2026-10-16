import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryNav } from '../components/CategoryNav';
import { ProductFilters } from '../components/ProductFilters';
import { ProductGrid } from '../components/ProductGrid';
import { PRODUCTS } from '../data/products';
import { Product } from '../types/product';
import { useSearch } from '../context/SearchContext';
import { Sparkles, TrendingUp, Database } from 'lucide-react';
import { microservicesApi } from '../services/apiClient';

export default function HomePage() {
  const { searchQuery, selectedCategory, sortBy } = useSearch();
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isPostgresConnected, setIsPostgresConnected] = useState(true);

  // Fetch real-time products from Catalog Microservice (backed by PostgreSQL)
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    microservicesApi
      .getProducts({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy,
      })
      .then((res) => {
        if (isMounted && res.data) {
          setProducts(res.data);
          setIsPostgresConnected(res.database === 'PostgreSQL');
        }
      })
      .catch((err) => {
        console.warn('[Catalog Microservice] API fallback to local:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Category Navigation Bar */}
      <CategoryNav />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Promotional Hero Carousel Banner */}
        <HeroBanner />

        {/* Microservices & PostgreSQL live status badge */}
        <div className="my-4 flex items-center justify-between bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">Catalog Microservice:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <Database className="w-3 h-3" />
              {isPostgresConnected ? 'PostgreSQL 18 Active' : 'Connected'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 hidden sm:block">
            {products.length} products available with Free Delivery & COD
          </div>
        </div>

        {/* Section Header */}
        <div className="my-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {selectedCategory === 'All' ? (
                  <>
                    <span>Products For You</span>
                    <Sparkles className="w-5 h-5 text-[#9f2066]" />
                  </>
                ) : (
                  <span>{selectedCategory}</span>
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Wholesale prices direct from Indian manufacturers • Lowest Price Guaranteed
              </p>
            </div>

            {/* Trending indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-pink-50 border border-pink-100 rounded-full text-xs font-semibold text-[#9f2066]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending Today</span>
            </div>
          </div>
        </div>

        {/* Filter Controls (Sort & Category Dropdowns) */}
        <ProductFilters totalResults={products.length} />

        {/* Products Grid or Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 my-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-slate-200 animate-pulse space-y-3">
                <div className="w-full aspect-square bg-slate-200 rounded-lg" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </main>
    </div>
  );
}
