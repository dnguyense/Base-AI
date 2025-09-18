import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Pagination middleware for large datasets
 */
export const paginationMiddleware = (defaultLimit: number = 20, maxLimit: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(req.query.limit as string) || defaultLimit)
    );
    
    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit
    };
    
    next();
  };
};

/**
 * Generate ETag for response data
 */
export const generateETag = (data: any): string => {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('md5').update(content).digest('hex');
};

/**
 * ETag middleware for conditional requests
 */
export const etagMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body: any) {
      if (res.statusCode === 200 && body) {
        const etag = generateETag(body);
        res.set('ETag', `"${etag}"`);
        
        const clientETag = req.headers['if-none-match'];
        if (clientETag === `"${etag}"`) {
          res.status(304);
          return originalSend.call(this, '');
        }
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
};

/**
 * Cache control headers middleware
 */
export const cacheControlMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set cache headers based on endpoint
    const path = req.path;
    
    if (path.includes('/api/v1/pricing')) {
      // Cache pricing data for 1 hour
      res.set('Cache-Control', 'public, max-age=3600');
    } else if (path.includes('/api/v1/user') && req.method === 'GET') {
      // Cache user data for 10 minutes
      res.set('Cache-Control', 'private, max-age=600');
    } else if (path.includes('/api/v1/auth')) {
      // Cache auth responses for 5 minutes
      res.set('Cache-Control', 'private, max-age=300');
    } else if (path.includes('/api/v1/compress') || path.includes('/upload')) {
      // Never cache compression or upload requests
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    } else if (path.includes('/static') || path.includes('/assets')) {
      // Cache static assets for 1 day
      res.set('Cache-Control', 'public, max-age=86400');
    } else {
      // Default: cache for 5 minutes
      res.set('Cache-Control', 'public, max-age=300');
    }
    
    next();
  };
};

/**
 * Response compression optimization
 */
export const compressionOptimization = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set content-type specific compression hints
    const originalJson = res.json;
    const originalSend = res.send;
    
    res.json = function(obj: any) {
      res.set('Content-Type', 'application/json; charset=utf-8');
      // Enable compression for JSON responses
      res.set('Vary', 'Accept-Encoding');
      return originalJson.call(this, obj);
    };
    
    res.send = function(body: any) {
      if (typeof body === 'string') {
        // Set appropriate content-type and enable compression
        if (!res.get('Content-Type')) {
          res.set('Content-Type', 'text/html; charset=utf-8');
        }
        res.set('Vary', 'Accept-Encoding');
      }
      return originalSend.call(this, body);
    };
    
    next();
  };
};

/**
 * Helper function to create paginated response
 */
export const createPaginatedResponse = <T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * Database query pagination helper
 */
export const applyPagination = (query: any, pagination: { page: number; limit: number; offset: number }) => {
  return query
    .offset(pagination.offset)
    .limit(pagination.limit);
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
    }
  }
}