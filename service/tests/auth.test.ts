import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '@/services/auth.js';
import { createMockDatabase } from './mocks/database.js';

// Mock bcryptjs - password "admin" matches the hash in mock database
vi.mock('bcryptjs', () => ({
  default: {
    hashSync: vi.fn((password: string) => `hashed_${password}`),
    compareSync: vi.fn((password: string, hash: string) => {
      // Return true for "admin" password with the mock hash
      return password === 'admin';
    }),
  },
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((payload: any, secret: string, options: any) => 'mocked_jwt_token'),
    verify: vi.fn((token: string, secret: string) => {
      if (token === 'valid_token' || token.startsWith('eyJ')) {
        return { id: 1, email: 'admin@radiocesar.local', role: 'admin' };
      }
      return null;
    }),
  },
}));

describe('AuthService', () => {
  let db: ReturnType<typeof createMockDatabase>;
  let authService: AuthService;

  beforeEach(() => {
    db = createMockDatabase();
    authService = new AuthService(db);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register({
        email: 'newuser@test.com',
        password: 'password123',
        displayName: 'New User',
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('newuser@test.com');
      expect(result.displayName).toBe('New User');
      expect(result.role).toBe('listener');
      expect(result.token).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      await expect(
        authService.register({
          email: 'admin@radiocesar.local', // Already exists in mock
          password: 'password123',
          displayName: 'Test User',
        })
      ).rejects.toThrow('El email ya está registrado');
    });

    it('should normalize email to lowercase', async () => {
      const result = await authService.register({
        email: 'UPPERCASE@TEST.COM',
        password: 'password123',
        displayName: 'Test User',
      });

      expect(result.email).toBe('uppercase@test.com');
    });

    it('should create user profile on registration', async () => {
      await authService.register({
        email: 'test2@test.com',
        password: 'password123',
        displayName: 'Test User 2',
      });

      const profiles = db.getTableData('user_profiles');
      expect(profiles.length).toBe(1);
      expect(profiles[0].userId).toBe(2);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const result = await authService.login({
        email: 'admin@radiocesar.local',
        password: 'admin',
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('admin@radiocesar.local');
      expect(result.role).toBe('admin');
      expect(result.token).toBeDefined();
    });

    it('should throw error with incorrect password', async () => {
      await expect(
        authService.login({
          email: 'admin@radiocesar.local',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Email o contraseña incorrectos');
    });

    it('should throw error if user does not exist', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email o contraseña incorrectos');
    });

    it('should normalize email to lowercase', async () => {
      const result = await authService.login({
        email: 'ADMIN@radiocesar.local',
        password: 'admin',
      });

      expect(result.email).toBe('admin@radiocesar.local');
    });
  });

  describe('verifyToken', () => {
    it('should return valid payload for valid token', () => {
      const result = authService.verifyToken('valid_token');
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe('admin@radiocesar.local');
      expect(result?.role).toBe('admin');
    });

    it('should return null for invalid token', () => {
      const result = authService.verifyToken('invalid_token');
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = await authService.getUserById(1);
      expect(user).toBeDefined();
      expect(user?.email).toBe('admin@radiocesar.local');
      expect(user?.role).toBe('admin');
    });

    it('should return null for non-existent user', async () => {
      const user = await authService.getUserById(999);
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user displayName', async () => {
      const updated = await authService.updateUser(1, {
        displayName: 'Updated Name',
      });

      expect(updated.displayName).toBe('Updated Name');
    });

    it('should update user avatar', async () => {
      const updated = await authService.updateUser(1, {
        avatar: 'https://example.com/avatar.jpg',
      });

      expect(updated.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should update user bio', async () => {
      const updated = await authService.updateUser(1, {
        bio: 'This is my bio',
      });

      expect(updated.bio).toBe('This is my bio');
    });

    it('should return current user if no updates provided', async () => {
      const updated = await authService.updateUser(1, {});
      expect(updated.email).toBe('admin@radiocesar.local');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      // Create a user first
      await authService.register({
        email: 'delete@test.com',
        password: 'password123',
        displayName: 'Delete Me',
      });

      await authService.deleteUser(2);

      const user = await authService.getUserById(2);
      expect(user).toBeNull();
    });

    it('should throw error when trying to delete main admin', async () => {
      await expect(authService.deleteUser(1)).rejects.toThrow(
        'No se puede eliminar el administrador principal'
      );
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      // Create a user first
      await authService.register({
        email: 'rolechange@test.com',
        password: 'password123',
        displayName: 'Role Change',
      });

      const updated = await authService.updateUserRole(2, 'admin');
      expect(updated.role).toBe('admin');
    });

    it('should throw error when trying to change main admin role', async () => {
      await expect(authService.updateUserRole(1, 'listener')).rejects.toThrow(
        'No se puede cambiar el rol del administrador principal'
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      // Create additional users
      await authService.register({
        email: 'user2@test.com',
        password: 'password123',
        displayName: 'User 2',
      });
      await authService.register({
        email: 'user3@test.com',
        password: 'password123',
        displayName: 'User 3',
      });

      const users = await authService.getAllUsers(10, 0);
      expect(users.length).toBe(3);
    });

    it('should respect pagination limits', async () => {
      const users = await authService.getAllUsers(1, 0);
      expect(users.length).toBe(1);
    });
  });
});
