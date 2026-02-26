/**
 * Global test setup file for Vitest
 * Configures mocks and environment variables
 */

import { vi } from 'vitest';
import { mockPrisma } from './mocks/prisma.js';

// Mock the Prisma client module
vi.mock('@/config/prisma.js', () => ({
  prisma: mockPrisma,
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  cleanDatabase: vi.fn(),
}));

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';
