import { Router, Request, Response } from 'express';

import { ScheduleService } from '../services/schedule.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

export function createScheduleRouter(): Router {
  const router = Router();
  const scheduleService = new ScheduleService();

  // GET /api/schedule - Obtiene toda la programación
  router.get('/', async (req: Request, res: Response) => {
    try {
      const schedule = await scheduleService.getSchedule();
      res.json({ success: true, data: schedule });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener programación';
      res.status(500).json({ success: false, error: message });
    }
  });

  // GET /api/schedule/day/:dayOfWeek - Obtiene programación por día
  router.get('/day/:dayOfWeek', async (req: Request, res: Response) => {
    try {
      const dayOfWeek = Number(req.params.dayOfWeek);
      const schedule = await scheduleService.getScheduleByDay(dayOfWeek);
      res.json({ success: true, data: schedule });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener programación';
      res.status(400).json({ success: false, error: message });
    }
  });

  // POST /api/schedule - Crea programación (solo admin)
  router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { title, description, dayOfWeek, startTime, endTime, host, image } = req.body;

      const schedule = await scheduleService.createSchedule({
        title,
        description,
        dayOfWeek,
        startTime,
        endTime,
        host,
        image,
      });

      res.status(201).json({
        success: true,
        message: 'Programación creada exitosamente',
        data: schedule,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear programación';
      res.status(400).json({ success: false, error: message });
    }
  });

  // PUT /api/schedule/:id - Actualiza programación (solo admin)
  router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { title, description, dayOfWeek, startTime, endTime, host, image } = req.body;

      const schedule = await scheduleService.updateSchedule(id, {
        title,
        description,
        dayOfWeek,
        startTime,
        endTime,
        host,
        image,
      });

      res.json({
        success: true,
        message: 'Programación actualizada exitosamente',
        data: schedule,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar programación';
      res.status(400).json({ success: false, error: message });
    }
  });

  // DELETE /api/schedule/:id - Elimina programación (solo admin)
  router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      await scheduleService.deleteSchedule(id);

      res.json({ success: true, message: 'Programación eliminada exitosamente' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar programación';
      res.status(400).json({ success: false, error: message });
    }
  });

  return router;
}

export default createScheduleRouter;
