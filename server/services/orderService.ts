import { Router, Request, Response } from 'express';
import { eventBus } from '../events/eventBus';
import { db } from '../db/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const orderServiceRouter = Router();

// GET /api/orders - List orders for authenticated user from PostgreSQL
orderServiceRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;
    const authenticatedPhone = req.user?.phone;

    const where: any = {};
    if (status && status !== 'All') {
      where.status = status as string;
    }
    // Security: Only show orders belonging to this authenticated user
    if (authenticatedPhone) {
      where.OR = [
        { customerPhone: authenticatedPhone },
        { userId: req.user?.userId },
      ];
    }

    const orders = await db.order.findMany({
      where,
      include: {
        items: true,
        shipment: true,
        returnRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format to match frontend PlacedOrder structure
    const formattedOrders = orders.map((o) => ({
      orderId: o.orderId,
      date: o.createdAt.toISOString(),
      status: o.status,
      customer: {
        fullName: o.customerName,
        email: o.customerEmail,
        phone: o.customerPhone,
        streetAddress: o.streetAddress,
        city: o.city,
        state: o.state,
        postalCode: o.postalCode,
        paymentMethod: o.paymentMethod,
      },
      items: o.items.map((i) => ({
        product: {
          id: i.productId,
          name: i.productName,
          price: i.unitPrice,
          image: i.productImage,
        },
        quantity: i.quantity,
      })),
      subtotal: o.subtotal,
      discount: o.discount,
      deliveryFee: o.deliveryFee,
      total: o.total,
      shipment: o.shipment
        ? {
            awbNumber: o.shipment.awbNumber,
            carrier: o.shipment.carrier,
            currentStage: o.shipment.currentStage,
            timeline: o.shipment.timeline,
          }
        : undefined,
      returnRequest: o.returnRequest
        ? {
            returnId: o.returnRequest.returnId,
            reason: o.returnRequest.reason,
            date: o.returnRequest.createdAt.toISOString(),
            resolution: o.returnRequest.resolution,
          }
        : undefined,
    }));

    res.json({
      service: 'order-service',
      database: 'PostgreSQL',
      status: 'success',
      count: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (error: any) {
    console.error('[OrderService] Error fetching orders:', error);
    res.status(500).json({ service: 'order-service', status: 'error', message: error.message });
  }
});

// GET /api/orders/:id - Get order by Order Reference ID
orderServiceRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await db.order.findUnique({
      where: { orderId: req.params.id },
      include: {
        items: true,
        shipment: true,
        returnRequest: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        service: 'order-service',
        status: 'error',
        message: `Order ${req.params.id} not found`,
      });
    }

    res.json({
      service: 'order-service',
      database: 'PostgreSQL',
      status: 'success',
      data: {
        orderId: order.orderId,
        date: order.createdAt.toISOString(),
        status: order.status,
        customer: {
          fullName: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          streetAddress: order.streetAddress,
          city: order.city,
          state: order.state,
          postalCode: order.postalCode,
          paymentMethod: order.paymentMethod,
        },
        items: order.items.map((i) => ({
          product: {
            id: i.productId,
            name: i.productName,
            price: i.unitPrice,
            image: i.productImage,
          },
          quantity: i.quantity,
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        deliveryFee: order.deliveryFee,
        total: order.total,
        shipment: order.shipment,
        returnRequest: order.returnRequest,
      },
    });
  } catch (error: any) {
    res.status(500).json({ service: 'order-service', status: 'error', message: error.message });
  }
});

// POST /api/orders - Create new order in PostgreSQL (Requires Authentication)
orderServiceRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, customer, items, subtotal, discount, deliveryFee, total, status, paymentStatus, transactionId } = req.body;
    const authenticatedUser = req.user;

    if (!orderId || !customer || !items || items.length === 0) {
      return res.status(400).json({
        service: 'order-service',
        status: 'error',
        message: 'Missing required order fields',
      });
    }

    // Associate with authenticated user
    const userPhone = authenticatedUser?.phone || customer.phone;
    let user = await db.user.findUnique({ where: { phone: userPhone } });
    if (!user && userPhone) {
      user = await db.user.create({
        data: {
          phone: userPhone,
          name: customer.fullName || authenticatedUser?.name || 'Customer',
          email: customer.email || `${userPhone}@bharatbazaar.in`,
          addresses: {
            create: {
              street: customer.streetAddress || '',
              city: customer.city || '',
              state: customer.state || '',
              pincode: customer.postalCode || '',
              isDefault: true,
            },
          },
        },
      });
    }

    // Create Order with Items and Shipment in PostgreSQL
    const awbNumber = `BB-EXP-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();

    const createdOrder = await db.order.create({
      data: {
        orderId,
        userId: user?.id || null,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        streetAddress: customer.streetAddress,
        city: customer.city,
        state: customer.state,
        postalCode: customer.postalCode,
        paymentMethod: customer.paymentMethod || 'cod',
        paymentStatus: paymentStatus || (customer.paymentMethod === 'cod' ? 'PENDING' : 'PAID'),
        transactionId: transactionId || (customer.paymentMethod !== 'cod' ? `TXN_BB_${Math.floor(10000000 + Math.random() * 90000000)}` : null),
        status: status || 'Processing',
        subtotal: Number(subtotal) || 0,
        discount: Number(discount) || 0,
        deliveryFee: Number(deliveryFee) || 0,
        total: Number(total) || 0,
        items: {
          create: items.map((item: any) => ({
            productId: item.product?.id || 'prod_1',
            productName: item.product?.name || 'Item',
            productImage: item.product?.image || '',
            unitPrice: Number(item.product?.price) || 0,
            quantity: Number(item.quantity) || 1,
            totalPrice: (Number(item.product?.price) || 0) * (Number(item.quantity) || 1),
          })),
        },
        shipment: {
          create: {
            awbNumber,
            carrier: 'Bharat Express Logistics',
            currentStage: 'placed',
            timeline: [
              {
                stage: 'Order Placed',
                timestamp: now.toISOString(),
                location: 'Merchant Fulfillment Hub, Surat',
                description: 'Order confirmed and registered in Bharat Express Logistics.',
              },
            ],
          },
        },
      },
      include: {
        items: true,
        shipment: true,
      },
    });

    // Publish event to Event Bus
    eventBus.publish('ORDER_PLACED', 'order-service', {
      orderId: createdOrder.orderId,
      customerPhone: customer.phone,
      total: createdOrder.total,
      itemCount: items.length,
      awbNumber,
    });

    res.status(201).json({
      service: 'order-service',
      database: 'PostgreSQL',
      status: 'success',
      data: createdOrder,
    });
  } catch (error: any) {
    console.error('[OrderService] Error creating order:', error);
    res.status(500).json({ service: 'order-service', status: 'error', message: error.message });
  }
});

// PATCH /api/orders/:id/status - Update order lifecycle status
orderServiceRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        service: 'order-service',
        status: 'error',
        message: 'Invalid status transition value',
      });
    }

    const updated = await db.order.update({
      where: { orderId: req.params.id },
      data: { status },
      include: { shipment: true },
    });

    // Update shipment stage if needed
    if (updated.shipment) {
      let stage = 'placed';
      if (status === 'Shipped') stage = 'shipped';
      if (status === 'Delivered') stage = 'delivered';

      const timeline = (updated.shipment.timeline as any[]) || [];
      timeline.push({
        stage: status,
        timestamp: new Date().toISOString(),
        location: status === 'Delivered' ? 'Customer Address' : 'Express Transit Hub',
        description: `Shipment status progressed to ${status}.`,
      });

      await db.shipment.update({
        where: { id: updated.shipment.id },
        data: { currentStage: stage, timeline },
      });
    }

    // Publish event
    eventBus.publish('ORDER_STATUS_UPDATED', 'order-service', {
      orderId: updated.orderId,
      newStatus: status,
    });

    res.json({
      service: 'order-service',
      database: 'PostgreSQL',
      status: 'success',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ service: 'order-service', status: 'error', message: error.message });
  }
});

// Health check
orderServiceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'order-service',
    status: 'UP',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});
