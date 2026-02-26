/**
 * Main Express application
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { createAuthRouter } from './routes/auth.js';
import { createUserRouter } from './routes/users.js';
import { createBlogRouter } from './routes/blogs.js';
import { createNewsRouter } from './routes/news.js';
import { createEventRouter } from './routes/events.js';
import { createScheduleRouter } from './routes/schedule.js';
import { createProductRouter } from './routes/products.js';
import { createAdminRouter } from './routes/admin.js';
import stationRouter from './routes/station.js';
import healthRouter from './routes/health.js';

const app: Express = express();

/**
 * Inicializa la aplicación Express (sin parámetro db, usa Prisma directamente)
 */
export function createApp(): Express {
  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(fileUpload());

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

   // Health & Station Routes (AzuraCast)
  app.use('/health', healthRouter);
  app.use('/api/station', stationRouter);

  // API Routes
   app.use('/api/auth', createAuthRouter());
   app.use('/api/users', createUserRouter());
   app.use('/api/blogs', createBlogRouter());
   app.use('/api/news', createNewsRouter());
   app.use('/api/events', createEventRouter());
   app.use('/api/schedule', createScheduleRouter());
   app.use('/api/products', createProductRouter());
   app.use('/api/admin', createAdminRouter());

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Ruta no encontrada',
    });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    });
  });

  return app;
}

export default app;
