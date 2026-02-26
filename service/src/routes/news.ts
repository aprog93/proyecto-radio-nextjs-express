import { Router, Request, Response } from 'express';

import { AuthService } from '../services/auth.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { CreateNewsRequest, News } from '../types/database.js';

export function createNewsRouter(): Router {
  const router = Router();
  const authService = new AuthService();

  // Middleware para inyectar authService
  router.use((req, res, next) => {
    req.authService = authService;
    next();
  });

  router.get('/', (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = ((Number(page) || 1) - 1) * (Number(limit) || 10);

      let query = `SELECT * FROM news WHERE published = 1 AND (expiresAt IS NULL OR expiresAt > CURRENT_TIMESTAMP)`;
      const params: any[] = [];

      if (search) {
        query += ` AND (title LIKE ? OR content LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY publishedAt DESC LIMIT ? OFFSET ?`;
      params.push(Number(limit) || 10, offset);

       const news = db.getAll<any>(query, params);
       const count = db.count(
         `SELECT * FROM news WHERE published = 1 AND (expiresAt IS NULL OR expiresAt > CURRENT_TIMESTAMP)`
       );

       res.json({
         success: true,
         data: news,
         total: count,
         page: Number(page) || 1,
         limit: Number(limit) || 10,
       });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener noticias';
      res.status(500).json({ success: false, error: message });
    }
  });

  router.get('/:id', (req: Request, res: Response) => {
    try {
      const news = db.getOne<News>(
        `SELECT * FROM news WHERE id = ? AND published = 1 AND (expiresAt IS NULL OR expiresAt > CURRENT_TIMESTAMP)`,
        [Number(req.params.id)]
      );

      if (!news) {
        res.status(404).json({ success: false, error: 'Noticia no encontrada' });
        return;
      }

       db.run('UPDATE news SET viewCount = viewCount + 1 WHERE id = ?', [Number(req.params.id)]);
      res.json({ success: true, data: news });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener noticia';
      res.status(500).json({ success: false, error: message });
    }
  });

  router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { title, content, published, expiresAt }: CreateNewsRequest = req.body;

      if (!title || !content) {
        res.status(400).json({
          success: false,
          error: 'Título y contenido son requeridos',
        });
        return;
      }

      if (content.length > 1500) {
        res.status(400).json({ success: false, error: 'El contenido no puede exceder 1500 caracteres' });
        return;
      }

      if (expiresAt) {
        const expireDate = new Date(expiresAt);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);

        if (expireDate > maxDate) {
          res.status(400).json({
            success: false,
            error: 'La fecha de expiración no puede ser más de 30 días en el futuro',
          });
          return;
        }
      }

      const result = db.run(
        `INSERT INTO news (title, content, author_id, published, expiresAt, publishedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title,
          content,
          req.userId,
          published ? 1 : 0,
          expiresAt || null,
          published ? new Date().toISOString() : null
        ]
      );
      console.log('NEWS POST - Insert result', result);

      const newNews = db.getOne<News>('SELECT * FROM news WHERE id = ?', [result.lastID]);
      console.log('NEWS POST - Created news', newNews);

      res.status(201).json({
        success: true,
        message: 'Noticia creada exitosamente',
        data: newNews,
      });
    } catch (err) {
      console.error('NEWS POST - Error:', err);
      const message = err instanceof Error ? err.message : 'Error al crear noticia';
      res.status(400).json({ success: false, error: message });
    }
  });

  router.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { title, content, published, expiresAt }: CreateNewsRequest = req.body;
      const id = Number(req.params.id);

      const news = db.getOne<any>('SELECT * FROM news WHERE id = ?', [id]) as News | undefined;
      if (!news) {
        res.status(404).json({ success: false, error: 'Noticia no encontrada' });
        return;
      }

      if (content && content.length > 1500) {
        res.status(400).json({ success: false, error: 'El contenido no puede exceder 1500 caracteres' });
        return;
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (title) {
        updates.push('title = ?');
        values.push(title);
      }
      if (content) {
        updates.push('content = ?');
        values.push(content);
      }
      if (published !== undefined) {
        updates.push('published = ?, publishedAt = ?');
        values.push(published ? 1 : 0, published ? new Date().toISOString() : null);
      }
      if (expiresAt !== undefined) {
        updates.push('expiresAt = ?');
        values.push(expiresAt || null);
      }

      updates.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);

      db.run(`UPDATE news SET ${updates.join(', ')} WHERE id = ?`, values);

      const updatedNews = db.getOne<News>('SELECT * FROM news WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Noticia actualizada exitosamente',
        data: updatedNews,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar noticia';
      res.status(400).json({ success: false, error: message });
    }
  });

  router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const news = db.getOne<any>('SELECT * FROM news WHERE id = ?', [id]) as News | undefined;

      if (!news) {
        res.status(404).json({ success: false, error: 'Noticia no encontrada' });
        return;
      }

      db.run('DELETE FROM news WHERE id = ?', [id]);
      res.json({ success: true, message: 'Noticia eliminada exitosamente' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar noticia';
      res.status(400).json({ success: false, error: message });
    }
  });

  return router;
}

export default createNewsRouter;
