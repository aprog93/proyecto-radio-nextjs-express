import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '@/services/auth.js';
import { mockPrisma } from '../mocks/prisma.js';
import {
  mockAdminUser,
  mockListenerUser,
  validRegisterRequest,
  validLoginRequest,
} from '../fixtures/users.js';

const TEST_JWT_SECRET = 'test-secret-key-for-testing-only';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hashSync: vi.fn((password) => `hashed_${password}`),
    compareSync: vi.fn((password, hash) => hash === `hashed_${password}`),
  },
}));

// Mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((payload, secret, options) => `token_${JSON.stringify(payload)}`),
    verify: vi.fn((token) => {
      if (token.includes('invalid') || token.includes('expired')) {
        throw new Error('Invalid token');
      }
      return JSON.parse(token.replace('token_', ''));
    }),
  },
}));

describe('AuthService with Prisma', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Limpiar todos los mocks
    vi.clearAllMocks();

    // Resetear mocks de Prisma
    Object.values(mockPrisma).forEach((entity) => {
      if (typeof entity === 'object' && entity !== null) {
        Object.values(entity).forEach((method) => {
          if (typeof method === 'function' && method.mockReset) {
            method.mockReset();
          }
        });
      }
    });

    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        id: 1,
        email: validRegisterRequest.email.toLowerCase(),
        password: `hashed_${validRegisterRequest.password}`,
        displayName: validRegisterRequest.displayName,
        role: 'listener',
        avatar: null,
        bio: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce(newUser);

      const result = await authService.register(validRegisterRequest);

      expect(result).toBeDefined();
      expect(result.email).toBe(validRegisterRequest.email.toLowerCase());
      expect(result.displayName).toBe(validRegisterRequest.displayName);
      expect(result.role).toBe('listener');
      expect(result.token).toBeDefined();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validRegisterRequest.email.toLowerCase() },
      });
    });

    it('should throw error if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdminUser);

      await expect(authService.register(validRegisterRequest)).rejects.toThrow(
        'El email ya está registrado'
      );
    });

    it('should hash password before saving', async () => {
      const newUser = {
        id: 1,
        email: 'newuser@example.com',
        password: `hashed_${validRegisterRequest.password}`,
        displayName: 'New User',
        role: 'listener',
        avatar: null,
        bio: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce(newUser);

      await authService.register(validRegisterRequest);

      expect(bcrypt.hashSync).toHaveBeenCalledWith(validRegisterRequest.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should create user profile with new user', async () => {
      const newUser = {
        id: 1,
        email: 'newuser@example.com',
        password: 'hashed_password123',
        displayName: 'New User',
        role: 'listener',
        avatar: null,
        bio: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce(newUser);

      await authService.register(validRegisterRequest);

      // Verify user.create was called with profile data
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            profile: expect.objectContaining({
              create: {},
            }),
          }),
        })
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with correct credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(mockAdminUser);
      (bcrypt.compareSync as any).mockReturnValueOnce(true);

      const result = await authService.login(validLoginRequest);

      expect(result).toBeDefined();
      expect(result.email).toBe(mockAdminUser.email);
      expect(result.displayName).toBe(mockAdminUser.displayName);
      expect(result.token).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      await expect(authService.login(validLoginRequest)).rejects.toThrow(
        'Email o contraseña incorrectos'
      );
    });

    it('should throw error for incorrect password', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(mockAdminUser);
      (bcrypt.compareSync as any).mockReturnValueOnce(false);

      await expect(
        authService.login({
          email: mockAdminUser.email,
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Email o contraseña incorrectos');
    });

    it('should not login inactive user', async () => {
      const inactiveUser = { ...mockAdminUser, isActive: false };
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      await expect(authService.login(validLoginRequest)).rejects.toThrow(
        'Email o contraseña incorrectos'
      );
    });

    it('should verify password with bcrypt', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(mockAdminUser);
      (bcrypt.compareSync as any).mockReturnValueOnce(true);

      await authService.login(validLoginRequest);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        validLoginRequest.password,
        mockAdminUser.password
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = `token_{"id":1,"email":"test@example.com","role":"admin"}`;
      (jwt.verify as any).mockReturnValueOnce({
        id: 1,
        email: 'test@example.com',
        role: 'admin',
      });

      const result = authService.verifyToken(token);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe('test@example.com');
      expect(result?.role).toBe('admin');
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid_token';
      (jwt.verify as any).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = authService.verifyToken(invalidToken);

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const expiredToken = 'token_expired';
      (jwt.verify as any).mockImplementationOnce(() => {
        throw new Error('Token expired');
      });

      const result = authService.verifyToken(expiredToken);

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdminUser);

      const result = await authService.getUserById(1);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockAdminUser.id);
      expect(result?.email).toBe(mockAdminUser.email);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const result = await authService.getUserById(999);

      expect(result).toBeNull();
    });

    it('should convert Date to ISO string in returned user', async () => {
      const userWithDate = {
        ...mockAdminUser,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce(userWithDate);

      const result = await authService.getUserById(1);

      expect(result?.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(result?.updatedAt).toBe('2024-01-02T00:00:00.000Z');
    });
  });

  describe('updateUser', () => {
    it('should update user displayName', async () => {
      const updatedUser = { ...mockAdminUser, displayName: 'Updated Name' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdminUser);
      mockPrisma.user.update.mockResolvedValueOnce(updatedUser);

      const result = await authService.updateUser(1, {
        displayName: 'Updated Name',
      } as any);

      expect(result.displayName).toBe('Updated Name');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { displayName: 'Updated Name' },
      });
    });

    it('should update user bio', async () => {
      const updatedUser = { ...mockAdminUser, bio: 'New bio' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdminUser);
      mockPrisma.user.update.mockResolvedValueOnce(updatedUser);

      const result = await authService.updateUser(1, { bio: 'New bio' } as any);

      expect(result.bio).toBe('New bio');
    });

    it('should update user avatar', async () => {
      const updatedUser = { ...mockAdminUser, avatar: 'new-avatar.jpg' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdminUser);
      mockPrisma.user.update.mockResolvedValueOnce(updatedUser);

      const result = await authService.updateUser(1, {
        avatar: 'new-avatar.jpg',
      } as any);

      expect(result.avatar).toBe('new-avatar.jpg');
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(authService.updateUser(999, {})).rejects.toThrow(
        'Usuario no encontrado'
      );
    });

    it('should return user unchanged if no updates provided', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdminUser);

      const result = await authService.updateUser(1, {});

      expect(result.id).toBe(mockAdminUser.id);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should update multiple fields at once', async () => {
      const updatedUser = {
        ...mockAdminUser,
        displayName: 'New Name',
        bio: 'New bio',
        avatar: 'new-avatar.jpg',
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdminUser);
      mockPrisma.user.update.mockResolvedValueOnce(updatedUser);

      const result = await authService.updateUser(1, {
        displayName: 'New Name',
        bio: 'New bio',
        avatar: 'new-avatar.jpg',
      } as any);

      expect(result.displayName).toBe('New Name');
      expect(result.bio).toBe('New bio');
      expect(result.avatar).toBe('new-avatar.jpg');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with default pagination', async () => {
      const users = [mockAdminUser, mockListenerUser];
      mockPrisma.user.findMany.mockResolvedValueOnce(users);

      const result = await authService.getAllUsers();

      expect(result).toHaveLength(2);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        take: 50,
        skip: 0,
      });
    });

    it('should apply custom limit and offset', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([mockAdminUser]);

      await authService.getAllUsers(10, 5);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 5,
      });
    });

    it('should return empty array if no users found', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);

      const result = await authService.getAllUsers();

      expect(result).toHaveLength(0);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockListenerUser);
      mockPrisma.user.delete.mockResolvedValueOnce(mockListenerUser);

      await authService.deleteUser(2);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });

    it('should throw error when deleting admin user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdminUser);

      await expect(authService.deleteUser(1)).rejects.toThrow(
        'No se puede eliminar el administrador principal'
      );
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(authService.deleteUser(999)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const updatedUser = { ...mockListenerUser, role: 'admin' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockListenerUser);
      mockPrisma.user.update.mockResolvedValueOnce(updatedUser);

      const result = await authService.updateUserRole(2, 'admin');

      expect(result.role).toBe('admin');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { role: 'admin' },
      });
    });

    it('should throw error when changing admin role', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdminUser);

      await expect(authService.updateUserRole(1, 'listener')).rejects.toThrow(
        'No se puede cambiar el rol del administrador principal'
      );
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(authService.updateUserRole(999, 'admin')).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });
});
