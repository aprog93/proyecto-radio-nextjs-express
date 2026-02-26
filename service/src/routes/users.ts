import { Router, Request, Response } from 'express';

import { AuthService } from '../services/auth.js';
import { authenticateToken, requireAuth } from '../middleware/authMiddleware.js';
import { UpdateProfileRequest, UserProfile } from '../types/database.js';

export function createUserRouter(): Router {
  const router = Router();
  const authService = new AuthService();

  router.use((req, res, next) => {
    req.authService = authService;
    next();
  });

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

       const user = await authService.getUserById(req.userId);
       const profile = db.getOne<UserProfile>(
         'SELECT * FROM user_profiles WHERE userId = ?',
         [req.userId]
       );

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
        const updates: string[] = [];
        const values: any[] = [];

        if (firstName !== undefined) {
          updates.push('firstName = ?');
          values.push(firstName);
        }
        if (lastName !== undefined) {
          updates.push('lastName = ?');
          values.push(lastName);
        }
        if (phone !== undefined) {
          updates.push('phone = ?');
          values.push(phone);
        }
        if (address !== undefined) {
          updates.push('address = ?');
          values.push(address);
        }
        if (city !== undefined) {
          updates.push('city = ?');
          values.push(city);
        }
        if (country !== undefined) {
          updates.push('country = ?');
          values.push(country);
        }
        if (postalCode !== undefined) {
          updates.push('postalCode = ?');
          values.push(postalCode);
        }

        if (updates.length > 0) {
          updates.push('updatedAt = CURRENT_TIMESTAMP');
          values.push(req.userId);

           db.run(`UPDATE user_profiles SET ${updates.join(', ')} WHERE userId = ?`, values);
        }
      }

       const user = await authService.getUserById(req.userId);
       const profile = db.getOne<UserProfile>(
         'SELECT * FROM user_profiles WHERE userId = ?',
         [req.userId]
       );

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
