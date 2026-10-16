import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice, generateOrderId } from '../../lib/utils';
import { useRouter, Link } from '../../components/Navigation';
import { CheckoutFormValues, PlacedOrder } from '../../types/cart';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  Banknote,
  QrCode,
  CreditCard,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { ProductImage } from '../../components/ProductImage';
import { microservicesApi } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalQuantity, subtotal, originalSubtotal, totalSavings, deliveryFee, finalTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CheckoutFormValues>(() => ({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    streetAddress: user?.savedAddress?.street || '',
    city: user?.savedAddress?.city || '',
    state: user?.savedAddress?.state || 'Delhi',
    postalCode: user?.savedAddress?.pincode || '',
    paymentMethod: 'cod',
  }));

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, prompt user to add items
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Cart is empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9f2066] text-white text-xs font-bold rounded-lg hover:bg-[#831843] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shop</span>
        </Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Please enter at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required for delivery coordination';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'House / Flat / Street address is required';
    } else if (formData.streetAddress.trim().length < 5) {
      newErrors.streetAddress = 'Please provide complete delivery address';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City / District is required';
    }

    const cleanPin = formData.postalCode.replace(/\D/g, '');
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = '6-digit PIN code is required';
    } else if (cleanPin.length !== 6) {
      newErrors.postalCode = 'Please enter a 6-digit Indian PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const placedOrder: PlacedOrder = {
      orderId: generateOrderId(),
      date: new Date().toISOString(),
      customer: formData,
      items: [...items],
      subtotal,
      discount: totalSavings,
      deliveryFee,
      total: finalTotal,
      status: 'Processing',
    };

    // Store in localStorage for Order Success view and Order History
    try {
      window.localStorage.setItem('bharatbazaar_latest_order', JSON.stringify(placedOrder));
      const existingHistory = window.localStorage.getItem('bharatbazaar_order_history');
      const historyList: PlacedOrder[] = existingHistory ? JSON.parse(existingHistory) : [];
      const updatedHistory = [placedOrder, ...historyList.filter((o) => o.orderId !== placedOrder.orderId)];
      window.localStorage.setItem('bharatbazaar_order_history', JSON.stringify(updatedHistory));

      // Asynchronously dispatch to Order Management Microservice
      microservicesApi.createOrder(placedOrder).catch((err) => {
        console.warn('[Microservices Client] Fallback to local storage:', err);
      });
    } catch (err) {
      console.warn('Failed to store order history', err);
    }

    // Simulate rapid smooth processing
    setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      router.push('/order-success');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-4">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#9f2066] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping Cart</span>
          </Link>
        </div>

        <div className="mb-6 pb-2 border-b border-slate-200">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Secure Checkout</span>
            <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Lock className="w-3 h-3" /> 256-bit Encrypted
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete your delivery details. Cash on Delivery is supported with zero extra fee.
          </p>
        </div>

        {/* Two-Column Grid: Form Left, Summary Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact & Delivery Address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#9f2066] text-white flex items-center justify-center text-[11px] font-bold">
                    1
                  </span>
                  <span>Delivery Address</span>
                </h2>
                <span className="text-[11px] text-slate-500">* All fields required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    placeholder="e.g. Priya Sharma"
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg outline-none transition-colors ${
                      errors.fullName ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-pink-500'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    placeholder="order-updates@example.com"
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg outline-none transition-colors ${
                      errors.email ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-pink-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Mobile Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone (+91)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold select-none">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, phone: val });
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      placeholder="9876543210"
                      className={`w-full pl-11 pr-3 py-2 text-xs bg-slate-50 border rounded-lg outline-none transition-colors font-mono tabular-nums ${
                        errors.phone ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-pink-500'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label htmlFor="streetAddress" className="block text-xs font-bold text-slate-700 mb-1">
                    Flat / House No. / Building / Street
                  </label>
                  <textarea
                    id="streetAddress"
                    rows={2}
                    value={formData.streetAddress}
                    onChange={(e) => {
                      setFormData({ ...formData, streetAddress: e.target.value });
                      if (errors.streetAddress) setErrors({ ...errors, streetAddress: undefined });
                    }}
                    placeholder="e.g. Flat 304, Gokul Residency, Near City Mall, Ring Road"
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg outline-none transition-colors ${
                      errors.streetAddress ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-pink-500'
                    }`}
                  />
                  {errors.streetAddress && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.streetAddress}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-xs font-bold text-slate-700 mb-1">
                    City / District
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: undefined });
                    }}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg outline-none transition-colors ${
                      errors.city ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-pink-500'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.city}
                    </p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label htmlFor="postalCode" className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Code (6 digits)
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    maxLength={6}
                    value={formData.postalCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, postalCode: val });
                      if (errors.postalCode) setErrors({ ...errors, postalCode: undefined });
                    }}
                    placeholder="560001"
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg outline-none transition-colors font-mono tabular-nums ${
                      errors.postalCode ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-pink-500'
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.postalCode}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="sm:col-span-2">
                  <label htmlFor="state" className="block text-xs font-bold text-slate-700 mb-1">
                    State
                  </label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-800 font-medium"
                  >
                    {[
                      'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
                      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab',
                      'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
                    ].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#9f2066] text-white flex items-center justify-center text-[11px] font-bold">
                    2
                  </span>
                  <span>Select Payment Method</span>
                </h2>
                <span className="text-xs text-emerald-600 font-semibold">100% Guaranteed</span>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery (Meesho Favorite) */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-[#9f2066] bg-pink-50/40 ring-1 ring-[#9f2066]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className="mt-0.5 text-[#9f2066] focus:ring-[#9f2066]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-[#9f2066]" />
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-sm">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pay cash or scan QR when your package arrives at your doorstep. Zero convenience fee.
                    </p>
                  </div>
                </label>

                {/* Instant UPI / QR */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'upi'
                      ? 'border-[#9f2066] bg-pink-50/40 ring-1 ring-[#9f2066]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                    className="mt-0.5 text-[#9f2066] focus:ring-[#9f2066]"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-slate-600" />
                      UPI (Google Pay / PhonePe / Paytm / BHIM)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mock instant UPI approval. No payment gateway charges.
                    </p>
                  </div>
                </label>

                {/* Credit / Debit Card */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'card'
                      ? 'border-[#9f2066] bg-pink-50/40 ring-1 ring-[#9f2066]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className="mt-0.5 text-[#9f2066] focus:ring-[#9f2066]"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-slate-600" />
                      Credit / Debit Card (Visa, RuPay, Mastercard)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mock test card simulator. Fast 1-click verification.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-[#9f2066] hover:bg-[#831843] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Confirming Order...'
                  : `Place Order · ${formatPrice(finalTotal)}`}
              </span>
            </button>
          </form>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-24 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-slate-500 font-semibold">{totalQuantity} items</span>
            </h3>

            {/* Compact Items List */}
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="pt-2.5 first:pt-0 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                    <ProductImage src={product.image} alt={product.name} category={product.category} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{product.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Qty: {quantity} × {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-slate-900 tabular-nums">
                    {formatPrice(product.price * quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Subtotal (MRP)</span>
                <span className="tabular-nums">{formatPrice(originalSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-600">
                <span>Discount</span>
                <span className="tabular-nums font-semibold">-{formatPrice(totalSavings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                <span>Final Payable</span>
                <span className="text-base text-[#9f2066] font-black tabular-nums">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Estimated Delivery in 2 to 4 business days</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No cancellation or return fee within 7 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
