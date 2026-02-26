import { Router, Request, Response } from 'express';

import { NewsService } from '../services/news.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { CreateNewsRequest } from '../types/database.js';

export function createNewsRouter(): Router {
  const router = Router();
  const newsService = new NewsService();

  // GET / - Obtiene noticias publicadas
  router.get('/', async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;

      const { news, total } = await newsService.getPublishedNews(page, limit, search);

      res.json({
        success: true,
        data: news,
        total,
        page,
        limit,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener noticias';
      res.status(500).json({ success: false, error: message });
    }
  });

  // GET /:id - Obtiene una noticia publicada por ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const news = await newsService.getPublishedNewsById(id);

      if (!news) {
        res.status(404).json({ success: false, error: 'Noticia no encontrada' });
        return;
      }

      // Incrementar contador de vistas
      await newsService.incrementViewCount(id);

      res.json({ success: true, data: news });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener noticia';
      res.status(500).json({ success: false, error: message });
    }
  });

  // POST / - Crea una noticia (solo admin)
  router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const data: CreateNewsRequest = req.body;
      data.author_id = req.userId;

      const news = await newsService.createNews(data);

      res.status(201).json({
        success: true,
        message: 'Noticia creada exitosamente',
        data: news,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear noticia';
      res.status(400).json({ success: false, error: message });
    }
  });

  // PUT /:id - Actualiza una noticia (solo admin)
  router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const data: Partial<CreateNewsRequest> = req.body;

      const news = await newsService.updateNews(id, data);

      res.json({
        success: true,
        message: 'Noticia actualizada exitosamente',
        data: news,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar noticia';
      res.status(400).json({ success: false, error: message });
    }
  });

  // DELETE /:id - Elimina una noticia (solo admin)
  router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      await newsService.deleteNews(id);

      res.json({ success: true, message: 'Noticia eliminada exitosamente' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar noticia';
      res.status(400).json({ success: false, error: message });
    }
  });

  return router;
}

export default createNewsRouter;
