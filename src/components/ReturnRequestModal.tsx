import React, { useState, useEffect } from 'react';
import { PlacedOrder } from '../types/cart';
import { formatPrice } from '../lib/utils';
import { ProductImage } from './ProductImage';
import { Link } from './Navigation';
import {
  X,
  RotateCcw,
  CheckCircle2,
  Truck,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ReturnRequestModalProps {
  order: PlacedOrder | null;
  onClose: () => void;
  onSubmitReturn: (orderId: string, returnData: ReturnRequestData) => void;
}

export interface ReturnRequestData {
  returnId: string;
  reason: string;
  resolution: 'refund' | 'exchange';
  upiOrAccount: string;
  notes: string;
  selectedProductIds: string[];
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  order,
  onClose,
  onSubmitReturn,
}) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [reason, setReason] = useState('Size or fit issue');
  const [resolution, setResolution] = useState<'refund' | 'exchange'>('refund');
  const [upiOrAccount, setUpiOrAccount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedReturnId, setGeneratedReturnId] = useState('');

  // Pre-select all items by default on modal open
  useEffect(() => {
    if (order) {
      setSelectedProductIds(order.items.map((i) => i.product.id));
      setIsSubmitted(false);
      const randNum = Math.floor(100000 + Math.random() * 900000);
      setGeneratedReturnId(`RET-${randNum}`);
    }
  }, [order]);

  // Lock body scroll
  useEffect(() => {
    if (order) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [order, onClose]);

  if (!order) return null;

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) {
      alert('Please select at least one product to return.');
      return;
    }

    const returnData: ReturnRequestData = {
      returnId: generatedReturnId,
      reason,
      resolution,
      upiOrAccount: upiOrAccount.trim() || 'Direct Account Refund',
      notes,
      selectedProductIds,
    };

    onSubmitReturn(order.orderId, returnData);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Request 7-Day Return / Exchange</span>
              </h2>
              <p className="text-xs text-slate-500">
                Order: <strong className="font-mono text-[#9f2066]">#{order.orderId}</strong> · Free Doorstep Pickup
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              Return Request Confirmed!
            </h3>

            <div className="inline-block bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono text-xs">
              <span className="text-slate-500 font-sans">Return Request ID: </span>
              <strong className="text-[#9f2066]">{generatedReturnId}</strong>
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Our courier executive will visit your delivery address within <strong>24 to 48 business hours</strong> for free doorstep pickup. Keep the original tags attached.
            </p>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-800 text-left">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                Pickup Location:
              </p>
              <p className="text-slate-600">
                {order.customer.streetAddress}, {order.customer.city} ({order.customer.postalCode})
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#9f2066] hover:bg-[#831843] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close & Return to Orders
              </button>
              <Link
                href="/returns"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 font-semibold underline"
              >
                Read 7-Day Return Guidelines
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {/* 1. Item Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                1. Select Item(s) to Return
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {order.items.map(({ product, quantity }) => {
                  const isChecked = selectedProductIds.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-pink-300 bg-pink-50/40 ring-1 ring-pink-300'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProduct(product.id)}
                        className="rounded text-[#9f2066] focus:ring-[#9f2066]"
                      />
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                        <ProductImage src={product.image} alt={product.name} category={product.category} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{product.name}</p>
                        <p className="text-[11px] text-slate-400">Qty: {quantity} · {formatPrice(product.price)}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Return Reason */}
            <div>
              <label htmlFor="returnReason" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                2. Reason for Return
              </label>
              <select
                id="returnReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-800 focus:border-pink-500"
              >
                <option value="Size or fit issue">Size or fit issue (too loose / too tight)</option>
                <option value="Defective or damaged item">Defective, damaged, or torn product</option>
                <option value="Product does not match image">Color or print looks different from image</option>
                <option value="Quality not as expected">Fabric / material quality not as expected</option>
                <option value="Received incorrect product">Received completely different product</option>
                <option value="Arrived too late">Arrived too late for the intended event</option>
              </select>
            </div>

            {/* 3. Resolution preference */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                3. Preferred Resolution
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    resolution === 'refund'
                      ? 'border-[#9f2066] bg-pink-50/50 text-[#9f2066] ring-1 ring-[#9f2066]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="refund"
                    checked={resolution === 'refund'}
                    onChange={() => setResolution('refund')}
                    className="text-[#9f2066] focus:ring-[#9f2066]"
                  />
                  <span>100% Refund</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    resolution === 'exchange'
                      ? 'border-[#9f2066] bg-pink-50/50 text-[#9f2066] ring-1 ring-[#9f2066]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="exchange"
                    checked={resolution === 'exchange'}
                    onChange={() => setResolution('exchange')}
                    className="text-[#9f2066] focus:ring-[#9f2066]"
                  />
                  <span>Size Exchange</span>
                </label>
              </div>
            </div>

            {/* 4. Refund Destination */}
            {resolution === 'refund' && (
              <div>
                <label htmlFor="upiOrAccount" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  UPI ID for Instant Refund (Optional)
                </label>
                <input
                  id="upiOrAccount"
                  type="text"
                  value={upiOrAccount}
                  onChange={(e) => setUpiOrAccount(e.target.value)}
                  placeholder="e.g. mobile@okhdfcbank or 9876543210@paytm"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  If left blank, funds will be refunded to your original payment mode.
                </p>
              </div>
            )}

            {/* Policy Reminder */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span>Items must have original manufacturer tags attached and be in unwashed condition. </span>
                <Link href="/returns" className="text-[#9f2066] font-semibold underline" onClick={onClose}>
                  Review 7-Day Policy Details
                </Link>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#9f2066] hover:bg-[#831843] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm Return Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
