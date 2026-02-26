import { Router, Request, Response } from 'express';
import { BlogService } from '../services/blog.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { CreateBlogRequest } from '../types/database.js';

export function createBlogRouter(): Router {
  const router = Router();
  const blogService = new BlogService();

  /**
   * GET /api/blogs
   * Obtiene blogs publicados con paginación y filtros
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const { blogs, total } = await blogService.getPublishedBlogs(
        page,
        limit,
        category,
        search
      );

      res.json({
        success: true,
        data: blogs,
        total,
        page,
        limit,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener blogs';
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * GET /api/blogs/:slug
   * Obtiene un blog por slug
   */
  router.get('/:slug', async (req: Request, res: Response) => {
    try {
      const blog = await blogService.getPublishedBySlug(req.params.slug);

      if (!blog) {
        res.status(404).json({ success: false, error: 'Blog no encontrado' });
        return;
      }

      // Incrementar contador de vistas
      await blogService.incrementViewCount(blog.id);

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
   * Crea un nuevo blog (requiere autenticación)
   */
  router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const data: CreateBlogRequest = req.body;
      const blog = await blogService.createBlog(req.userId, data);

      res.status(201).json({
        success: true,
        message: 'Blog creado exitosamente',
        data: blog,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear blog';
      res.status(400).json({ success: false, error: message });
    }
  });

  /**
   * PUT /api/blogs/:id
   * Actualiza un blog (solo el autor)
   */
  router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const blogId = Number(req.params.id);
      const data: Partial<CreateBlogRequest> = req.body;

      const blog = await blogService.updateBlog(blogId, req.userId, data);

      res.json({
        success: true,
        message: 'Blog actualizado exitosamente',
        data: blog,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar blog';
      const statusCode = message.includes('permiso') ? 403 : 400;
      res.status(statusCode).json({ success: false, error: message });
    }
  });

  /**
   * DELETE /api/blogs/:id
   * Elimina un blog (solo el autor)
   */
  router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const blogId = Number(req.params.id);
      await blogService.deleteBlog(blogId, req.userId);

      res.json({ success: true, message: 'Blog eliminado exitosamente' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar blog';
      const statusCode = message.includes('permiso') ? 403 : 400;
      res.status(statusCode).json({ success: false, error: message });
    }
  });

  return router;
}

export default createBlogRouter;
