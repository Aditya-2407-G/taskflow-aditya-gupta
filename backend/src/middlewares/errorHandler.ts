import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId;

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: err.message,
      fields: err.fields,
      ...(requestId && { requestId }),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(requestId && { requestId }),
    });
    return;
  }

  // Unexpected error
  logger.error({ err, requestId }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    ...(requestId && { requestId }),
  });
}
