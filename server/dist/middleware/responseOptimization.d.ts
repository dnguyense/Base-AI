import { Request, Response, NextFunction } from 'express';
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
export declare const paginationMiddleware: (defaultLimit?: number, maxLimit?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const generateETag: (data: any) => string;
export declare const etagMiddleware: () => (req: Request, res: Response, next: NextFunction) => void;
export declare const cacheControlMiddleware: () => (req: Request, res: Response, next: NextFunction) => void;
export declare const compressionOptimization: () => (req: Request, res: Response, next: NextFunction) => void;
export declare const createPaginatedResponse: <T>(data: T[], totalItems: number, page: number, limit: number) => PaginatedResponse<T>;
export declare const applyPagination: (query: any, pagination: {
    page: number;
    limit: number;
    offset: number;
}) => any;
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
//# sourceMappingURL=responseOptimization.d.ts.map