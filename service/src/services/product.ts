import { prisma } from '../config/prisma.js';
import { Product, CreateProductRequest } from '../types/database.js';

/**
 * Servicio de gestión de productos
 */
export class ProductService {
  /**
   * Obtiene productos publicados con paginación y filtros
   */
  async getPublishedProducts(
    page: number = 1,
    limit: number = 12,
    category?: string,
    search?: string
  ): Promise<{ products: Product[]; total: number }> {
    const offset = (page - 1) * limit;

    const where: any = { published: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map(this._formatProduct),
      total,
    };
  }

  /**
   * Obtiene un producto publicado por ID
   */
  async getPublishedProduct(id: number): Promise<Product | null> {
    const product = await prisma.product.findFirst({
      where: { id, published: true },
    });
    return product ? this._formatProduct(product) : null;
  }

  /**
   * Crea un nuevo producto (solo admin)
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    if (!data.name || data.price === undefined) {
      throw new Error('Nombre y precio son requeridos');
    }

    if (data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        category: data.category || null,
        stock: data.stock || 0,
        published: data.published || false,
      },
    });

    return this._formatProduct(product);
  }

  /**
   * Actualiza un producto (solo admin)
   */
  async updateProduct(id: number, data: Partial<CreateProductRequest>): Promise<Product> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) {
      if (data.price < 0) throw new Error('El precio no puede ser negativo');
      updateData.price = data.price;
    }
    if (data.category !== undefined) updateData.category = data.category;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.published !== undefined) updateData.published = data.published;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return this._formatProduct(updated);
  }

  /**
   * Elimina un producto (solo admin)
   */
  async deleteProduct(id: number): Promise<void> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    await prisma.product.delete({ where: { id } });
  }

  /**
   * Obtiene todos los productos (solo admin)
   */
  async getAllProducts(page: number = 1, limit: number = 50): Promise<{ products: Product[]; total: number }> {
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.product.count(),
    ]);

    return {
      products: products.map(this._formatProduct),
      total,
    };
  }

  /**
   * Formatea un producto para retornar
   */
  private _formatProduct(product: any): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      price: product.price,
      image: product.image || undefined,
      category: product.category || undefined,
      stock: product.stock,
      published: product.published,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
