import { Router, Request, Response } from 'express';

import { AuthService } from '../services/auth.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { CreateEventRequest, Event, EventRegistration } from '../types/database.js';

export function createEventRouter(): Router {
  const router = Router();
  const authService = new AuthService();

  // Middleware para inyectar authService
  router.use((req, res, next) => {
    req.authService = authService;
    next();
  });

  router.get('/', (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search, upcoming } = req.query;
      const offset = ((Number(page) || 1) - 1) * (Number(limit) || 10);

      let query = 'SELECT * FROM events WHERE published = 1';
      const params: any[] = [];

      if (upcoming === 'true') {
        query += ' AND startDate > CURRENT_TIMESTAMP';
      }

      if (search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY startDate ASC LIMIT ? OFFSET ?';
      params.push(Number(limit) || 10, offset);

      const events = db.getAll<any>(query, [...params]) as Event[];
      const total = db.count('SELECT COUNT(*) as count FROM events WHERE published = 1', []);

      res.json({
        success: true,
        data: events,
        total: total || 0,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener eventos';
      res.status(500).json({ success: false, error: message });
    }
  });

   router.get('/:id', (req: Request, res: Response) => {
     try {
       const event = db.getOne<Event>(
         'SELECT * FROM events WHERE id = ? AND published = 1',
         [Number(req.params.id)]
       );

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

  router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { title, description, startDate, endDate, location, capacity, published }: CreateEventRequest = req.body;

      if (!title || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Título, fecha de inicio y fin son requeridos',
        });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const maxEnd = new Date(start);
      maxEnd.setDate(maxEnd.getDate() + 30);

      if (end > maxEnd) {
        res.status(400).json({
          success: false,
          error: 'El evento no puede durar más de 30 días',
        });
        return;
      }

       const result = db.run(
         `INSERT INTO events (title, description, startDate, endDate, location, capacity, author_id, published, publishedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
         [
           title,
           description || null,
           startDate,
           endDate,
           location || null,
           capacity || null,
           req.userId,
           published ? 1 : 0,
           published ? new Date().toISOString() : null
         ]
       );

       const newEvent = db.getOne<any>('SELECT * FROM events WHERE id = ?', [result.lastID]) as Event;

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: newEvent,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear evento';
      res.status(400).json({ success: false, error: message });
    }
  });

  router.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const { title, description, startDate, endDate, location, capacity, published }: CreateEventRequest = req.body;
      const id = Number(req.params.id);

      const event = db.getOne<any>('SELECT * FROM events WHERE id = ?', [id]) as Event | undefined;
      if (!event) {
        res.status(404).json({ success: false, error: 'Evento no encontrado' });
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
      if (startDate) {
        updates.push('startDate = ?');
        values.push(startDate);
      }
      if (endDate) {
        updates.push('endDate = ?');
        values.push(endDate);
      }
      if (location !== undefined) {
        updates.push('location = ?');
        values.push(location || null);
      }
      if (capacity !== undefined) {
        updates.push('capacity = ?');
        values.push(capacity || null);
      }
      if (published !== undefined) {
        updates.push('published = ?, publishedAt = ?');
        values.push(published ? 1 : 0, published ? new Date().toISOString() : null);
      }

       updates.push('updatedAt = CURRENT_TIMESTAMP');
       values.push(id);

       db.run(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values);

       const updatedEvent = db.getOne<any>('SELECT * FROM events WHERE id = ?', [id]) as Event;

      res.json({
        success: true,
        message: 'Evento actualizado exitosamente',
        data: updatedEvent,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar evento';
      res.status(400).json({ success: false, error: message });
    }
  });

  router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const event = db.getOne<any>('SELECT * FROM events WHERE id = ?', [id]) as Event | undefined;

      if (!event) {
        res.status(404).json({ success: false, error: 'Evento no encontrado' });
        return;
      }

      db.run('DELETE FROM events WHERE id = ?', [id]);
      res.json({ success: true, message: 'Evento eliminado exitosamente' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar evento';
      res.status(400).json({ success: false, error: message });
    }
  });

  router.post('/:id/register', authenticateToken, async (req: Request, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      const event = db.getOne<any>('SELECT * FROM events WHERE id = ?', [eventId]) as Event | undefined;

      if (!event) {
        res.status(404).json({ success: false, error: 'Evento no encontrado' });
        return;
      }

       const existing = db.getOne<any>(
         'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?',
         [eventId, req.userId]
       );

       if (existing) {
         res.status(400).json({ success: false, error: 'Ya estás registrado en este evento' });
         return;
       }

       if (event.capacity && event.registered >= event.capacity) {
         res.status(400).json({ success: false, error: 'El evento está lleno' });
         return;
       }

       db.run('INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)', [eventId, req.userId]);
       db.run('UPDATE events SET registered = registered + 1 WHERE id = ?', [eventId]);

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
