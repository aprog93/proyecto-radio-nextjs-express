import { prisma } from '../config/prisma.js';
import { News, CreateNewsRequest } from '../types/database.js';

/**
 * Servicio de gestión de noticias
 */
export class NewsService {
  /**
   * Obtiene noticias publicadas y no expiradas con paginación y búsqueda
   */
  async getPublishedNews(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ news: News[]; total: number }> {
    const offset = (page - 1) * limit;
    const now = new Date();

    const where: any = {
      published: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.news.count({ where }),
    ]);

    return {
      news: news.map((n) => this._formatNews(n)),
      total,
    };
  }

  /**
   * Obtiene una noticia publicada por ID (verificando no expiración)
   */
  async getPublishedNewsById(id: number): Promise<News | null> {
    const now = new Date();
    const news = await prisma.news.findFirst({
      where: {
        id,
        published: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
    });
    return news ? this._formatNews(news) : null;
  }

  /**
   * Obtiene una noticia por ID (sin verificación de publicación)
   */
  async getNewsById(id: number): Promise<News | null> {
    const news = await prisma.news.findUnique({
      where: { id },
    });
    return news ? this._formatNews(news) : null;
  }

  /**
   * Crea una nueva noticia (solo para admin)
   */
  async createNews(data: CreateNewsRequest): Promise<News> {
    if (!data.title || !data.content) {
      throw new Error('Título y contenido son requeridos');
    }

    if (data.content.length > 1500) {
      throw new Error('El contenido no puede exceder 1500 caracteres');
    }

    // Validar fecha de expiración
    if (data.expiresAt) {
      const expireDate = new Date(data.expiresAt);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);

      if (expireDate > maxDate) {
        throw new Error('La fecha de expiración no puede ser más de 30 días en el futuro');
      }
    }

    const news = await prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        author_id: data.author_id || 1, // Admin ID or from context
        published: data.published || false,
        publishedAt: data.published ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        image: data.image || null,
      },
    });

    return this._formatNews(news);
  }

  /**
   * Actualiza una noticia (solo admin)
   */
  async updateNews(id: number, data: Partial<CreateNewsRequest>): Promise<News> {
    const news = await prisma.news.findUnique({ where: { id } });

    if (!news) {
      throw new Error('Noticia no encontrada');
    }

    if (data.content && data.content.length > 1500) {
      throw new Error('El contenido no puede exceder 1500 caracteres');
    }

    // Validar fecha de expiración
    if (data.expiresAt) {
      const expireDate = new Date(data.expiresAt);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);

      if (expireDate > maxDate) {
        throw new Error('La fecha de expiración no puede ser más de 30 días en el futuro');
      }
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.published !== undefined) {
      updateData.published = data.published;
      updateData.publishedAt = data.published ? new Date() : null;
    }
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    const updated = await prisma.news.update({
      where: { id },
      data: updateData,
    });

    return this._formatNews(updated);
  }

  /**
   * Elimina una noticia (solo admin)
   */
  async deleteNews(id: number): Promise<void> {
    const news = await prisma.news.findUnique({ where: { id } });

    if (!news) {
      throw new Error('Noticia no encontrada');
    }

    await prisma.news.delete({ where: { id } });
  }

  /**
   * Incrementa el contador de vistas
   */
  async incrementViewCount(id: number): Promise<void> {
    await prisma.news.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  /**
   * Formatea una noticia para retornar
   */
  private _formatNews(news: any): News {
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      author_id: news.author_id,
      image: news.image || undefined,
      published: news.published,
      expiresAt: news.expiresAt?.toISOString(),
      viewCount: news.viewCount,
      createdAt: news.createdAt.toISOString(),
      updatedAt: news.updatedAt.toISOString(),
      publishedAt: news.publishedAt?.toISOString(),
    };
  }
}
