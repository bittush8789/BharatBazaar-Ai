import { Router, Request, Response } from 'express';
import { eventBus } from '../events/eventBus';
import { PRODUCTS } from '../../src/data/products';

export const orderServiceRouter = Router();

// In-memory order datastore for the microservice
let ordersStore: any[] = [];

// Seed initial orders so endpoints have data immediately
function seedInitialOrders() {
  const now = Date.now();
  ordersStore = [
    {
      orderId: 'BB-89410291',
      date: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
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
        { product: PRODUCTS[0], quantity: 1 },
        { product: PRODUCTS[13], quantity: 1 },
      ],
      subtotal: PRODUCTS[0].price + PRODUCTS[13].price,
      discount: (PRODUCTS[0].originalPrice - PRODUCTS[0].price) + (PRODUCTS[13].originalPrice - PRODUCTS[13].price),
      deliveryFee: 0,
      total: PRODUCTS[0].price + PRODUCTS[13].price,
    },
    {
      orderId: 'BB-78192043',
      date: new Date(now - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
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
        { product: PRODUCTS[4], quantity: 2 },
      ],
      subtotal: PRODUCTS[4].price * 2,
      discount: (PRODUCTS[4].originalPrice - PRODUCTS[4].price) * 2,
      deliveryFee: 0,
      total: PRODUCTS[4].price * 2,
    },
    {
      orderId: 'BB-91024855',
      date: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
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
        { product: PRODUCTS[7], quantity: 1 },
        { product: PRODUCTS[10], quantity: 1 },
      ],
      subtotal: PRODUCTS[7].price + PRODUCTS[10].price,
      discount: (PRODUCTS[7].originalPrice - PRODUCTS[7].price) + (PRODUCTS[10].originalPrice - PRODUCTS[10].price),
      deliveryFee: 0,
      total: PRODUCTS[7].price + PRODUCTS[10].price,
    },
  ];
}
seedInitialOrders();

// GET /api/orders - List all past orders
orderServiceRouter.get('/', (req: Request, res: Response) => {
  const { status } = req.query;
  let results = [...ordersStore];

  if (status && status !== 'All') {
    results = results.filter((o) => o.status === status);
  }

  res.json({
    service: 'order-service',
    status: 'success',
    count: results.length,
    data: results,
  });
});

// GET /api/orders/:id - Get order by ID
orderServiceRouter.get('/:id', (req: Request, res: Response) => {
  const order = ordersStore.find((o) => o.orderId === req.params.id);
  if (!order) {
    return res.status(404).json({
      service: 'order-service',
      status: 'error',
      message: 'Order not found',
    });
  }

  res.json({
    service: 'order-service',
    status: 'success',
    data: order,
  });
});

// POST /api/orders - Create new order
orderServiceRouter.post('/', (req: Request, res: Response) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.orderId) {
    return res.status(400).json({
      service: 'order-service',
      status: 'error',
      message: 'Invalid order payload',
    });
  }

  // Prepend to store
  ordersStore = [newOrder, ...ordersStore.filter((o) => o.orderId !== newOrder.orderId)];

  // Publish event to EventBus for other microservices (Logistics, Notification)
  eventBus.publish('ORDER_PLACED', 'order-service', {
    orderId: newOrder.orderId,
    customer: newOrder.customer,
    total: newOrder.total,
    itemCount: newOrder.items?.length || 0,
  });

  res.status(201).json({
    service: 'order-service',
    status: 'created',
    data: newOrder,
  });
});

// PATCH /api/orders/:id/status - Update order status
orderServiceRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const orderIndex = ordersStore.findIndex((o) => o.orderId === req.params.id);

  if (orderIndex === -1) {
    return res.status(404).json({
      service: 'order-service',
      status: 'error',
      message: 'Order not found',
    });
  }

  ordersStore[orderIndex] = {
    ...ordersStore[orderIndex],
    status,
  };

  eventBus.publish('ORDER_STATUS_UPDATED', 'order-service', {
    orderId: req.params.id,
    newStatus: status,
  });

  res.json({
    service: 'order-service',
    status: 'updated',
    data: ordersStore[orderIndex],
  });
});

// GET /api/orders/health
orderServiceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'order-service',
    status: 'UP',
    version: '1.0.0',
    totalOrdersManaged: ordersStore.length,
    timestamp: new Date().toISOString(),
  });
});
