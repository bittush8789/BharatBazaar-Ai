import React, { useState, useEffect, useMemo } from 'react';
import { PlacedOrder } from '../../types/cart';
import { formatPrice } from '../../lib/utils';
import { Link } from '../../components/Navigation';
import { ProductImage } from '../../components/ProductImage';
import { PRODUCTS } from '../../data/products';
import {
  Package,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ShoppingBag,
  Truck,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { OrderTrackingModal } from '../../components/OrderTrackingModal';
import { ReturnRequestModal, ReturnRequestData } from '../../components/ReturnRequestModal';
import { microservicesApi } from '../../services/apiClient';

type OrderStatus = 'Delivered' | 'Shipped' | 'Processing';

export function getOrderStatus(order: PlacedOrder): OrderStatus {
  if (order.status) return order.status;
  // If not explicitly set, calculate based on order age
  const hoursSince = (Date.now() - new Date(order.date).getTime()) / (1000 * 60 * 60);
  if (hoursSince > 72) return 'Delivered';
  if (hoursSince > 12) return 'Shipped';
  return 'Processing';
}

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Delivered':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Delivered</span>
        </span>
      );
    case 'Shipped':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg shadow-2xs">
          <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Shipped</span>
        </span>
      );
    case 'Processing':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Processing</span>
        </span>
      );
  }
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [trackingOrder, setTrackingOrder] = useState<PlacedOrder | null>(null);
  const [returnOrder, setReturnOrder] = useState<PlacedOrder | null>(null);
  const { addToCart } = useCart();

  const handleProcessReturn = (orderId: string, returnData: ReturnRequestData) => {
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        return {
          ...o,
          returnRequest: {
            returnId: returnData.returnId,
            reason: returnData.reason,
            date: new Date().toISOString(),
            resolution: returnData.resolution,
          },
        };
      }
      return o;
    });
    setOrders(updated);
    try {
      window.localStorage.setItem('bharatbazaar_order_history', JSON.stringify(updated));
      // Dispatch to Reverse Logistics Microservice
      microservicesApi.submitReturn({
        orderId,
        reason: returnData.reason,
        resolution: returnData.resolution,
        upiOrAccount: returnData.upiOrAccount,
        selectedProductIds: returnData.selectedProductIds,
      }).catch((err) => console.warn('[Microservices Client] Fallback:', err));
    } catch (err) {
      console.warn('Failed to update return state', err);
    }
  };

  // Load orders from Order Management Microservice (PostgreSQL) and LocalStorage
  useEffect(() => {
    async function fetchOrders() {
      try {
        let localOrders: PlacedOrder[] = [];
        try {
          const historyRaw = window.localStorage.getItem('bharatbazaar_order_history');
          if (historyRaw) localOrders = JSON.parse(historyRaw);
          const latestRaw = window.localStorage.getItem('bharatbazaar_latest_order');
          if (latestRaw) {
            const latest = JSON.parse(latestRaw);
            if (!localOrders.some((o) => o.orderId === latest.orderId)) {
              localOrders = [latest, ...localOrders];
            }
          }
        } catch (e) {}

        // Fetch authoritative orders from PostgreSQL
        const apiRes = await microservicesApi.getOrders().catch(() => null);
        const serverOrders: PlacedOrder[] = apiRes?.data || [];

        // Merge: Server orders + any local orders not yet on server
        const mergedMap = new Map<string, PlacedOrder>();
        serverOrders.forEach((o) => mergedMap.set(o.orderId, o));
        localOrders.forEach((o) => {
          if (!mergedMap.has(o.orderId)) {
            mergedMap.set(o.orderId, o);
          }
        });

        const allOrders = Array.from(mergedMap.values()).map((o) => ({
          ...o,
          status: getOrderStatus(o),
        }));

        setOrders(allOrders);
        window.localStorage.setItem('bharatbazaar_order_history', JSON.stringify(allOrders));
      } catch (err) {
        console.warn('Failed to load past orders', err);
      } finally {
        setIsLoaded(true);
      }
    }

    fetchOrders();
  }, []);

  // Update an order's status and sync to localStorage and Order Microservice
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    try {
      window.localStorage.setItem('bharatbazaar_order_history', JSON.stringify(updated));
      microservicesApi.updateOrderStatus(orderId, newStatus).catch((err) => {
        console.warn('[Microservices Client] Fallback:', err);
      });
    } catch (err) {
      console.warn('Failed to update status', err);
    }
  };

  // Seed 3 realistic demo orders representing Delivered, Shipped, and Processing
  const handleLoadSampleOrders = () => {
    const now = Date.now();
    const demoOrders: PlacedOrder[] = [
      {
        orderId: 'BB-89410291',
        date: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        status: 'Delivered',
        customer: {
          fullName: 'Ananya Verma',
          email: 'ananya.verma@example.com',
          phone: '9845123980',
          streetAddress: 'Flat 402, Lotus Heights, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          paymentMethod: 'upi',
        },
        items: [
          { product: PRODUCTS[0], quantity: 1 }, // Georgette Anarkali
          { product: PRODUCTS[13], quantity: 1 }, // Kundan Choker
        ],
        subtotal: PRODUCTS[0].price + PRODUCTS[13].price,
        discount: (PRODUCTS[0].originalPrice - PRODUCTS[0].price) + (PRODUCTS[13].originalPrice - PRODUCTS[13].price),
        deliveryFee: 0,
        total: PRODUCTS[0].price + PRODUCTS[13].price,
      },
      {
        orderId: 'BB-78192043',
        date: new Date(now - 1.5 * 24 * 60 * 60 * 1000).toISOString(), // 36 hours ago
        status: 'Shipped',
        customer: {
          fullName: 'Rohit Malhotra',
          email: 'rohit.m@example.com',
          phone: '9711203491',
          streetAddress: 'B-12, Sector 15, Vashi',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          postalCode: '400703',
          paymentMethod: 'cod',
        },
        items: [
          { product: PRODUCTS[4], quantity: 2 }, // Men's Mandarin Shirt
        ],
        subtotal: PRODUCTS[4].price * 2,
        discount: (PRODUCTS[4].originalPrice - PRODUCTS[4].price) * 2,
        deliveryFee: 0,
        total: PRODUCTS[4].price * 2,
      },
      {
        orderId: 'BB-91024855',
        date: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'Processing',
        customer: {
          fullName: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          phone: '9876543210',
          streetAddress: 'House 54, Model Town Phase 2',
          city: 'New Delhi',
          state: 'Delhi',
          postalCode: '110009',
          paymentMethod: 'cod',
        },
        items: [
          { product: PRODUCTS[7], quantity: 1 }, // Cotton King Bedsheet
          { product: PRODUCTS[10], quantity: 1 }, // Vitamin C Serum
        ],
        subtotal: PRODUCTS[7].price + PRODUCTS[10].price,
        discount: (PRODUCTS[7].originalPrice - PRODUCTS[7].price) + (PRODUCTS[10].originalPrice - PRODUCTS[10].price),
        deliveryFee: 0,
        total: PRODUCTS[7].price + PRODUCTS[10].price,
      },
    ];

    setOrders(demoOrders);
    try {
      window.localStorage.setItem('bharatbazaar_order_history', JSON.stringify(demoOrders));
    } catch (err) {
      console.warn('Failed to seed demo orders', err);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local order history?')) {
      window.localStorage.removeItem('bharatbazaar_order_history');
      window.localStorage.removeItem('bharatbazaar_latest_order');
      setOrders([]);
    }
  };

  const handleReorder = (order: PlacedOrder) => {
    order.items.forEach(({ product, quantity }) => {
      addToCart(product, quantity);
    });
  };

  // Status counts for filter tabs
  const counts = useMemo(() => {
    return {
      All: orders.length,
      Processing: orders.filter((o) => getOrderStatus(o) === 'Processing').length,
      Shipped: orders.filter((o) => getOrderStatus(o) === 'Shipped').length,
      Delivered: orders.filter((o) => getOrderStatus(o) === 'Delivered').length,
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') return orders;
    return orders.filter((o) => getOrderStatus(o) === statusFilter);
  }, [orders, statusFilter]);

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Clock className="w-4 h-4 animate-spin text-[#9f2066]" />
          <span>Retrieving order history...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f8f9fa]">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xs">
          <div className="w-20 h-20 rounded-full bg-pink-50 text-[#9f2066] flex items-center justify-center mx-auto mb-5">
            <Package className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Past Orders Found</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            You haven't placed any orders yet. Start exploring our 15 trending products or generate demo orders with color-coded status badges!
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#9f2066] hover:bg-[#831843] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleLoadSampleOrders}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9f2066]" />
              <span>Load Sample Orders (Delivered · Shipped · Processing)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-[#9f2066]" />
              <span>My Past Orders</span>
              <span className="text-xs font-bold text-[#9f2066] bg-pink-50 px-2.5 py-0.5 rounded-full">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track package milestones, review invoices, and manage shipment statuses
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLoadSampleOrders}
              className="inline-flex items-center gap-1.5 text-xs text-[#9f2066] hover:text-[#831843] font-semibold px-2 py-1 rounded-md hover:bg-pink-50 transition-colors cursor-pointer"
              title="Reset with 3 demo orders across Delivered, Shipped, and Processing"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Load Sample Orders</span>
            </button>

            <Link
              href="/returns"
              className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-800 font-semibold px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return Policy</span>
            </Link>

            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 font-medium px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
              title="Clear Local Order History"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#9f2066] font-semibold hover:underline"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs (Tailwind Color-Coded Indicators) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* All Orders Tab */}
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>All Orders</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'All' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {counts.All}
              </span>
            </button>

            {/* Processing Filter Tab (Amber) */}
            <button
              type="button"
              onClick={() => setStatusFilter('Processing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'Processing'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50 border border-transparent hover:border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Processing</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'Processing' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {counts.Processing}
              </span>
            </button>

            {/* Shipped Filter Tab (Blue) */}
            <button
              type="button"
              onClick={() => setStatusFilter('Shipped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'Shipped'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Shipped</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'Shipped' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {counts.Shipped}
              </span>
            </button>

            {/* Delivered Filter Tab (Emerald) */}
            <button
              type="button"
              onClick={() => setStatusFilter('Delivered')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'Delivered'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Delivered</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'Delivered' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {counts.Delivered}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden md:block">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Empty Filter State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center my-6">
            <p className="text-sm font-semibold text-slate-800">
              No orders with status "{statusFilter}"
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try switching to another status tab or view all orders.
            </p>
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              View All Orders
            </button>
          </div>
        )}

        {/* Orders Listing */}
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const status = getOrderStatus(order);
            const orderDate = new Date(order.date);
            const formattedDate = orderDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const estDelivery = new Date(orderDate);
            estDelivery.setDate(estDelivery.getDate() + 3);
            const formattedEstDelivery = estDelivery.toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            const totalItemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

            // Banner color coding based on status
            const getBannerStyles = (st: OrderStatus) => {
              switch (st) {
                case 'Delivered':
                  return {
                    bg: 'bg-emerald-50/80 border-b border-emerald-100',
                    textColor: 'text-emerald-800',
                    icon: CheckCircle2,
                    iconColor: 'text-emerald-600',
                    text: 'Delivered Successfully · Package received at doorstep',
                  };
                case 'Shipped':
                  return {
                    bg: 'bg-blue-50/80 border-b border-blue-100',
                    textColor: 'text-blue-800',
                    icon: Truck,
                    iconColor: 'text-blue-600',
                    text: `In Transit · On the way with Bharat Express Logistics · Est. delivery by ${formattedEstDelivery}`,
                  };
                case 'Processing':
                default:
                  return {
                    bg: 'bg-amber-50/80 border-b border-amber-100',
                    textColor: 'text-amber-800',
                    icon: Clock,
                    iconColor: 'text-amber-600',
                    text: 'Processing Order · Quality inspection in progress at supplier hub',
                  };
              }
            };

            const banner = getBannerStyles(status);
            const BannerIcon = banner.icon;

            return (
              <div
                key={order.orderId}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-shadow hover:shadow-md"
              >
                {/* Order Top Strip */}
                <div className="bg-slate-50/90 px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase font-semibold">Order Placed</span>
                      <span className="font-medium text-slate-800">{formattedDate}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase font-semibold">Total Amount</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatPrice(order.total)}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase font-semibold">Ship To</span>
                      <span className="font-medium text-slate-800 truncate max-w-[140px] block" title={order.customer.fullName}>
                        {order.customer.fullName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Visual Color-Coded Status Badge */}
                    <OrderStatusBadge status={status} />

                    <span className="font-mono text-xs font-semibold text-[#9f2066] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-md">
                      #{order.orderId}
                    </span>
                  </div>
                </div>

                {/* Color-Coded Order Status Banner */}
                <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs ${banner.bg}`}>
                  <div className={`flex items-center gap-2 font-semibold ${banner.textColor}`}>
                    <BannerIcon className={`w-4 h-4 shrink-0 ${banner.iconColor}`} />
                    <span>{banner.text}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                    <span className="capitalize">
                      {order.customer.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.customer.paymentMethod.toUpperCase()}
                    </span>
                    <span>·</span>
                    <span>{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
                    <button
                      type="button"
                      onClick={() => setTrackingOrder(order)}
                      className="ml-1 inline-flex items-center gap-1 font-bold text-[#9f2066] hover:text-[#831843] hover:underline cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Status</span>
                    </button>
                  </div>
                </div>

                {/* Purchased Items List */}
                <div className="p-5 divide-y divide-slate-100">
                  {order.items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Link
                          href={`/products/${product.id}`}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50"
                        >
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            category={product.category}
                          />
                        </Link>

                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {product.category}
                          </span>
                          <Link
                            href={`/products/${product.id}`}
                            className="block text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#9f2066] transition-colors truncate max-w-sm sm:max-w-md"
                          >
                            {product.name}
                          </Link>
                          <div className="flex items-baseline gap-2 mt-1 text-xs">
                            <span className="font-bold text-slate-900 tabular-nums">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-slate-400">× {quantity} unit(s)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right min-w-[80px]">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                            {formatPrice(product.price * quantity)}
                          </span>
                        </div>

                        <Link
                          href={`/products/${product.id}`}
                          className="px-3 py-1.5 text-xs font-semibold text-[#9f2066] bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors whitespace-nowrap"
                        >
                          View Item
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Actions */}
                <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-xs sm:max-w-md">
                      {order.customer.streetAddress}, {order.customer.city} ({order.customer.postalCode})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    {/* Interactive Status Switcher */}
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-lg">
                      <span className="text-slate-400 font-medium">Status:</span>
                      <select
                        value={status}
                        onChange={(e) => handleUpdateStatus(order.orderId, e.target.value as OrderStatus)}
                        className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                        aria-label="Change order status"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    {/* Request Return Button (visible on Delivered orders) */}
                    {status === 'Delivered' && (
                      order.returnRequest ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs">
                          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                          <span>Return Requested ({order.returnRequest.returnId})</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReturnOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                          title="Request 7-Day Return / Exchange"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                          <span>Request Return</span>
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => setTrackingOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-[#9f2066] border border-pink-200 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9f2066] hover:bg-[#831843] text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Reorder All</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mock Tracking Modal */}
      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />

      {/* 7-Day Return Request Modal */}
      <ReturnRequestModal
        order={returnOrder}
        onClose={() => setReturnOrder(null)}
        onSubmitReturn={handleProcessReturn}
      />
    </div>
  );
}
