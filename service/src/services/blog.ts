import { prisma } from '../config/prisma.js';
import { Blog, CreateBlogRequest } from '../types/database.js';

/**
 * Servicio de gestión de blogs
 */
export class BlogService {
  /**
   * Obtiene blogs publicados con paginación y filtros
   */
  async getPublishedBlogs(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string
  ): Promise<{ blogs: Blog[]; total: number }> {
    const offset = (page - 1) * limit;

    const where: any = { published: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: { author: { select: { id: true, displayName: true, avatar: true } } },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.blog.count({ where }),
    ]);

    return {
      blogs: blogs.map(this._formatBlog),
      total,
    };
  }

  /**
   * Obtiene un blog publicado por slug
   */
  async getPublishedBySlug(slug: string): Promise<Blog | null> {
    const blog = await prisma.blog.findFirst({
      where: { slug, published: true },
      include: { author: { select: { id: true, displayName: true, avatar: true } } },
    });
    return blog ? this._formatBlog(blog) : null;
  }

  /**
   * Obtiene todos los blogs del usuario autenticado
   */
  async getUserBlogs(userId: number, page: number = 1, limit: number = 10): Promise<{ blogs: Blog[]; total: number }> {
    const offset = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: { author_id: userId },
        include: { author: { select: { id: true, displayName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.blog.count({ where: { author_id: userId } }),
    ]);

    return {
      blogs: blogs.map(this._formatBlog),
      total,
    };
  }

  /**
   * Crea un nuevo blog (solo para autor autenticado)
   */
  async createBlog(userId: number, data: CreateBlogRequest): Promise<Blog> {
    if (!data.title || !data.content) {
      throw new Error('Título y contenido son requeridos');
    }

    // Generar slug desde título
    const slug = this._generateSlug(data.title);

    // Verificar que el slug sea único
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      throw new Error('El slug ya existe, elige un título diferente');
    }

    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || null,
        author_id: userId,
        category: data.category || null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        published: data.published || false,
        publishedAt: data.published ? new Date() : null,
      },
      include: { author: { select: { id: true, displayName: true, avatar: true } } },
    });

    return this._formatBlog(blog);
  }

  /**
   * Actualiza un blog (solo el autor)
   */
  async updateBlog(blogId: number, userId: number, data: Partial<CreateBlogRequest>): Promise<Blog> {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: { author: true },
    });

    if (!blog) {
      throw new Error('Blog no encontrado');
    }

    if (blog.author_id !== userId) {
      throw new Error('No tienes permiso para editar este blog');
    }

    const updateData: any = {};
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = this._generateSlug(data.title);
    }
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags ? JSON.stringify(data.tags) : null;
    if (data.published !== undefined) {
      updateData.published = data.published;
      updateData.publishedAt = data.published ? new Date() : null;
    }

    const updated = await prisma.blog.update({
      where: { id: blogId },
      data: updateData,
      include: { author: { select: { id: true, displayName: true, avatar: true } } },
    });

    return this._formatBlog(updated);
  }

  /**
   * Elimina un blog (solo el autor)
   */
  async deleteBlog(blogId: number, userId: number): Promise<void> {
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });

    if (!blog) {
      throw new Error('Blog no encontrado');
    }

    if (blog.author_id !== userId) {
      throw new Error('No tienes permiso para eliminar este blog');
    }

    await prisma.blog.delete({ where: { id: blogId } });
  }

  /**
   * Incrementa el contador de vistas
   */
  async incrementViewCount(blogId: number): Promise<void> {
    await prisma.blog.update({
      where: { id: blogId },
      data: { viewCount: { increment: 1 } },
    });
  }

  /**
   * Genera un slug válido desde un título
   */
  private _generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Formatea un blog para retornar
   */
  private _formatBlog(blog: any): Blog {
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt || undefined,
      author_id: blog.author_id,
      category: blog.category || undefined,
      tags: blog.tags ? JSON.parse(blog.tags) : undefined,
      image: blog.image || undefined,
      published: blog.published,
      viewCount: blog.viewCount,
      publishedAt: blog.publishedAt?.toISOString(),
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString(),
    };
  }
}
