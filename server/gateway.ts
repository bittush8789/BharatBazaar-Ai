import { Router, Request, Response, NextFunction } from 'express';
import { catalogServiceRouter } from './services/catalogService';
import { cartPricingServiceRouter } from './services/cartPricingService';
import { orderServiceRouter } from './services/orderService';
import { logisticsServiceRouter } from './services/logisticsService';
import { returnsServiceRouter } from './services/returnsService';
import { eventBus } from './events/eventBus';

export const apiGatewayRouter = Router();

// Track microservices performance and request metrics
const serviceMetrics: Record<string, { requests: number; avgLatencyMs: number }> = {
  'catalog-service': { requests: 0, avgLatencyMs: 8 },
  'cart-pricing-service': { requests: 0, avgLatencyMs: 12 },
  'order-service': { requests: 0, avgLatencyMs: 15 },
  'logistics-service': { requests: 0, avgLatencyMs: 10 },
  'returns-service': { requests: 0, avgLatencyMs: 9 },
};

function recordMetric(serviceName: string, durationMs: number) {
  const metric = serviceMetrics[serviceName];
  if (metric) {
    metric.requests += 1;
    metric.avgLatencyMs = Math.round((metric.avgLatencyMs * (metric.requests - 1) + durationMs) / metric.requests);
  }
}

// Gateway Request Middleware for telemetry
const createGatewayMiddleware = (serviceName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      recordMetric(serviceName, duration);
    });
    next();
  };
};

// Mount Decoupled Microservices
apiGatewayRouter.use('/catalog', createGatewayMiddleware('catalog-service'), catalogServiceRouter);
apiGatewayRouter.use('/cart', createGatewayMiddleware('cart-pricing-service'), cartPricingServiceRouter);
apiGatewayRouter.use('/orders', createGatewayMiddleware('order-service'), orderServiceRouter);
apiGatewayRouter.use('/tracking', createGatewayMiddleware('logistics-service'), logisticsServiceRouter);
apiGatewayRouter.use('/returns', createGatewayMiddleware('returns-service'), returnsServiceRouter);

// GET /api/topology or /api/gateway/topology - Microservices Architecture Topology & Health Map
apiGatewayRouter.get(['/topology', '/gateway/topology'], (_req: Request, res: Response) => {
  res.json({
    gateway: {
      name: 'BharatBazaar Core API Gateway',
      version: '2.4.0',
      status: 'HEALTHY',
      architecture: 'Distributed Microservices Pattern',
      protocol: 'REST / JSON + In-Process Event-Driven Pub/Sub',
    },
    services: [
      {
        id: 'catalog-service',
        name: 'Product Catalog & Search Microservice',
        basePath: '/api/catalog',
        status: 'UP',
        description: 'Manages 15 curated products, inventory checks, category facets, and search ranking.',
        metrics: serviceMetrics['catalog-service'],
        endpoints: ['GET /products', 'GET /products/:id', 'GET /categories', 'GET /health'],
      },
      {
        id: 'cart-pricing-service',
        name: 'Cart & Authoritative Pricing Engine',
        basePath: '/api/cart',
        status: 'UP',
        description: 'Computes item-level subtotals, promotional discounts, GST/tax rules, and free delivery thresholds.',
        metrics: serviceMetrics['cart-pricing-service'],
        endpoints: ['POST /calculate', 'GET /health'],
      },
      {
        id: 'order-service',
        name: 'Order & Checkout Management Microservice',
        basePath: '/api/orders',
        status: 'UP',
        description: 'Handles order creation, status transitions (Processing -> Shipped -> Delivered), and customer history.',
        metrics: serviceMetrics['order-service'],
        endpoints: ['GET /', 'GET /:id', 'POST /', 'PATCH /:id/status', 'GET /health'],
      },
      {
        id: 'logistics-service',
        name: 'Logistics & Shipment Tracking Microservice',
        basePath: '/api/tracking',
        status: 'UP',
        description: 'Generates AWB tracking numbers, tracks linehaul courier stages, and manages delivery milestones.',
        metrics: serviceMetrics['logistics-service'],
        endpoints: ['GET /:orderId', 'POST /:orderId/stage', 'GET /health'],
      },
      {
        id: 'returns-service',
        name: 'Reverse Logistics & Returns Microservice',
        basePath: '/api/returns',
        status: 'UP',
        description: 'Processes 7-day return policies, schedules courier pickups, and verifies UPI refunds.',
        metrics: serviceMetrics['returns-service'],
        endpoints: ['POST /', 'GET /:returnId', 'GET /health'],
      },
    ],
    eventBus: {
      type: 'Asynchronous Event Bus',
      recentEvents: eventBus.getRecentEvents().slice(0, 10),
    },
    systemTime: new Date().toISOString(),
  });
});

// Gateway Root Health Check
apiGatewayRouter.get(['/health', '/gateway/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    message: 'BharatBazaar API Gateway is routing traffic to all 5 microservices.',
    timestamp: new Date().toISOString(),
  });
});
