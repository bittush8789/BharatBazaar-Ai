import { Router, Request, Response } from 'express';
import { eventBus } from '../events/eventBus';

export const returnsServiceRouter = Router();

interface ReturnRecord {
  returnId: string;
  orderId: string;
  reason: string;
  resolution: 'refund' | 'exchange';
  upiOrAccount: string;
  status: 'PENDING_PICKUP' | 'INSPECTED' | 'REFUNDED';
  pickupDate: string;
  requestedAt: string;
}

const returnsStore: Map<string, ReturnRecord> = new Map();

// POST /api/returns - Initiate 7-day return request
returnsServiceRouter.post('/', (req: Request, res: Response) => {
  const { orderId, reason, resolution, upiOrAccount, selectedProductIds } = req.body;

  if (!orderId) {
    return res.status(400).json({
      service: 'returns-service',
      status: 'error',
      message: 'orderId is required',
    });
  }

  const returnId = `RET-${Math.floor(100000 + Math.random() * 900000)}`;
  const pickupDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

  const record: ReturnRecord = {
    returnId,
    orderId,
    reason: reason || 'Size/Fit issue',
    resolution: resolution || 'refund',
    upiOrAccount: upiOrAccount || 'Original Payment Source',
    status: 'PENDING_PICKUP',
    pickupDate,
    requestedAt: new Date().toISOString(),
  };

  returnsStore.set(returnId, record);

  // Publish event to EventBus
  eventBus.publish('RETURN_REQUESTED', 'returns-service', {
    returnId,
    orderId,
    resolution,
    pickupScheduled: pickupDate,
  });

  res.status(201).json({
    service: 'returns-service',
    status: 'success',
    data: record,
  });
});

// GET /api/returns/health
returnsServiceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'returns-service',
    status: 'UP',
    version: '1.0.0',
    totalReturnsProcessed: returnsStore.size,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/returns/:returnId - Check return status
returnsServiceRouter.get('/:returnId', (req: Request, res: Response) => {
  const record = returnsStore.get(req.params.returnId);
  if (!record) {
    return res.status(404).json({
      service: 'returns-service',
      status: 'error',
      message: 'Return record not found',
    });
  }

  res.json({
    service: 'returns-service',
    status: 'success',
    data: record,
  });
});
