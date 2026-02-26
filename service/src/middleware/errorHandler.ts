/**
 * Error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { error } from '../types/api.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Unhandled error:', err);
  
  res.status(500).json(
    error(
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
    )
  );
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(error(`Route not found: ${req.path}`));
}
