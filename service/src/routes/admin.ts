import { Router, Request, Response } from 'express';

import { AuthService } from '../services/auth.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { User, UserRole } from '../types/database.js';

export function createAdminRouter(): Router {
  const router = Router();
  const authService = new AuthService();

  router.use((req, res, next) => {
    req.authService = authService;
    next();
  });

  // GET /api/admin/users
   router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
     try {
       const { page = 1, limit = 20, search } = req.query;
       const offset = ((Number(page) || 1) - 1) * (Number(limit) || 20);

       let query = 'SELECT id, email, displayName, role, avatar, createdAt, isActive FROM users';
       const params: any[] = [];

       if (search) {
         query += ' WHERE email LIKE ? OR displayName LIKE ?';
         params.push(`%${search}%`, `%${search}%`);
       }

       query += ' LIMIT ? OFFSET ?';
       params.push(Number(limit) || 20, offset);

       const users = db.getAll<User>(query, params);
       const total = db.count('SELECT COUNT(*) as count FROM users', []);

       res.json({
         success: true,
         data: users,
         total: total || 0,
         page: Number(page) || 1,
         limit: Number(limit) || 20,
       });
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Error al obtener usuarios';
       res.status(500).json({ success: false, error: message });
     }
   });

   // GET /api/admin/users/:id
   router.get('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
     try {
       const user = await authService.getUserById(Number(req.params.id));

       if (!user) {
         res.status(404).json({ success: false, error: 'Usuario no encontrado' });
         return;
       }

       const profile = db.getOne<any>(
         'SELECT * FROM user_profiles WHERE userId = ?',
         [Number(req.params.id)]
       );

       res.json({
         success: true,
         data: { user, profile },
       });
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Error al obtener usuario';
       res.status(500).json({ success: false, error: message });
     }
   });

  // POST /api/admin/users
  router.post('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { email, password, displayName, role } = req.body;

      if (!email || !password || !displayName) {
        res.status(400).json({
          success: false,
          error: 'Email, contraseña y nombre son requeridos',
        });
        return;
      }

      const response = await authService.register({
        email,
        password,
        displayName,
      });

      if (role && role !== 'listener') {
        await authService.updateUserRole(response.id, role as UserRole);
      }

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: response,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear usuario';
      res.status(400).json({ success: false, error: message });
    }
  });

  // PUT /api/admin/users/:id
  router.put('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { displayName, email, role, isActive } = req.body;
      const userId = Number(req.params.id);

      const user = await authService.getUserById(userId);

      if (!user) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      if (displayName) {
        await authService.updateUser(userId, { displayName } as any);
      }

      if (role && user.role !== role) {
        await authService.updateUserRole(userId, role as UserRole);
      }

       if (isActive !== undefined) {
         db.run('UPDATE users SET isActive = ? WHERE id = ?', [isActive ? 1 : 0, userId]);
       }

      const updatedUser = await authService.getUserById(userId);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: updatedUser,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar usuario';
      res.status(400).json({ success: false, error: message });
    }
  });

  // DELETE /api/admin/users/:id
  router.delete('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      await authService.deleteUser(Number(req.params.id));

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar usuario';
      res.status(400).json({ success: false, error: message });
    }
  });

   // GET /api/admin/stats
   router.get('/stats', authenticateToken, requireAdmin, (req: Request, res: Response) => {
     try {
       const stats = {
         totalUsers: db.count('SELECT COUNT(*) as count FROM users', []),
         activeUsers: db.count('SELECT COUNT(*) as count FROM users WHERE isActive = 1', []),
         admins: db.count('SELECT COUNT(*) as count FROM users WHERE role = "admin"', []),
         listeners: db.count('SELECT COUNT(*) as count FROM users WHERE role = "listener"', []),
         totalBlogs: db.count('SELECT COUNT(*) as count FROM blogs', []),
         publishedBlogs: db.count('SELECT COUNT(*) as count FROM blogs WHERE published = 1', []),
         totalNews: db.count('SELECT COUNT(*) as count FROM news', []),
         publishedNews: db.count('SELECT COUNT(*) as count FROM news WHERE published = 1', []),
         totalEvents: db.count('SELECT COUNT(*) as count FROM events', []),
         publishedEvents: db.count('SELECT COUNT(*) as count FROM events WHERE published = 1', []),
         totalProducts: db.count('SELECT COUNT(*) as count FROM products', []),
         publishedProducts: db.count('SELECT COUNT(*) as count FROM products WHERE published = 1', []),
         totalDonations: {
           count: db.count('SELECT COUNT(*) as count FROM donations', []),
           amount: (db.getOne<any>('SELECT SUM(amount) as amount FROM donations', []) as any)?.amount || 0,
         },
       };

       res.json({
         success: true,
         data: stats,
       });
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Error al obtener estadísticas';
       res.status(500).json({ success: false, error: message });
     }
   });

  return router;
}

export default createAdminRouter;
