import { Request, Response, NextFunction } from 'express';

/**
 * Global Error Handler Middleware
 * Bắt tất cả errors trong ứng dụng và trả về response chuẩn
 * 
 * Đặt ở cuối cùng trong app.ts:
 * app.use(errorMiddleware);
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error ra console để debug
  console.error('=== ERROR OCCURRED ===');
  console.error('Path:', req.method, req.path);
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('======================');

  // Lấy status code từ error hoặc mặc định 500
  const statusCode = err.statusCode || err.status || 500;

  // Lấy error message
  const message = err.message || 'Internal Server Error';

  // Response format chuẩn
  const response: any = {
    success: false,
    message,
    statusCode
  };

  // Trong development mode, trả về stack trace để dễ debug
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  // Xử lý các loại error đặc biệt
  
  // 1. Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    response.message = 'Validation error';
    response.errors = err.errors.map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json(response);
  }

  // 2. Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    response.message = 'Duplicate entry';
    response.errors = err.errors.map((e: any) => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
    return res.status(409).json(response);
  }

  // 3. Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    response.message = 'Foreign key constraint error';
    response.error = 'Referenced record does not exist';
    return res.status(400).json(response);
  }

  // 4. JWT Error
  if (err.name === 'JsonWebTokenError') {
    response.message = 'Invalid token';
    return res.status(401).json(response);
  }

  // 5. JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    response.message = 'Token expired';
    return res.status(401).json(response);
  }

  // 6. Validation Error (class-validator)
  if (Array.isArray(err) && err[0]?.constraints) {
    response.message = 'Validation failed';
    response.errors = err.map((e: any) => ({
      field: e.property,
      constraints: e.constraints
    }));
    return res.status(400).json(response);
  }

  // 7. Cast Error (Invalid ID format)
  if (err.name === 'CastError') {
    response.message = 'Invalid ID format';
    return res.status(400).json(response);
  }

  // Default error response
  res.status(statusCode).json(response);
};

/**
 * Not Found Handler
 * Bắt các route không tồn tại
 * 
 * Đặt trước errorMiddleware trong app.ts:
 * app.use(notFoundHandler);
 * app.use(errorMiddleware);
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: any = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async Error Handler Wrapper
 * Wrap async functions để tự động catch errors
 * 
 * Usage:
 * router.get('/test', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};