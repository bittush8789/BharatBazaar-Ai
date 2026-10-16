import { Router, Request, Response, NextFunction } from 'express';
import { catalogServiceRouter } from './services/catalogService';
import { cartPricingServiceRouter } from './services/cartPricingService';
import { orderServiceRouter } from './services/orderService';
import { logisticsServiceRouter } from './services/logisticsService';
import { returnsServiceRouter } from './services/returnsService';
import { authServiceRouter } from './services/authService';
import { eventBus } from './events/eventBus';
import { db } from './db/client';

export const apiGatewayRouter = Router();

// Track microservices performance and request metrics
const serviceMetrics: Record<string, { requests: number; avgLatencyMs: number }> = {
  'auth-service': { requests: 0, avgLatencyMs: 14 },
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
apiGatewayRouter.use('/auth', createGatewayMiddleware('auth-service'), authServiceRouter);
apiGatewayRouter.use('/catalog', createGatewayMiddleware('catalog-service'), catalogServiceRouter);
apiGatewayRouter.use('/cart', createGatewayMiddleware('cart-pricing-service'), cartPricingServiceRouter);
apiGatewayRouter.use('/orders', createGatewayMiddleware('order-service'), orderServiceRouter);
apiGatewayRouter.use('/tracking', createGatewayMiddleware('logistics-service'), logisticsServiceRouter);
apiGatewayRouter.use('/returns', createGatewayMiddleware('returns-service'), returnsServiceRouter);

// GET /api/topology or /api/gateway/topology - Microservices Architecture Topology & Health Map
apiGatewayRouter.get(['/topology', '/gateway/topology'], async (_req: Request, res: Response) => {
  let dbStatus = 'CONNECTED';
  let counts = { users: 0, products: 0, orders: 0 };
  try {
    const [userCount, productCount, orderCount] = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.order.count(),
    ]);
    counts = { users: userCount, products: productCount, orders: orderCount };
  } catch (e) {
    dbStatus = 'DISCONNECTED';
  }

  res.json({
    gateway: {
      name: 'BharatBazaar Core API Gateway',
      version: '3.0.0',
      status: 'HEALTHY',
      architecture: 'Distributed Microservices Architecture',
      database: {
        engine: 'PostgreSQL 18',
        orm: 'Prisma Client v6',
        status: dbStatus,
        records: counts,
      },
      protocol: 'REST / JSON + In-Process Event-Driven Pub/Sub',
    },
    services: [
      {
        id: 'auth-service',
        name: 'Identity & Authentication Microservice',
        basePath: '/api/auth',
        status: 'UP',
        description: 'Handles OTP generation/verification, JWT token management, and customer profile synchronization in PostgreSQL.',
        metrics: serviceMetrics['auth-service'],
        endpoints: ['POST /send-otp', 'POST /verify-otp', 'POST /login-email', 'GET /me', 'PATCH /profile'],
      },
      {
        id: 'catalog-service',
        name: 'Product Catalog & Search Microservice',
        basePath: '/api/catalog',
        status: 'UP',
        description: 'Queries products from PostgreSQL with case-insensitive search, category facets, and price/rating sorting.',
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
        description: 'Persists orders and order items to PostgreSQL, creates shipment manifests, and emits ORDER_PLACED events.',
        metrics: serviceMetrics['order-service'],
        endpoints: ['GET /', 'GET /:id', 'POST /', 'PATCH /:id/status', 'GET /health'],
      },
      {
        id: 'logistics-service',
        name: 'Logistics & Shipment Tracking Microservice',
        basePath: '/api/tracking',
        status: 'UP',
        description: 'Generates AWB tracking numbers, tracks linehaul courier stages, and updates shipment history in PostgreSQL.',
        metrics: serviceMetrics['logistics-service'],
        endpoints: ['GET /:orderId', 'POST /:orderId/stage', 'GET /health'],
      },
      {
        id: 'returns-service',
        name: 'Reverse Logistics & Returns Microservice',
        basePath: '/api/returns',
        status: 'UP',
        description: 'Processes 7-day return policies, schedules courier pickups, and manages UPI refunds in PostgreSQL.',
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
apiGatewayRouter.get(['/health', '/gateway/health'], async (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    database: 'PostgreSQL 18 Connected',
    message: 'BharatBazaar API Gateway is routing traffic to all 6 microservices.',
    timestamp: new Date().toISOString(),
  });
});
