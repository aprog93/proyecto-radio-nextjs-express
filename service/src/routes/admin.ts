import { Router, Request, Response } from 'express';

import { AuthService } from '../services/auth.js';
import { UserProfileService } from '../services/user-profile.js';
import { AdminService } from '../services/admin.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { UserRole } from '../types/database.js';

export function createAdminRouter(): Router {
  const router = Router();
  const authService = new AuthService();
  const profileService = new UserProfileService();
  const adminService = new AdminService();

  // GET /api/admin/users
  router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;

      const { users, total } = await adminService.listUsers(page, limit, search);

      res.json({
        success: true,
        data: users,
        total,
        page,
        limit,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener usuarios';
      res.status(500).json({ success: false, error: message });
    }
  });

  // GET /api/admin/users/:id
  router.get('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const [user, profile] = await Promise.all([
        authService.getUserById(userId),
        profileService.getProfileByUserId(userId),
      ]);

      if (!user) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

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
        await authService.updateUser(userId, { isActive } as any);
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
  router.get('/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await adminService.getStats();

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
