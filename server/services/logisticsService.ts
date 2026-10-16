import { Router, Request, Response } from 'express';
import { eventBus } from '../events/eventBus';

export const logisticsServiceRouter = Router();

interface Shipment {
  orderId: string;
  awbNumber: string;
  carrier: string;
  currentStage: 'placed' | 'shipped' | 'out_for_delivery' | 'delivered';
  timeline: Array<{
    stage: string;
    timestamp: string;
    location: string;
    description: string;
  }>;
}

const shipmentsStore: Map<string, Shipment> = new Map();

// Helper to create initial shipment record
function createShipmentForOrder(orderId: string, currentStage: 'placed' | 'shipped' | 'out_for_delivery' | 'delivered' = 'shipped'): Shipment {
  const awb = `BB-EXP-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date();

  const shipment: Shipment = {
    orderId,
    awbNumber: awb,
    carrier: 'Bharat Express Logistics',
    currentStage,
    timeline: [
      {
        stage: 'Order Placed',
        timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
        location: 'Merchant Fulfillment Hub, Surat',
        description: 'Package verified, barcoded, and bagged.',
      },
      {
        stage: 'Shipped',
        timestamp: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
        location: 'National Linehaul Sorting Center, Delhi NCR',
        description: 'Dispatched on Linehaul interstate transport.',
      },
      {
        stage: 'Out for Delivery',
        timestamp: new Date().toISOString(),
        location: 'Destination Delivery Station',
        description: 'Assigned to courier executive for doorstep delivery.',
      },
      {
        stage: 'Delivered',
        timestamp: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
        location: 'Customer Address',
        description: 'Delivered with OTP / signature verification.',
      },
    ],
  };

  shipmentsStore.set(orderId, shipment);
  return shipment;
}

// Seed initial shipments for demo orders
createShipmentForOrder('BB-89410291', 'delivered');
createShipmentForOrder('BB-78192043', 'shipped');
createShipmentForOrder('BB-91024855', 'placed');

// Listen to decoupled events from OrderService via EventBus
eventBus.subscribe('ORDER_PLACED', (event: any) => {
  const { orderId } = event.payload || {};
  if (orderId) {
    const newShipment = createShipmentForOrder(orderId, 'placed');
    eventBus.publish('SHIPMENT_CREATED', 'logistics-service', {
      orderId,
      awbNumber: newShipment.awbNumber,
      carrier: newShipment.carrier,
    });
  }
});

// GET /api/tracking/health
logisticsServiceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'logistics-service',
    status: 'UP',
    version: '1.0.0',
    activeShipments: shipmentsStore.size,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/tracking/:orderId - Retrieve tracking timeline
logisticsServiceRouter.get('/:orderId', (req: Request, res: Response) => {
  let shipment = shipmentsStore.get(req.params.orderId);
  if (!shipment) {
    // Generate dynamically if missing
    shipment = createShipmentForOrder(req.params.orderId, 'shipped');
  }

  res.json({
    service: 'logistics-service',
    status: 'success',
    data: shipment,
  });
});

// POST /api/tracking/:orderId/stage - Update tracking stage
logisticsServiceRouter.post('/:orderId/stage', (req: Request, res: Response) => {
  const { stage } = req.body;
  let shipment = shipmentsStore.get(req.params.orderId);
  if (!shipment) {
    shipment = createShipmentForOrder(req.params.orderId);
  }

  shipment.currentStage = stage;
  shipmentsStore.set(req.params.orderId, shipment);

  eventBus.publish('SHIPMENT_STAGE_UPDATED', 'logistics-service', {
    orderId: req.params.orderId,
    newStage: stage,
    awbNumber: shipment.awbNumber,
  });

  res.json({
    service: 'logistics-service',
    status: 'success',
    data: shipment,
  });
});
