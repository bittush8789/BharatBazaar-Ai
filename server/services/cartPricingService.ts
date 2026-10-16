import { Router, Request, Response } from 'express';
import { PRODUCTS } from '../../src/data/products';

export const cartPricingServiceRouter = Router();

interface CartItemInput {
  productId: string;
  quantity: number;
}

// POST /api/cart/calculate - Server-authoritative price breakdown & discount calculations
cartPricingServiceRouter.post('/calculate', (req: Request, res: Response) => {
  const itemsInput: CartItemInput[] = req.body.items || [];

  let subtotal = 0;
  let originalSubtotal = 0;
  let totalQuantity = 0;
  const validatedItems = [];

  for (const item of itemsInput) {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (product) {
      const qty = Math.max(1, Math.min(10, item.quantity));
      const itemSubtotal = product.price * qty;
      const itemOriginalSubtotal = product.originalPrice * qty;

      subtotal += itemSubtotal;
      originalSubtotal += itemOriginalSubtotal;
      totalQuantity += qty;

      validatedItems.push({
        product,
        quantity: qty,
        unitPrice: product.price,
        originalUnitPrice: product.originalPrice,
        itemSubtotal,
        itemSavings: itemOriginalSubtotal - itemSubtotal,
      });
    }
  }

  const totalSavings = Math.max(0, originalSubtotal - subtotal);
  const deliveryFee = 0; // Free delivery
  const estimatedTax = Math.round(subtotal * 0.05); // 5% GST inclusive
  const finalTotal = subtotal + deliveryFee;

  res.json({
    service: 'cart-pricing-service',
    status: 'success',
    data: {
      items: validatedItems,
      totalQuantity,
      originalSubtotal,
      subtotal,
      totalSavings,
      deliveryFee,
      estimatedTax,
      finalTotal,
      currency: 'INR',
    },
  });
});

// GET /api/cart/health
cartPricingServiceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'cart-pricing-service',
    status: 'UP',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
