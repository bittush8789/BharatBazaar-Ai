import { Router, Request, Response } from 'express';
import { eventBus } from '../events/eventBus';
import { db } from '../db/client';

export const logisticsServiceRouter = Router();

// GET /api/tracking/:orderId - Retrieve tracking details for an order
logisticsServiceRouter.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    let shipment = await db.shipment.findFirst({
      where: {
        OR: [
          { order: { orderId } },
          { awbNumber: orderId },
        ],
      },
      include: {
        order: true,
      },
    });

    if (!shipment) {
      // If order exists without shipment, create shipment record
      const order = await db.order.findUnique({ where: { orderId } });
      if (order) {
        const awb = `BB-EXP-${Math.floor(10000 + Math.random() * 90000)}`;
        const now = new Date();
        shipment = await db.shipment.create({
          data: {
            orderId: order.id,
            awbNumber: awb,
            carrier: 'Bharat Express Logistics',
            currentStage: order.status === 'Delivered' ? 'delivered' : order.status === 'Shipped' ? 'shipped' : 'placed',
            timeline: [
              { stage: 'Order Placed', timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), location: 'Surat Fulfillment Center', description: 'Package barcoded and verified.' },
              { stage: 'Shipped', timestamp: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(), location: 'National Sorting Center, Delhi NCR', description: 'Dispatched on Linehaul transport.' },
              ...(order.status === 'Delivered' ? [
                { stage: 'Out for Delivery', timestamp: now.toISOString(), location: 'Local Delivery Station', description: 'Assigned to courier executive.' },
                { stage: 'Delivered', timestamp: now.toISOString(), location: 'Customer Address', description: 'Delivered with OTP verification.' },
              ] : []),
            ],
          },
          include: { order: true },
        });
      }
    }

    if (!shipment) {
      return res.status(404).json({
        service: 'logistics-service',
        status: 'error',
        message: `Tracking info not found for order ${orderId}`,
      });
    }

    res.json({
      service: 'logistics-service',
      database: 'PostgreSQL',
      status: 'success',
      data: {
        orderId: shipment.order?.orderId || orderId,
        awbNumber: shipment.awbNumber,
        carrier: shipment.carrier,
        currentStage: shipment.currentStage,
        timeline: shipment.timeline,
      },
    });
  } catch (error: any) {
    console.error('[LogisticsService] Error fetching tracking:', error);
    res.status(500).json({ service: 'logistics-service', status: 'error', message: error.message });
  }
});

// POST /api/tracking/:orderId/stage - Advance shipment stage
logisticsServiceRouter.post('/:orderId/stage', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { stage, location, description } = req.body;

    const shipment = await db.shipment.findFirst({
      where: {
        OR: [
          { order: { orderId } },
          { awbNumber: orderId },
        ],
      },
    });

    if (!shipment) {
      return res.status(404).json({
        service: 'logistics-service',
        status: 'error',
        message: 'Shipment record not found',
      });
    }

    const timeline = (shipment.timeline as any[]) || [];
    timeline.push({
      stage: stage || 'In Transit',
      timestamp: new Date().toISOString(),
      location: location || 'Express Hub Hubli',
      description: description || `Status updated to ${stage}`,
    });

    const updated = await db.shipment.update({
      where: { id: shipment.id },
      data: {
        currentStage: stage || shipment.currentStage,
        timeline,
      },
    });

    eventBus.publish('SHIPMENT_STAGE_UPDATED', 'logistics-service', {
      orderId,
      awbNumber: updated.awbNumber,
      stage: updated.currentStage,
    });

    res.json({
      service: 'logistics-service',
      database: 'PostgreSQL',
      status: 'success',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ service: 'logistics-service', status: 'error', message: error.message });
  }
});

// Health check
logisticsServiceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'logistics-service',
    status: 'UP',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});
