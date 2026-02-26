import { User, AuthRequest, RegisterRequest } from '@/types/database.js';

/**
 * Test fixtures for User entities
 * Note: Prisma returns Date objects for createdAt/updatedAt, so we use Date here
 */

export const mockAdminUser = {
  id: 1,
  email: 'admin@radiocesar.local',
  displayName: 'Admin User',
  role: 'admin',
  avatar: 'https://example.com/avatar-admin.jpg',
  bio: 'System administrator',
  password: 'hashed_admin123',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  isActive: true,
};

export const mockListenerUser = {
  id: 2,
  email: 'listener@example.com',
  displayName: 'John Listener',
  role: 'listener',
  avatar: 'https://example.com/avatar-john.jpg',
  bio: 'Regular listener',
  password: 'hashed_password123',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
  isActive: true,
};

export const mockInactiveUser = {
  id: 3,
  email: 'inactive@example.com',
  displayName: 'Inactive User',
  role: 'listener',
  password: 'hashed_password456',
  createdAt: new Date('2024-01-10T05:00:00Z'),
  updatedAt: new Date('2024-01-10T05:00:00Z'),
  isActive: false,
};

export const mockNewUser = {
  id: 4,
  email: 'newuser@example.com',
  displayName: 'New User',
  role: 'listener',
  password: 'hashed_newpassword',
  createdAt: new Date('2024-02-20T12:00:00Z'),
  updatedAt: new Date('2024-02-20T12:00:00Z'),
  isActive: true,
};

/**
 * Auth request fixtures
 */

export const validLoginRequest: AuthRequest = {
  email: 'listener@example.com',
  password: 'password123',
};

export const validRegisterRequest: RegisterRequest = {
  email: 'newlistener@example.com',
  password: 'SecurePass123!',
  displayName: 'New Listener',
};

export const invalidEmailRequest: AuthRequest = {
  email: 'invalid-email',
  password: 'password123',
};

export const invalidPasswordRequest: AuthRequest = {
  email: 'listener@example.com',
  password: 'wrongpassword',
};

export const emptyEmailRequest: AuthRequest = {
  email: '',
  password: 'password123',
};

export const emptyPasswordRequest: AuthRequest = {
  email: 'listener@example.com',
  password: '',
};

/**
 * Users for database seeding
 */

export const testUsers = [
  mockAdminUser,
  mockListenerUser,
  mockInactiveUser,
  mockNewUser,
];

/**
 * Helper to create a mock user with custom values
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    ...mockNewUser,
    id: Math.floor(Math.random() * 10000),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
