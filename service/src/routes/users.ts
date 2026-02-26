import { Router, Request, Response } from 'express';

import { AuthService } from '../services/auth.js';
import { UserProfileService } from '../services/user-profile.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { UpdateProfileRequest } from '../types/database.js';

export function createUserRouter(): Router {
  const router = Router();
  const authService = new AuthService();
  const profileService = new UserProfileService();

  /**
   * GET /api/users/profile
   * Obtiene el perfil del usuario actual
   */
  router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const [user, profile] = await Promise.all([
        authService.getUserById(req.userId),
        profileService.getProfileByUserId(req.userId),
      ]);

      res.json({
        success: true,
        data: {
          user,
          profile,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener perfil';
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * PUT /api/users/profile
   * Actualiza el perfil del usuario
   */
  router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const { displayName, bio, firstName, lastName, phone, address, city, country, postalCode }: UpdateProfileRequest =
        req.body;

      // Actualizar usuario
      if (displayName || bio) {
        await authService.updateUser(req.userId, {
          displayName,
          bio,
        } as any);
      }

      // Actualizar perfil
      if (firstName || lastName || phone || address || city || country || postalCode) {
        await profileService.updateProfile(req.userId, {
          firstName,
          lastName,
          phone,
          address,
          city,
          country,
          postalCode,
        });
      }

      const [user, profile] = await Promise.all([
        authService.getUserById(req.userId),
        profileService.getProfileByUserId(req.userId),
      ]);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user, profile },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar perfil';
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * POST /api/users/avatar
   * Actualiza el avatar del usuario
   */
  router.post('/avatar', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const { avatar } = req.body;

      if (!avatar) {
        res.status(400).json({ success: false, error: 'Avatar es requerido' });
        return;
      }

      await authService.updateUser(req.userId, { avatar } as any);

      const user = await authService.getUserById(req.userId);

      res.json({
        success: true,
        message: 'Avatar actualizado exitosamente',
        data: user,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar avatar';
      res.status(500).json({ success: false, error: message });
    }
  });

  return router;
}

export default createUserRouter;
