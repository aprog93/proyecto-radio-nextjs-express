import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.js';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: 'admin' | 'listener';
      userEmail?: string;
      authService?: AuthService;
    }
  }
}

/**
 * Middleware de autenticación
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Token no proporcionado' });
    return;
  }

  const authService = req.authService;
  if (!authService) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
    return;
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    res.status(403).json({ success: false, error: 'Token inválido o expirado' });
    return;
  }

  req.userId = decoded.id;
  req.userEmail = decoded.email;
  req.userRole = decoded.role;

  next();
}

/**
 * Middleware para verificar que sea admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({ success: false, error: 'Acceso denegado: se requieren permisos de administrador' });
    return;
  }

  next();
}

/**
 * Middleware para verificar que sea autenticado
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.userId) {
    res.status(401).json({ success: false, error: 'Autenticación requerida' });
    return;
  }

  next();
}
