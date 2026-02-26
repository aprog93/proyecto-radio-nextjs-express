import { Router, Request, Response } from 'express';

import { AuthService } from '../services/auth.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { CreateProductRequest, Product } from '../types/database.js';

export function createProductRouter(): Router {
  const router = Router();
  const authService = new AuthService();

  // Middleware para inyectar authService
  router.use((req, res, next) => {
    req.authService = authService;
    next();
  });

  router.get('/', (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 12, category, search } = req.query;
      const offset = ((Number(page) || 1) - 1) * (Number(limit) || 12);

      let query = 'SELECT * FROM products WHERE published = 1';
      const params: any[] = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(Number(limit) || 12, offset);

       const products = db.getAll<any>(query, [...params]) as Product[];
       const total = db.count('SELECT COUNT(*) as count FROM products WHERE published = 1', []);

       res.json({
         success: true,
         data: products,
         total: total || 0,
         page: Number(page) || 1,
         limit: Number(limit) || 12,
       });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener productos';
      res.status(500).json({ success: false, error: message });
    }
  });

   router.get('/:id', (req: Request, res: Response) => {
     try {
       const product = db.getOne<Product>(
         'SELECT * FROM products WHERE id = ? AND published = 1',
         [Number(req.params.id)]
       );

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

  router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { name, description, price, category, stock, published }: CreateProductRequest = req.body;

      if (!name || !price) {
        res.status(400).json({ success: false, error: 'Nombre y precio son requeridos' });
        return;
      }

      if (price < 0) {
        res.status(400).json({ success: false, error: 'El precio no puede ser negativo' });
        return;
      }

       const result = db.run(
         `INSERT INTO products (name, description, price, category, stock, published)
          VALUES (?, ?, ?, ?, ?, ?)`,
         [name, description || null, price, category || null, stock || 0, published ? 1 : 0]
       );

       const newProduct = db.getOne<Product>('SELECT * FROM products WHERE id = ?', [result.lastID]) as Product;

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: newProduct,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear producto';
      res.status(400).json({ success: false, error: message });
    }
  });

  router.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { name, description, price, category, stock, published }: CreateProductRequest = req.body;
      const id = Number(req.params.id);

      const product = db.getOne<any>('SELECT * FROM products WHERE id = ?', [id]) as Product | undefined;
      if (!product) {
        res.status(404).json({ success: false, error: 'Producto no encontrado' });
        return;
      }

      if (price !== undefined && price < 0) {
        res.status(400).json({ success: false, error: 'El precio no puede ser negativo' });
        return;
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description || null);
      }
      if (price !== undefined) {
        updates.push('price = ?');
        values.push(price);
      }
      if (category !== undefined) {
        updates.push('category = ?');
        values.push(category || null);
      }
      if (stock !== undefined) {
        updates.push('stock = ?');
        values.push(stock);
      }
      if (published !== undefined) {
        updates.push('published = ?');
        values.push(published ? 1 : 0);
      }

       updates.push('updatedAt = CURRENT_TIMESTAMP');
       values.push(id);

       db.run(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

       const updatedProduct = db.getOne<Product>('SELECT * FROM products WHERE id = ?', [id]) as Product;

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: updatedProduct,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar producto';
      res.status(400).json({ success: false, error: message });
    }
  });

  router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const product = db.getOne<any>('SELECT * FROM products WHERE id = ?', [id]) as Product | undefined;

      if (!product) {
        res.status(404).json({ success: false, error: 'Producto no encontrado' });
        return;
      }

      db.run('DELETE FROM products WHERE id = ?', [id]);
      res.json({ success: true, message: 'Producto eliminado exitosamente' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar producto';
      res.status(400).json({ success: false, error: message });
    }
  });

  return router;
}

export default createProductRouter;
