import { prisma } from '../config/prisma.js';
import { Event, CreateEventRequest } from '../types/database.js';

/**
 * Servicio de gestión de eventos
 */
export class EventService {
  /**
   * Obtiene eventos publicados con paginación, búsqueda y filtro por fecha
   */
  async getPublishedEvents(
    page: number = 1,
    limit: number = 10,
    search?: string,
    upcomingOnly: boolean = false
  ): Promise<{ events: Event[]; total: number }> {
    const offset = (page - 1) * limit;
    const now = new Date();

    const where: any = { published: true };

    if (upcomingOnly) {
      where.startDate = { gt: now };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events: events.map((e) => this._formatEvent(e)),
      total,
    };
  }

  /**
   * Obtiene un evento publicado por ID
   */
  async getPublishedEventById(id: number): Promise<Event | null> {
    const event = await prisma.event.findFirst({
      where: {
        id,
        published: true,
      },
    });
    return event ? this._formatEvent(event) : null;
  }

  /**
   * Obtiene un evento por ID (sin verificación de publicación)
   */
  async getEventById(id: number): Promise<Event | null> {
    const event = await prisma.event.findUnique({
      where: { id },
    });
    return event ? this._formatEvent(event) : null;
  }

  /**
   * Crea un nuevo evento (solo para admin)
   */
  async createEvent(data: CreateEventRequest, userId: number): Promise<Event> {
    if (!data.title || !data.startDate || !data.endDate) {
      throw new Error('Título, fecha de inicio y fin son requeridos');
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const maxEnd = new Date(start);
    maxEnd.setDate(maxEnd.getDate() + 30);

    if (end > maxEnd) {
      throw new Error('El evento no puede durar más de 30 días');
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        startDate: start,
        endDate: end,
        location: data.location || null,
        capacity: data.capacity || null,
        author_id: userId,
        published: data.published || false,
        publishedAt: data.published ? new Date() : null,
      },
    });

    return this._formatEvent(event);
  }

  /**
   * Actualiza un evento (solo admin)
   */
  async updateEvent(id: number, data: Partial<CreateEventRequest>): Promise<Event> {
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Validar duración si se actualiza fecha
    if (data.startDate || data.endDate) {
      const start = new Date(data.startDate || event.startDate);
      const end = new Date(data.endDate || event.endDate);
      const maxEnd = new Date(start);
      maxEnd.setDate(maxEnd.getDate() + 30);

      if (end > maxEnd) {
        throw new Error('El evento no puede durar más de 30 días');
      }
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.published !== undefined) {
      updateData.published = data.published;
      updateData.publishedAt = data.published ? new Date() : null;
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return this._formatEvent(updated);
  }

  /**
   * Elimina un evento (solo admin)
   */
  async deleteEvent(id: number): Promise<void> {
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new Error('Evento no encontrado');
    }

    await prisma.event.delete({ where: { id } });
  }

  /**
   * Registra un usuario en un evento
   */
  async registerUser(eventId: number, userId: number): Promise<void> {
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Verificar si ya está registrado
    const existing = await prisma.eventRegistration.findFirst({
      where: {
        event_id: eventId,
        user_id: userId,
      },
    });

    if (existing) {
      throw new Error('Ya estás registrado en este evento');
    }

    // Verificar capacidad
    if (event.capacity && event.registered >= event.capacity) {
      throw new Error('El evento está lleno');
    }

    // Crear registro y actualizar contador
    await Promise.all([
      prisma.eventRegistration.create({
        data: {
          event_id: eventId,
          user_id: userId,
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: { registered: { increment: 1 } },
      }),
    ]);
  }

  /**
   * Desregistra un usuario de un evento
   */
  async unregisterUser(eventId: number, userId: number): Promise<void> {
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        event_id: eventId,
        user_id: userId,
      },
    });

    if (!registration) {
      throw new Error('No estás registrado en este evento');
    }

    await Promise.all([
      prisma.eventRegistration.delete({
        where: { id: registration.id },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: { registered: { decrement: 1 } },
      }),
    ]);
  }

  /**
   * Obtiene las registraciones de un evento
   */
  async getEventRegistrations(eventId: number, page: number = 1, limit: number = 10): Promise<{ total: number }> {
    const offset = (page - 1) * limit;

    const total = await prisma.eventRegistration.count({
      where: { event_id: eventId },
    });

    return { total };
  }

  /**
   * Formatea un evento para retornar
   */
  private _formatEvent(event: any): Event {
    return {
      id: event.id,
      title: event.title,
      description: event.description || undefined,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location || undefined,
      image: event.image || undefined,
      capacity: event.capacity || undefined,
      registered: event.registered,
      author_id: event.author_id,
      published: event.published,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      publishedAt: event.publishedAt?.toISOString(),
    };
  }
}
