import { Router, Request, Response } from 'express';
import { DatabaseWrapper } from '../config/db-wrapper.js';
import { AuthService } from '../services/auth.js';
import { authenticateToken, requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { RegisterRequest, AuthRequest, UpdateProfileRequest } from '../types/database.js';

export function createAuthRouter(db: DatabaseWrapper): Router {
  const router = Router();
  const authService = new AuthService(db);

  // Middleware para inyectar authService
  router.use((req, res, next) => {
    req.authService = authService;
    next();
  });

  /**
   * POST /api/auth/register
   * Registra un nuevo usuario
   */
  router.post('/register', async (req: Request, res: Response) => {
    try {
      const { email, password, displayName }: RegisterRequest = req.body;

      if (!email || !password || !displayName) {
        res.status(400).json({
          success: false,
          error: 'Email, contraseña y nombre son requeridos',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres',
        });
        return;
      }

      const response = await authService.register({
        email,
        password,
        displayName,
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: response,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en el registro';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  });

  /**
   * POST /api/auth/login
   * Inicia sesión de un usuario
   */
  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { email, password }: AuthRequest = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email y contraseña son requeridos',
        });
        return;
      }

      const response = await authService.login({
        email,
        password,
      });

      res.json({
        success: true,
        message: 'Sesión iniciada exitosamente',
        data: response,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en el login';
      res.status(401).json({
        success: false,
        error: message,
      });
    }
  });

  /**
   * POST /api/auth/logout
   * Cierra la sesión del usuario
   */
  router.post('/logout', authenticateToken, (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  });

  /**
   * GET /api/auth/me
   * Obtiene el usuario actual (requiere autenticación)
   */
  router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: 'No autenticado',
        });
        return;
      }

      const user = await authService.getUserById(req.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener usuario';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  });

  return router;
}

export default createAuthRouter;
