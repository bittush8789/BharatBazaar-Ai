import { Product } from '../types/product';
import { PlacedOrder } from '../types/cart';

const BASE_URL = '/api';

export interface MicroservicesTopology {
  gateway: {
    name: string;
    version: string;
    status: string;
    architecture: string;
    protocol: string;
  };
  services: Array<{
    id: string;
    name: string;
    basePath: string;
    status: string;
    description: string;
    metrics: { requests: number; avgLatencyMs: number };
    endpoints: string[];
  }>;
  eventBus: {
    type: string;
    recentEvents: Array<{
      id: string;
      type: string;
      sourceService: string;
      targetService?: string;
      timestamp: string;
      payload: any;
    }>;
  };
  systemTime: string;
}

export const microservicesApi = {
  // Service 1: Catalog Service
  async getProducts(params?: { category?: string; search?: string; sortBy?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);

    const res = await fetch(`${BASE_URL}/catalog/products?${query.toString()}`);
    if (!res.ok) throw new Error('Catalog service error');
    return res.json();
  },

  async getProductById(id: string) {
    const res = await fetch(`${BASE_URL}/catalog/products/${id}`);
    if (!res.ok) throw new Error('Catalog service product not found');
    return res.json();
  },

  // Service 2: Cart & Pricing Engine
  async calculateCart(items: Array<{ productId: string; quantity: number }>) {
    const res = await fetch(`${BASE_URL}/cart/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error('Pricing engine error');
    return res.json();
  },

  // Service 3: Order Management
  async getOrders(status?: string) {
    const query = status && status !== 'All' ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/orders${query}`);
    if (!res.ok) throw new Error('Order service error');
    return res.json();
  },

  async createOrder(order: PlacedOrder) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to create order in order service');
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string) {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status in order service');
    return res.json();
  },

  // Service 4: Logistics & Tracking
  async getShipmentTracking(orderId: string) {
    const res = await fetch(`${BASE_URL}/tracking/${orderId}`);
    if (!res.ok) throw new Error('Logistics service error');
    return res.json();
  },

  async updateShipmentStage(orderId: string, stage: string) {
    const res = await fetch(`${BASE_URL}/tracking/${orderId}/stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    if (!res.ok) throw new Error('Failed to update tracking stage');
    return res.json();
  },

  // Service 5: Returns & Reverse Logistics
  async submitReturn(data: { orderId: string; reason: string; resolution: string; upiOrAccount: string; selectedProductIds: string[] }) {
    const res = await fetch(`${BASE_URL}/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Returns service error');
    return res.json();
  },

  // API Gateway Topology & Telemetry
  async getGatewayTopology(): Promise<MicroservicesTopology> {
    const res = await fetch(`${BASE_URL}/topology`);
    if (!res.ok) throw new Error('API Gateway offline');
    return res.json();
  },
};
