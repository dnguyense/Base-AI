"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error(`Error ${err.statusCode || 500}: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { ...error, statusCode: 404, message };
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { ...error, statusCode: 400, message };
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = { ...error, statusCode: 400, message };
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { ...error, statusCode: 401, message };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { ...error, statusCode: 401, message };
    }
    if (err.name === 'MulterError') {
        let message = 'File upload error';
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large';
        }
        else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Too many files or unexpected field name';
        }
        error = { ...error, statusCode: 400, message };
    }
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map((e) => e.message).join(', ');
        error = { ...error, statusCode: 400, message };
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        const message = 'Duplicate field value entered';
        error = { ...error, statusCode: 400, message };
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        const message = 'Invalid reference to another resource';
        error = { ...error, statusCode: 400, message };
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: {
            message: error.message || 'Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
            ...(error.errors && { details: error.errors })
        },
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map