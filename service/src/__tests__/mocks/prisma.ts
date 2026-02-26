import { vi } from 'vitest';

/**
 * Mock Prisma Client para testing
 * Proporciona métodos mock para todas las entidades principales
 */
export const mockPrisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  userProfile: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  blog: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  news: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  event: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  eventRegistration: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  schedule: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  product: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  order: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  donation: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  comment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};

/**
 * Mock implementación del Prisma Client
 */
export const createMockPrismaClient = () => {
  return mockPrisma;
};

/**
 * Reset todos los mocks de Prisma
 */
export const resetPrismaMocks = () => {
  Object.values(mockPrisma).forEach((entity) => {
    if (typeof entity === 'object' && entity !== null) {
      Object.values(entity).forEach((method) => {
        if (typeof method === 'function' && method.mockReset) {
          method.mockReset();
        }
      });
    }
  });
};

/**
 * Setup común para tests que usan Prisma
 */
export const setupPrismaTest = () => {
  // Mock del módulo de Prisma
  vi.mock('@/generated/prisma', () => ({
    PrismaClient: vi.fn(() => mockPrisma),
  }));

  return mockPrisma;
};
