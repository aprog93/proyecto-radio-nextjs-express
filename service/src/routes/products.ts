import { Router, Request, Response } from 'express';
import { ProductService } from '../services/product.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { CreateProductRequest } from '../types/database.js';

export function createProductRouter(): Router {
  const router = Router();
  const productService = new ProductService();

  /**
   * GET /api/products
   * Obtiene productos publicados con paginación y filtros
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 12;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const { products, total } = await productService.getPublishedProducts(
        page,
        limit,
        category,
        search
      );

      res.json({
        success: true,
        data: products,
        total,
        page,
        limit,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener productos';
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * GET /api/products/:id
   * Obtiene un producto publicado por ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const product = await productService.getPublishedProduct(Number(req.params.id));

      if (!product) {
        res.status(404).json({ success: false, error: 'Producto no encontrado' });
        return;
      }

      res.json({ success: true, data: product });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener producto';
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * POST /api/products
   * Crea un nuevo producto (solo admin)
   */
  router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const data: CreateProductRequest = req.body;

      const product = await productService.createProduct(data);

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: product,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear producto';
      res.status(400).json({ success: false, error: message });
    }
  });

  /**
   * PUT /api/products/:id
   * Actualiza un producto (solo admin)
   */
  router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const data: Partial<CreateProductRequest> = req.body;

      const product = await productService.updateProduct(id, data);

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar producto';
      res.status(400).json({ success: false, error: message });
    }
  });

  /**
   * DELETE /api/products/:id
   * Elimina un producto (solo admin)
   */
  router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await productService.deleteProduct(id);

      res.json({ success: true, message: 'Producto eliminado exitosamente' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar producto';
      res.status(400).json({ success: false, error: message });
    }
  });

  return router;
}

export default createProductRouter;
