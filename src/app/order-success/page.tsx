import React, { useEffect, useState } from 'react';
import { PlacedOrder } from '../../types/cart';
import { formatPrice } from '../../lib/utils';
import { Link } from '../../components/Navigation';
import { CheckCircle2, Package, Truck, ArrowRight, Home, Calendar, MapPin, Phone } from 'lucide-react';
import { ProductImage } from '../../components/ProductImage';

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('bharatbazaar_latest_order');
      if (stored) {
        setOrder(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to parse placed order', err);
    }
  }, []);

  // Format delivery estimate: 3 days from now
  const estimateDate = new Date();
  estimateDate.setDate(estimateDate.getDate() + 3);
  const formattedEstimate = estimateDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Banner Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed & Placed
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Thank you for shopping with BharatBazaar!
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            We have received your order. Our supplier is packing your package for express dispatch.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono">
            <span className="text-slate-500 font-sans">Order ID:</span>
            <span className="font-bold text-[#9f2066]">{order ? order.orderId : 'BB-DEMO9812'}</span>
          </div>

          {/* Delivery Timeline Strip */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-4 h-4 text-[#9f2066] mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Estimated Delivery</p>
                <p className="text-xs font-bold text-slate-800">{formattedEstimate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Truck className="w-4 h-4 text-[#9f2066] mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Shipping Partner</p>
                <p className="text-xs font-bold text-slate-800">Bharat Express Logistics</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Package className="w-4 h-4 text-[#9f2066] mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Payment Mode</p>
                <p className="text-xs font-bold text-slate-800 uppercase">
                  {order?.customer.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order?.customer.paymentMethod || 'COD'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Order Summary & Receipt
              </h2>
              <span className="text-xs text-slate-500">
                Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Delivery Recipient Info */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-[#9f2066]" />
                <span>Delivery Address for {order.customer.fullName}</span>
              </div>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                {order.customer.streetAddress}, {order.customer.city}, {order.customer.state} - {order.customer.postalCode}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 pl-6 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  +91 {order.customer.phone}
                </span>
                <span>·</span>
                <span>{order.customer.email}</span>
              </div>
            </div>

            {/* Items Ordered */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Items ({order.items.length})
              </h3>
              <div className="space-y-3 divide-y divide-slate-100">
                {order.items.map(({ product, quantity }) => (
                  <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        <ProductImage src={product.image} alt={product.name} category={product.category} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{product.name}</p>
                        <p className="text-[11px] text-slate-500">Qty: {quantity} unit(s)</p>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {formatPrice(product.price * quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Payable Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Total Discount Saved</span>
                <span className="tabular-nums font-semibold">-{formatPrice(order.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                <span>Total Paid / Payable</span>
                <span className="text-lg font-black text-[#9f2066] tabular-nums">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#9f2066] hover:bg-[#831843] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
          <Link
            href="/cart"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
