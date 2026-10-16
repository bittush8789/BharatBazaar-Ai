import React from 'react';
import { useCart } from '../../context/CartContext';
import { CartItem } from '../../components/CartItem';
import { formatPrice } from '../../lib/utils';
import { Link } from '../../components/Navigation';
import { ShoppingBag, ArrowRight, ShieldCheck, Tag, ArrowLeft, Trash2 } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    totalQuantity,
    subtotal,
    originalSubtotal,
    totalSavings,
    deliveryFee,
    finalTotal,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f8f9fa]">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-20 h-20 rounded-full bg-pink-50 text-[#9f2066] flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore 15 trending products with wholesale prices and free delivery!
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#9f2066] hover:bg-[#831843] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Start Shopping Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your selected products before proceeding to secure checkout
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Cart</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-[#9f2066] font-semibold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Add More Items</span>
            </Link>
          </div>
        </div>

        {/* Cart Layout: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}

            {/* Savings Callout Banner */}
            {totalSavings > 0 && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Yay! You are saving a total of <strong>{formatPrice(totalSavings)}</strong> on this order.
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Order Price Details */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-24 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Price Details
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Total Product MRP</span>
                <span className="tabular-nums font-medium text-slate-800">
                  {formatPrice(originalSubtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center text-emerald-600">
                <span>Product Discount</span>
                <span className="tabular-nums font-semibold">
                  -{formatPrice(totalSavings)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Delivery Charges</span>
                <span className="font-semibold text-emerald-600">
                  FREE
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-sm font-bold text-slate-900">
                <span>Order Total</span>
                <span className="text-lg font-black text-[#9f2066] tabular-nums">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#9f2066] hover:bg-[#831843] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Buyer Trust Guarantees */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Safe and Secure Payments · 100% Authentic Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
