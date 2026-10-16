import { Router, Request, Response } from 'express';
import { PRODUCTS, CATEGORIES } from '../../src/data/products';

export const catalogServiceRouter = Router();

// GET /api/catalog/products - List products with search, category & sort filters
catalogServiceRouter.get('/products', (req: Request, res: Response) => {
  const { category, search, sortBy } = req.query;

  let results = [...PRODUCTS];

  if (category && category !== 'All') {
    results = results.filter((p) => p.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  switch (sortBy) {
    case 'price-asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'discount-desc':
      results.sort((a, b) => b.discountPercentage - a.discountPercentage);
      break;
    default:
      break;
  }

  res.json({
    service: 'catalog-service',
    status: 'success',
    count: results.length,
    data: results,
  });
});

// GET /api/catalog/products/:id - Product details
catalogServiceRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({
      service: 'catalog-service',
      status: 'error',
      message: 'Product not found',
    });
  }

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  res.json({
    service: 'catalog-service',
    status: 'success',
    data: {
      ...product,
      related,
    },
  });
});

// GET /api/catalog/categories - List available categories
catalogServiceRouter.get('/categories', (_req: Request, res: Response) => {
  res.json({
    service: 'catalog-service',
    status: 'success',
    data: CATEGORIES,
  });
});

// GET /api/catalog/health
catalogServiceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'catalog-service',
    status: 'UP',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
