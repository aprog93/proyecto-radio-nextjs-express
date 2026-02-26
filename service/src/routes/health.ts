/**
 * Health check routes
 */

import { Router, Request, Response } from 'express';
import { success } from '../types/api.js';

const router: Router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', (req: Request, res: Response) => {
  res.json(
    success({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );
});

/**
 * GET /health/live
 * Liveness probe (Kubernetes)
 */
router.get('/live', (req: Request, res: Response) => {
  res.json(success({ status: 'alive' }));
});

/**
 * GET /health/ready
 * Readiness probe (Kubernetes)
 */
router.get('/ready', (req: Request, res: Response) => {
  // TODO: Check database connection, AzuraCast API, etc.
  res.json(success({ status: 'ready' }));
});

export default router;
