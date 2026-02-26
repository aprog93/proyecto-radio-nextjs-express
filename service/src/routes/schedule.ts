import { Router, Request, Response } from 'express';
import { DatabaseWrapper } from '../config/db-wrapper.js';
import { AuthService } from '../services/auth.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { Schedule } from '../types/database.js';

export function createScheduleRouter(db: DatabaseWrapper): Router {
  const router = Router();
  const authService = new AuthService(db);

  // Middleware para inyectar authService
  router.use((req, res, next) => {
    req.authService = authService;
    next();
  });

   router.get('/', (req: Request, res: Response) => {
     try {
       const schedule = db.getAll<Schedule>(
         'SELECT * FROM schedule ORDER BY dayOfWeek ASC, startTime ASC',
         []
       );

       res.json({ success: true, data: schedule });
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Error al obtener programación';
       res.status(500).json({ success: false, error: message });
     }
   });

   router.get('/day/:dayOfWeek', (req: Request, res: Response) => {
     try {
       const dayOfWeek = Number(req.params.dayOfWeek);

       if (dayOfWeek < 0 || dayOfWeek > 6) {
         res.status(400).json({ success: false, error: 'Día inválido (0-6)' });
         return;
       }

       const schedule = db.getAll<Schedule>(
         'SELECT * FROM schedule WHERE dayOfWeek = ? ORDER BY startTime ASC',
         [dayOfWeek]
       );

       res.json({ success: true, data: schedule });
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Error al obtener programación';
       res.status(500).json({ success: false, error: message });
     }
   });

  router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { title, description, dayOfWeek, startTime, endTime, host, image } = req.body;

      if (!title || dayOfWeek === undefined || !startTime || !endTime) {
        res.status(400).json({
          success: false,
          error: 'Título, día, hora de inicio y fin son requeridos',
        });
        return;
      }

      if (dayOfWeek < 0 || dayOfWeek > 6) {
        res.status(400).json({ success: false, error: 'Día inválido (0-6)' });
        return;
      }

       const result = db.run(
         `INSERT INTO schedule (title, description, dayOfWeek, startTime, endTime, host, image)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
         [title, description || null, dayOfWeek, startTime, endTime, host || null, image || null]
       );

       const newSchedule = db.getOne<Schedule>('SELECT * FROM schedule WHERE id = ?', [result.lastID]) as Schedule;

      res.status(201).json({
        success: true,
        message: 'Programación creada exitosamente',
        data: newSchedule,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear programación';
      res.status(400).json({ success: false, error: message });
    }
  });

  router.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { title, description, dayOfWeek, startTime, endTime, host, image } = req.body;
      const id = Number(req.params.id);

      const schedule = db.getOne<any>('SELECT * FROM schedule WHERE id = ?', [id]) as Schedule | undefined;
      if (!schedule) {
        res.status(404).json({ success: false, error: 'Programación no encontrada' });
        return;
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (title) {
        updates.push('title = ?');
        values.push(title);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description || null);
      }
      if (dayOfWeek !== undefined) {
        if (dayOfWeek < 0 || dayOfWeek > 6) {
          res.status(400).json({ success: false, error: 'Día inválido (0-6)' });
          return;
        }
        updates.push('dayOfWeek = ?');
        values.push(dayOfWeek);
      }
      if (startTime) {
        updates.push('startTime = ?');
        values.push(startTime);
      }
      if (endTime) {
        updates.push('endTime = ?');
        values.push(endTime);
      }
      if (host !== undefined) {
        updates.push('host = ?');
        values.push(host || null);
      }
      if (image !== undefined) {
        updates.push('image = ?');
        values.push(image || null);
      }

       updates.push('updatedAt = CURRENT_TIMESTAMP');
       values.push(id);

       db.run(`UPDATE schedule SET ${updates.join(', ')} WHERE id = ?`, values);

       const updatedSchedule = db.getOne<Schedule>('SELECT * FROM schedule WHERE id = ?', [id]) as Schedule;

      res.json({
        success: true,
        message: 'Programación actualizada exitosamente',
        data: updatedSchedule,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar programación';
      res.status(400).json({ success: false, error: message });
    }
  });

  router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const schedule = db.getOne<any>('SELECT * FROM schedule WHERE id = ?', [id]) as Schedule | undefined;

      if (!schedule) {
        res.status(404).json({ success: false, error: 'Programación no encontrada' });
        return;
      }

      db.run('DELETE FROM schedule WHERE id = ?', [id]);
      res.json({ success: true, message: 'Programación eliminada exitosamente' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar programación';
      res.status(400).json({ success: false, error: message });
    }
  });

  return router;
}

export default createScheduleRouter;
