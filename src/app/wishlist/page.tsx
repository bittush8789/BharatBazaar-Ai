import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/ProductCard';
import { Link } from '../../components/Navigation';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f8f9fa]">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-20 h-20 rounded-full bg-pink-50 text-[#e01968] flex items-center justify-center mx-auto mb-5">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Save items that catch your eye! Tap the heart icon on any product to save them here for later.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#9f2066] hover:bg-[#831843] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Explore Trending Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wishlist Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>My Wishlist</span>
              <span className="text-xs font-bold text-[#e01968] bg-pink-50 px-2.5 py-0.5 rounded-full">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Items saved for future shopping. Prices and availability subject to change.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#9f2066] font-semibold hover:underline"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {wishlist.map((product) => (
            <div key={product.id} className="relative group flex flex-col justify-between">
              <ProductCard product={product} />

              {/* Move to Cart Quick Bar */}
              <div className="mt-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveToCart(product)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Move to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  title="Remove from wishlist"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
