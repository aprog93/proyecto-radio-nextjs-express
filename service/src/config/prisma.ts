import { PrismaClient } from '@/generated/prisma';

/**
 * Instancia única de PrismaClient para toda la aplicación
 * Usa connection pooling automático
 */
export const prisma = new PrismaClient();

/**
 * Conecta a la base de datos
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✓ Connected to database (Prisma)');
  } catch (error) {
    console.error('✗ Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Desconecta de la base de datos
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✓ Disconnected from database');
  } catch (error) {
    console.error('✗ Failed to disconnect from database:', error);
    throw error;
  }
}

/**
 * Limpia la base de datos (útil para testing)
 * ADVERTENCIA: Elimina TODOS los datos de TODAS las tablas
 */
export async function cleanDatabase(): Promise<void> {
  try {
    // Eliminar en orden inverso de dependencias (foreign keys)
    await prisma.comment.deleteMany();
    await prisma.eventRegistration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.news.deleteMany();
    await prisma.order.deleteMany();
    await prisma.donation.deleteMany();
    await prisma.product.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✓ Database cleaned');
  } catch (error) {
    console.error('✗ Failed to clean database:', error);
    throw error;
  }
}
