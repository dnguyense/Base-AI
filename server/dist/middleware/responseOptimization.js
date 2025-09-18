"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPagination = exports.createPaginatedResponse = exports.compressionOptimization = exports.cacheControlMiddleware = exports.etagMiddleware = exports.generateETag = exports.paginationMiddleware = void 0;
const crypto_1 = __importDefault(require("crypto"));
const paginationMiddleware = (defaultLimit = 20, maxLimit = 100) => {
    return (req, res, next) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
        req.pagination = {
            page,
            limit,
            offset: (page - 1) * limit
        };
        next();
    };
};
exports.paginationMiddleware = paginationMiddleware;
const generateETag = (data) => {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto_1.default.createHash('md5').update(content).digest('hex');
};
exports.generateETag = generateETag;
const etagMiddleware = () => {
    return (req, res, next) => {
        const originalSend = res.send;
        res.send = function (body) {
            if (res.statusCode === 200 && body) {
                const etag = (0, exports.generateETag)(body);
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
exports.etagMiddleware = etagMiddleware;
const cacheControlMiddleware = () => {
    return (req, res, next) => {
        const path = req.path;
        if (path.includes('/api/v1/pricing')) {
            res.set('Cache-Control', 'public, max-age=3600');
        }
        else if (path.includes('/api/v1/user') && req.method === 'GET') {
            res.set('Cache-Control', 'private, max-age=600');
        }
        else if (path.includes('/api/v1/auth')) {
            res.set('Cache-Control', 'private, max-age=300');
        }
        else if (path.includes('/api/v1/compress') || path.includes('/upload')) {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
        }
        else if (path.includes('/static') || path.includes('/assets')) {
            res.set('Cache-Control', 'public, max-age=86400');
        }
        else {
            res.set('Cache-Control', 'public, max-age=300');
        }
        next();
    };
};
exports.cacheControlMiddleware = cacheControlMiddleware;
const compressionOptimization = () => {
    return (req, res, next) => {
        const originalJson = res.json;
        const originalSend = res.send;
        res.json = function (obj) {
            res.set('Content-Type', 'application/json; charset=utf-8');
            res.set('Vary', 'Accept-Encoding');
            return originalJson.call(this, obj);
        };
        res.send = function (body) {
            if (typeof body === 'string') {
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
exports.compressionOptimization = compressionOptimization;
const createPaginatedResponse = (data, totalItems, page, limit) => {
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
exports.createPaginatedResponse = createPaginatedResponse;
const applyPagination = (query, pagination) => {
    return query
        .offset(pagination.offset)
        .limit(pagination.limit);
};
exports.applyPagination = applyPagination;
//# sourceMappingURL=responseOptimization.js.map