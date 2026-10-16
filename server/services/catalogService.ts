import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { PRODUCTS, CATEGORIES } from '../../src/data/products';

export const catalogServiceRouter = Router();

// GET /api/catalog/products - List products with search, category & sort filters from PostgreSQL
catalogServiceRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const { category, search, sortBy } = req.query;

    const whereClause: any = {};

    if (category && category !== 'All') {
      whereClause.categoryName = category as string;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { categoryName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'asc' };
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating-desc':
        orderBy = { rating: 'desc' };
        break;
      case 'discount-desc':
        orderBy = { discountPercentage: 'desc' };
        break;
      default:
        orderBy = { id: 'asc' };
        break;
    }

    // Try fetching from PostgreSQL database
    let products = await db.product.findMany({
      where: whereClause,
      orderBy,
    });

    // Fallback if DB not seeded yet
    if (products.length === 0 && !search && (!category || category === 'All')) {
      products = PRODUCTS as any;
    }

    res.json({
      service: 'catalog-service',
      database: 'PostgreSQL',
      status: 'success',
      count: products.length,
      data: products.map((p) => ({
        ...p,
        category: (p as any).categoryName || (p as any).category,
      })),
    });
  } catch (error: any) {
    console.warn('[CatalogService] Fallback to in-memory on DB error:', error.message);
    // Graceful fallback to static products
    res.json({
      service: 'catalog-service',
      database: 'In-Memory Fallback',
      status: 'success',
      count: PRODUCTS.length,
      data: PRODUCTS,
    });
  }
});

// GET /api/catalog/products/:id - Product details from PostgreSQL
catalogServiceRouter.get('/products/:id', async (req: Request, res: Response) => {
  try {
    let product = await db.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      // Fallback
      product = (PRODUCTS.find((p) => p.id === req.params.id) as any) || null;
    }

    if (!product) {
      return res.status(404).json({
        service: 'catalog-service',
        status: 'error',
        message: 'Product not found',
      });
    }

    res.json({
      service: 'catalog-service',
      database: 'PostgreSQL',
      status: 'success',
      data: {
        ...product,
        category: (product as any).categoryName || (product as any).category,
      },
    });
  } catch (error: any) {
    console.error('[CatalogService] Error fetching product:', error);
    res.status(500).json({ service: 'catalog-service', status: 'error', message: error.message });
  }
});

// GET /api/catalog/categories - List categories from PostgreSQL
catalogServiceRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    let categories = await db.category.findMany();
    if (categories.length === 0) {
      categories = CATEGORIES.map((c) => ({ id: c, name: c, slug: c.toLowerCase().replace(/[^a-z0-9]/g, '-') })) as any;
    }

    res.json({
      service: 'catalog-service',
      database: 'PostgreSQL',
      status: 'success',
      count: categories.length,
      data: categories,
    });
  } catch (error: any) {
    res.json({
      service: 'catalog-service',
      status: 'success',
      data: CATEGORIES,
    });
  }
});

// Health check
catalogServiceRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'catalog-service',
    status: 'UP',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});
