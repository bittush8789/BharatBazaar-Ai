import { Router, Request, Response } from 'express';
import { eventBus } from '../events/eventBus';
import { db } from '../db/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const returnsServiceRouter = Router();

// POST /api/returns - Initiate 7-day return request in PostgreSQL (Requires Auth)
returnsServiceRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, reason, resolution, upiOrAccount } = req.body;

    if (!orderId) {
      return res.status(400).json({
        service: 'returns-service',
        status: 'error',
        message: 'orderId is required',
      });
    }

    const order = await db.order.findUnique({ where: { orderId } });
    if (!order) {
      return res.status(404).json({
        service: 'returns-service',
        status: 'error',
        message: `Order ${orderId} not found`,
      });
    }

    const returnId = `RET-${Math.floor(100000 + Math.random() * 900000)}`;
    const pickupDate = new Date(Date.now() + 48 * 3600 * 1000);

    const record = await db.returnRequest.upsert({
      where: { orderId: order.id },
      update: {
        reason: reason || 'Size/Fit issue',
        resolution: resolution || 'refund',
        upiOrAccount: upiOrAccount || 'Original Payment Source',
        status: 'PENDING_PICKUP',
        pickupDate,
      },
      create: {
        returnId,
        orderId: order.id,
        reason: reason || 'Size/Fit issue',
        resolution: resolution || 'refund',
        upiOrAccount: upiOrAccount || 'Original Payment Source',
        status: 'PENDING_PICKUP',
        pickupDate,
      },
    });

    // Publish event to EventBus
    eventBus.publish('RETURN_REQUESTED', 'returns-service', {
      returnId: record.returnId,
      orderId,
      resolution: record.resolution,
      pickupScheduled: pickupDate.toISOString(),
    });

    res.status(201).json({
      service: 'returns-service',
      database: 'PostgreSQL',
      status: 'success',
      data: {
        returnId: record.returnId,
        orderId,
        reason: record.reason,
        resolution: record.resolution,
        upiOrAccount: record.upiOrAccount,
        status: record.status,
        pickupDate: record.pickupDate.toISOString(),
        requestedAt: record.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[ReturnsService] Error creating return:', error);
    res.status(500).json({ service: 'returns-service', status: 'error', message: error.message });
  }
});

// GET /api/returns/:returnId - Check return status
returnsServiceRouter.get('/:returnId', async (req: Request, res: Response) => {
  try {
    const { returnId } = req.params;

    const record = await db.returnRequest.findFirst({
      where: {
        OR: [{ returnId }, { order: { orderId: returnId } }],
      },
      include: { order: true },
    });

    if (!record) {
      return res.status(404).json({
        service: 'returns-service',
        status: 'error',
        message: `Return request ${returnId} not found`,
      });
    }

    res.json({
      service: 'returns-service',
      database: 'PostgreSQL',
      status: 'success',
      data: {
        returnId: record.returnId,
        orderId: record.order?.orderId,
        reason: record.reason,
        resolution: record.resolution,
        upiOrAccount: record.upiOrAccount,
        status: record.status,
        pickupDate: record.pickupDate.toISOString(),
        requestedAt: record.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ service: 'returns-service', status: 'error', message: error.message });
  }
});

// Health check
returnsServiceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'returns-service',
    status: 'UP',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});
