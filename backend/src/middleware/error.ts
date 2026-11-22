import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = (err as AppError).statusCode || 500;
  let message = err.message || 'Internal server error';

  // Prisma errors → clear HTTP errors instead of 500s.
  const prismaCode = (err as { code?: string }).code;
  const isPrismaError = err.constructor?.name?.startsWith('PrismaClient');
  if (isPrismaError) {
    if (prismaCode === 'P2002') {
      const target = (err as { meta?: { target?: string[] | string } }).meta?.target;
      statusCode = 409;
      message = `This ${Array.isArray(target) ? target.join(', ') : target ?? 'value'} is already taken`;
    } else if (prismaCode === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else if (prismaCode === 'P2003' || prismaCode === 'P2014') {
      statusCode = 400;
      message = 'This record is linked to other data and cannot be saved or deleted that way';
    } else if (err.constructor.name === 'PrismaClientValidationError') {
      statusCode = 400;
      message = 'Invalid data: check field names, types and required fields';
    }
  } else if ((err as { type?: string }).type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body is not valid JSON';
  }
  // Never leak internals of unexpected errors outside development.
  if (statusCode >= 500 && process.env.NODE_ENV !== 'development') message = 'Internal server error';

  if (statusCode >= 500) console.error(`[${new Date().toISOString()}] ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    statusCode,
    timestamp: new Date().toISOString(),
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const notFound = (req: Request, res: Response) => {
  const suggested = req.url !== '/health' && !req.url.startsWith('/api/')
    ? ` Try: /api${req.url}`
    : '';
  res.status(404).json({
    success: false,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    message: 'Route not found' + suggested,
  });
};
