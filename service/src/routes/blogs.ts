import { Router, Request, Response } from 'express';

import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { CreateBlogRequest, Blog } from '../types/database.js';

export function createBlogRouter(): Router {
  const router = Router();

  /**
   * GET /api/blogs
   * Obtiene todos los blogs publicados
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, category, search } = req.query;
      const offset = ((Number(page) || 1) - 1) * (Number(limit) || 10);

      let query = 'SELECT * FROM blogs WHERE published = 1';
      const params: any[] = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (title LIKE ? OR content LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY publishedAt DESC LIMIT ? OFFSET ?';
      params.push(Number(limit) || 10, offset);

      const blogs = db.getAll<Blog>(query, params);
      const count = db.count('SELECT * FROM blogs WHERE published = 1');

      res.json({
        success: true,
        data: blogs,
        total: count,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener blogs';
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * GET /api/blogs/:id
   * Obtiene un blog por ID
   */
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const blog = db.getOne<Blog>(
        'SELECT * FROM blogs WHERE id = ? AND published = 1',
        [Number(req.params.id)]
      );

      if (!blog) {
        res.status(404).json({ success: false, error: 'Blog no encontrado' });
        return;
      }

      // Incrementar contador de vistas
      db.run('UPDATE blogs SET viewCount = viewCount + 1 WHERE id = ?', [Number(req.params.id)]);

      res.json({
        success: true,
        data: blog,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener blog';
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * POST /api/blogs
   * Crea un nuevo blog (solo admin)
   */
  router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { title, content, excerpt, category, tags, published }: CreateBlogRequest = req.body;

      if (!title || !content) {
        res.status(400).json({ success: false, error: 'Título y contenido son requeridos' });
        return;
      }

      // Generar slug
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      const result = db.run(
        `INSERT INTO blogs (title, slug, content, excerpt, author_id, category, tags, published, publishedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          slug,
          content,
          excerpt || null,
          req.userId,
          category || null,
          tags || null,
          published ? 1 : 0,
          published ? new Date().toISOString() : null
        ]
      );

      const newBlog = db.getOne<Blog>('SELECT * FROM blogs WHERE id = ?', [result.lastID]);

      res.status(201).json({
        success: true,
        message: 'Blog creado exitosamente',
        data: newBlog,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear blog';
      res.status(400).json({ success: false, error: message });
    }
  });

  /**
   * PUT /api/blogs/:id
   * Actualiza un blog (solo admin)
   */
  router.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { title, content, excerpt, category, tags, published }: CreateBlogRequest = req.body;
      const id = Number(req.params.id);

      const blog = db.getOne<Blog>('SELECT * FROM blogs WHERE id = ?', [id]);

      if (!blog) {
        res.status(404).json({ success: false, error: 'Blog no encontrado' });
        return;
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (title) {
        updates.push('title = ?, slug = ?');
        values.push(title, title.toLowerCase().replace(/\s+/g, '-'));
      }
      if (content) {
        updates.push('content = ?');
        values.push(content);
      }
      if (excerpt !== undefined) {
        updates.push('excerpt = ?');
        values.push(excerpt || null);
      }
      if (category !== undefined) {
        updates.push('category = ?');
        values.push(category || null);
      }
      if (tags !== undefined) {
        updates.push('tags = ?');
        values.push(tags || null);
      }
      if (published !== undefined) {
        updates.push('published = ?, publishedAt = ?');
        values.push(published ? 1 : 0, published ? new Date().toISOString() : null);
      }

      updates.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);

      db.run(`UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`, values);

      const updatedBlog = db.getOne<Blog>('SELECT * FROM blogs WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Blog actualizado exitosamente',
        data: updatedBlog,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar blog';
      res.status(400).json({ success: false, error: message });
    }
  });

  /**
   * DELETE /api/blogs/:id
   * Elimina un blog (solo admin)
   */
  router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const blog = db.getOne<Blog>('SELECT * FROM blogs WHERE id = ?', [id]);

      if (!blog) {
        res.status(404).json({ success: false, error: 'Blog no encontrado' });
        return;
      }

      db.run('DELETE FROM blogs WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Blog eliminado exitosamente',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar blog';
      res.status(400).json({ success: false, error: message });
    }
  });

  return router;
}

export default createBlogRouter;
