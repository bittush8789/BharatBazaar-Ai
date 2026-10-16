import React, { useState, useEffect } from 'react';
import { PlacedOrder } from '../types/cart';
import { formatPrice } from '../lib/utils';
import { ProductImage } from './ProductImage';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface OrderTrackingModalProps {
  order: PlacedOrder | null;
  onClose: () => void;
}

export type TrackingStage = 'placed' | 'shipped' | 'out_for_delivery' | 'delivered';

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  // Allow toggling between stages for realistic mock preview
  const [activeStage, setActiveStage] = useState<TrackingStage>('shipped');

  useEffect(() => {
    if (order) {
      if (order.status === 'Delivered') setActiveStage('delivered');
      else if (order.status === 'Shipped') setActiveStage('shipped');
      else if (order.status === 'Processing') setActiveStage('placed');
    }
  }, [order]);

  // Lock body scroll when modal is open
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

  const orderDate = new Date(order.date);
  
  // Format milestones
  const placedTime = orderDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const shippedDate = new Date(orderDate);
  shippedDate.setHours(shippedDate.getHours() + 14);
  const shippedTime = shippedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const outForDeliveryDate = new Date(orderDate);
  outForDeliveryDate.setDate(outForDeliveryDate.getDate() + 2);
  outForDeliveryDate.setHours(8, 30);
  const outForDeliveryTime = outForDeliveryDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const deliveredDate = new Date(orderDate);
  deliveredDate.setDate(deliveredDate.getDate() + 3);
  deliveredDate.setHours(15, 45);
  const deliveredTime = deliveredDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const stageRank: Record<TrackingStage, number> = {
    placed: 1,
    shipped: 2,
    out_for_delivery: 3,
    delivered: 4,
  };

  const currentRank = stageRank[activeStage];

  const trackingSteps = [
    {
      id: 'placed' as TrackingStage,
      title: 'Order Placed',
      subtitle: 'Verified & Sent to Supplier Hub',
      timestamp: placedTime,
      location: 'Manufacturer Hub, Surat, Gujarat',
      details: 'Order verified. Packaging and quality inspection passed.',
    },
    {
      id: 'shipped' as TrackingStage,
      title: 'Shipped',
      subtitle: 'In Transit via Bharat Express Logistics',
      timestamp: shippedTime,
      location: 'National Sorting Facility, New Delhi',
      details: 'Dispatched on Linehaul vehicle. Bagged with AWB #BB-EXP-8924.',
    },
    {
      id: 'out_for_delivery' as TrackingStage,
      title: 'Out for Delivery',
      subtitle: 'With Local Courier Associate',
      timestamp: outForDeliveryTime,
      location: `${order.customer.city} Delivery Hub`,
      details: 'Assigned to Courier Associate Ramesh K. (+91 98112 04821).',
    },
    {
      id: 'delivered' as TrackingStage,
      title: 'Delivered',
      subtitle: 'Doorstep Handover',
      timestamp: `Expected: ${deliveredTime}`,
      location: `${order.customer.streetAddress}, ${order.customer.city}`,
      details: 'Customer OTP signature required upon delivery.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#9f2066] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Track Package</span>
                <span className="text-xs font-mono font-semibold text-[#9f2066] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-md">
                  #{order.orderId}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Partner: Bharat Express Logistics · AWB: <strong>BB-EXP-89241</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close tracking modal"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Simulation Controls (Interactive & Fun) */}
          <div className="p-3 bg-pink-50/70 border border-pink-100 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#9f2066] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Live Status Preview Simulator
              </span>
              <span className="text-[10px] text-slate-500">Click stage to simulate:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['placed', 'shipped', 'out_for_delivery', 'delivered'] as TrackingStage[]).map((stg) => {
                const labels: Record<TrackingStage, string> = {
                  placed: '1. Placed',
                  shipped: '2. Shipped',
                  out_for_delivery: '3. Out for Deliv.',
                  delivered: '4. Delivered',
                };
                const isCurrent = activeStage === stg;
                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setActiveStage(stg)}
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer truncate ${
                      isCurrent
                        ? 'bg-[#9f2066] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {labels[stg]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Headline Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Estimated Delivery Window
              </span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">
                {deliveredTime} (by 7:00 PM)
              </p>
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                On Schedule · Standard Doorstep Delivery
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="block font-medium text-slate-700">Destination:</span>
              <span className="block truncate max-w-[200px] font-semibold text-slate-900">
                {order.customer.city}, {order.customer.state} ({order.customer.postalCode})
              </span>
            </div>
          </div>

          {/* Vertical Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Detailed Package Activity
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {trackingSteps.map((step, idx) => {
                const stepRank = idx + 1;
                const isPassed = currentRank > stepRank;
                const isCurrent = currentRank === stepRank;
                const isPending = currentRank < stepRank;

                return (
                  <div key={step.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-white transition-all ${
                        isPassed
                          ? 'bg-emerald-600 shadow-xs'
                          : isCurrent
                          ? 'bg-[#9f2066] ring-4 ring-pink-100 shadow-sm'
                          : 'bg-slate-300'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isCurrent ? (
                        <Truck className="w-3.5 h-3.5" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Step Card Content */}
                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-pink-50/40 border-pink-200 shadow-xs'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              isCurrent ? 'text-[#9f2066]' : isPassed ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {step.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold uppercase bg-pink-100 text-[#9f2066] px-2 py-0.2 rounded-full">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {step.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">{step.subtitle}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{step.details}</p>

                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{step.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package Contents Summary */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Items in this shipment ({order.items.length})</span>
              <span className="text-xs font-semibold text-slate-900 tabular-nums">
                Total: {formatPrice(order.total)}
              </span>
            </h4>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {order.items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between gap-3 text-xs bg-white p-2 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                      <ProductImage src={product.image} alt={product.name} category={product.category} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate max-w-xs">{product.name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 tabular-nums shrink-0">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Delivery Support: 1800-200-9820 (Toll-free 9AM–7PM)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  );
};
