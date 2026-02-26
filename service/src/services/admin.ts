import { prisma } from '../config/prisma.js';
import { User } from '../types/database.js';

/**
 * Servicio de administración y estadísticas
 */
export class AdminService {
  /**
   * Obtiene lista de usuarios con búsqueda y paginación
   */
  async listUsers(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          avatar: true,
          createdAt: true,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => this._formatUser(u)),
      total,
    };
  }

  /**
   * Obtiene estadísticas globales del sistema
   */
  async getStats(): Promise<any> {
    const [
      totalUsers,
      activeUsers,
      admins,
      listeners,
      totalBlogs,
      publishedBlogs,
      totalNews,
      publishedNews,
      totalEvents,
      publishedEvents,
      totalProducts,
      publishedProducts,
      totalDonations,
      donationsAmount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'listener' } }),
      prisma.blog.count(),
      prisma.blog.count({ where: { published: true } }),
      prisma.news.count(),
      prisma.news.count({ where: { published: true } }),
      prisma.event.count(),
      prisma.event.count({ where: { published: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.donation.count(),
      this._getDonationsAmount(),
    ]);

    return {
      totalUsers,
      activeUsers,
      admins,
      listeners,
      totalBlogs,
      publishedBlogs,
      totalNews,
      publishedNews,
      totalEvents,
      publishedEvents,
      totalProducts,
      publishedProducts,
      totalDonations: {
        count: totalDonations,
        amount: donationsAmount,
      },
    };
  }

  /**
   * Obtiene monto total de donaciones
   */
  private async _getDonationsAmount(): Promise<number> {
    const result = await prisma.donation.aggregate({
      _sum: {
        amount: true,
      },
    });
    return result._sum?.amount || 0;
  }

  /**
   * Formatea un usuario para retornar
   */
  private _formatUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() || user.createdAt.toISOString(),
      isActive: user.isActive,
    };
  }
}
