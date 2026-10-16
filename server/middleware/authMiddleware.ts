import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bharatbazaar_microservices_jwt_secret_2025';

export interface AuthenticatedUser {
  userId: string;
  phone: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Middleware: Enforce JWT authentication on protected microservice routes
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      service: 'api-gateway',
      status: 'error',
      code: 'AUTH_REQUIRED',
      message: 'Authentication required. Please login first to access this microservice.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({
      service: 'api-gateway',
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Your session has expired or is invalid. Please login again.',
    });
  }
};

// Optional auth middleware (identifies user if token is present, but doesn't block)
export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
    } catch {
      // Ignore token failure for optional endpoints
    }
  }
  next();
};
