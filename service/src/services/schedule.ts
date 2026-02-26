import { prisma } from '../config/prisma.js';
import { Schedule } from '../types/database.js';

/**
 * Servicio de gestión de programación de radio
 */
export class ScheduleService {
  /**
   * Obtiene toda la programación ordenada
   */
  async getSchedule(): Promise<Schedule[]> {
    const schedule = await prisma.schedule.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    return schedule.map((s) => this._formatSchedule(s));
  }

  /**
   * Obtiene programación por día de la semana
   */
  async getScheduleByDay(dayOfWeek: number): Promise<Schedule[]> {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error('Día inválido (0-6)');
    }

    const schedule = await prisma.schedule.findMany({
      where: { dayOfWeek },
      orderBy: { startTime: 'asc' },
    });
    return schedule.map((s) => this._formatSchedule(s));
  }

  /**
   * Crea una programación (solo admin)
   */
  async createSchedule(data: {
    title: string;
    description?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    host?: string;
    image?: string;
  }): Promise<Schedule> {
    if (!data.title || data.dayOfWeek === undefined || !data.startTime || !data.endTime) {
      throw new Error('Título, día, hora de inicio y fin son requeridos');
    }

    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      throw new Error('Día inválido (0-6)');
    }

    const schedule = await prisma.schedule.create({
      data: {
        title: data.title,
        description: data.description || null,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        host: data.host || null,
        image: data.image || null,
      },
    });

    return this._formatSchedule(schedule);
  }

  /**
   * Actualiza una programación (solo admin)
   */
  async updateSchedule(
    id: number,
    data: {
      title?: string;
      description?: string;
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      host?: string;
      image?: string;
    }
  ): Promise<Schedule> {
    const schedule = await prisma.schedule.findUnique({ where: { id } });

    if (!schedule) {
      throw new Error('Programación no encontrada');
    }

    if (data.dayOfWeek !== undefined && (data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
      throw new Error('Día inválido (0-6)');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.host !== undefined) updateData.host = data.host;
    if (data.image !== undefined) updateData.image = data.image;

    const updated = await prisma.schedule.update({
      where: { id },
      data: updateData,
    });

    return this._formatSchedule(updated);
  }

  /**
   * Elimina una programación (solo admin)
   */
  async deleteSchedule(id: number): Promise<void> {
    const schedule = await prisma.schedule.findUnique({ where: { id } });

    if (!schedule) {
      throw new Error('Programación no encontrada');
    }

    await prisma.schedule.delete({ where: { id } });
  }

  /**
   * Formatea una programación para retornar
   */
  private _formatSchedule(schedule: any): Schedule {
    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description || undefined,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      host: schedule.host || undefined,
      image: schedule.image || undefined,
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    };
  }
}
