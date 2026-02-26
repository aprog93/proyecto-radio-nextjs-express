import { Router, Request, Response } from 'express';

import { EventService } from '../services/event.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { CreateEventRequest } from '../types/database.js';

export function createEventRouter(): Router {
  const router = Router();
  const eventService = new EventService();

  // GET / - Obtiene eventos publicados
  router.get('/', async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      const upcoming = req.query.upcoming === 'true';

      const { events, total } = await eventService.getPublishedEvents(page, limit, search, upcoming);

      res.json({
        success: true,
        data: events,
        total,
        page,
        limit,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener eventos';
      res.status(500).json({ success: false, error: message });
    }
  });

  // GET /:id - Obtiene un evento publicado por ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const event = await eventService.getPublishedEventById(id);

      if (!event) {
        res.status(404).json({ success: false, error: 'Evento no encontrado' });
        return;
      }

      res.json({ success: true, data: event });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener evento';
      res.status(500).json({ success: false, error: message });
    }
  });

  // POST / - Crea un evento (solo admin)
  router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const data: CreateEventRequest = req.body;
      const event = await eventService.createEvent(data, req.userId);

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: event,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear evento';
      res.status(400).json({ success: false, error: message });
    }
  });

  // PUT /:id - Actualiza un evento (solo admin)
  router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const data: Partial<CreateEventRequest> = req.body;

      const event = await eventService.updateEvent(id, data);

      res.json({
        success: true,
        message: 'Evento actualizado exitosamente',
        data: event,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar evento';
      res.status(400).json({ success: false, error: message });
    }
  });

  // DELETE /:id - Elimina un evento (solo admin)
  router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      await eventService.deleteEvent(id);

      res.json({ success: true, message: 'Evento eliminado exitosamente' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar evento';
      res.status(400).json({ success: false, error: message });
    }
  });

  // POST /:id/register - Registra un usuario en un evento
  router.post('/:id/register', authenticateToken, async (req: Request, res: Response) => {
    try {
      const eventId = Number(req.params.id);

      await eventService.registerUser(eventId, req.userId);

      res.status(201).json({
        success: true,
        message: 'Registrado en el evento exitosamente',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrarse en el evento';
      res.status(400).json({ success: false, error: message });
    }
  });

  return router;
}

export default createEventRouter;
