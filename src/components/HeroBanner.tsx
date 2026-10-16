import React from 'react';
import { Truck, RotateCcw, Banknote, ShieldCheck, ArrowRight, Tag } from 'lucide-react';
import { useSearch } from '../context/SearchContext';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory, setSearchQuery } = useSearch();

  const handleShopNow = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    const grid = document.getElementById('product-catalog');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#9f2066] via-[#be185d] to-[#831843] text-white overflow-hidden relative">
      {/* Decorative subtle background geometry */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
          <circle cx="900" cy="50" r="220" fill="white" />
          <circle cx="100" cy="280" r="160" fill="white" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-200">
              <Tag className="w-3.5 h-3.5 text-pink-300" />
              <span>Direct Manufacturer Wholesale Prices</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Lowest Prices, <br className="hidden sm:inline" />
              Best Quality Shopping
            </h1>

            <p className="text-sm sm:text-base text-pink-100 max-w-xl font-normal leading-relaxed">
              Explore 15 curated bestsellers in Indian ethnic fashion, menswear, home furnishings, and personal care. 100% genuine products with doorstep delivery.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleShopNow}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#9f2066] hover:bg-pink-50 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-xs text-pink-100 flex items-center gap-2">
                <span>Festive discounts up to <strong>68% Off</strong></span>
              </div>
            </div>
          </div>

          {/* Value Proposition Highlights Column */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Free Delivery</span>
              <p className="text-[11px] text-pink-100 leading-tight">On all orders, no minimum cart value needed</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <Banknote className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Cash on Delivery</span>
              <p className="text-[11px] text-pink-100 leading-tight">Pay only when the package arrives at your door</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <RotateCcw className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">7-Day Free Returns</span>
              <p className="text-[11px] text-pink-100 leading-tight">Hassle-free instant pickup & 100% refund</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Verified Sellers</span>
              <p className="text-[11px] text-pink-100 leading-tight">Direct from trusted Indian hubs & weavers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
