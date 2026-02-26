import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '@/services/auth.js';
import {
  mockAdminUser,
  mockListenerUser,
  validRegisterRequest,
  validLoginRequest,
  invalidPasswordRequest,
  emptyEmailRequest,
  emptyPasswordRequest,
  testUsers,
} from '../fixtures/users.js';
import { createValidToken, createExpiredToken, mockTokens } from '../mocks/tokens.js';

const TEST_JWT_SECRET = 'test-secret-key-for-testing-only';

// Mock bcrypt for password hashing control
vi.mock('bcryptjs', () => ({
  default: {
    hashSync: vi.fn((password) => `hashed_${password}`),
    compareSync: vi.fn((password, hash) => {
      return hash === `hashed_${password}`;
    }),
  },
}));

// Mock jwt for token generation control
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((payload, secret, options) => {
      return `token_${JSON.stringify(payload)}_${Date.now()}`;
    }),
    verify: vi.fn((token, secret) => {
      try {
        // Simulate token verification
        if (token.includes('invalid') || token.includes('expired')) {
          throw new Error('Invalid token');
        }
        return JSON.parse(token.replace('token_', '').split('_')[0]);
      } catch (error) {
        throw error;
      }
    }),
  },
}));

// Create a more realistic mock database wrapper
class TestDatabaseWrapper {
  private users: any[] = [];
  private userProfiles: any[] = [];
  private nextUserId = 1;

  constructor() {
    // Initialize with test users
    this.users = [
      {
        id: 1,
        email: 'admin@radiocesar.local',
        password: 'hashed_admin123',
        displayName: 'Admin User',
        role: 'admin',
        avatar: null,
        bio: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isActive: 1,
      },
      {
        id: 2,
        email: 'listener@example.com',
        password: 'hashed_password123',
        displayName: 'John Listener',
        role: 'listener',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Music enthusiast',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isActive: 1,
      },
      {
        id: 3,
        email: 'inactive@example.com',
        password: 'hashed_password456',
        displayName: 'Inactive User',
        role: 'listener',
        avatar: null,
        bio: null,
        createdAt: '2024-01-10T05:00:00Z',
        updatedAt: '2024-01-10T05:00:00Z',
        isActive: 0,
      },
    ];
    this.nextUserId = 4;
  }

  getOne<T = any>(sql: string, params: any[] = []): T | undefined {
    if (sql.includes('SELECT * FROM users WHERE email')) {
      const email = params[0]?.toLowerCase();
      // Check for isActive condition
      if (sql.includes('isActive')) {
        return this.users.find(u => u.email === email && u.isActive) as T;
      }
      return this.users.find(u => u.email === email) as T;
    }

    if (sql.includes('SELECT id FROM users WHERE email')) {
      const email = params[0]?.toLowerCase();
      const user = this.users.find(u => u.email === email);
      return user ? { id: user.id } as T : undefined;
    }

    if (sql.includes('SELECT id, email, displayName')) {
      const id = params[0];
      const user = this.users.find(u => u.id === id);
      if (!user) return undefined;
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as T;
    }

    return undefined;
  }

  getAll<T = any>(sql: string, params: any[] = []): T[] {
    if (sql.includes('SELECT id, email, displayName')) {
      const limit = params[0] || 50;
      const offset = params[1] || 0;
      return this.users
        .slice(offset, offset + limit)
        .map(u => {
          const { password, ...userWithoutPassword } = u;
          return userWithoutPassword as T;
        });
    }

    return [];
  }

  run(sql: string, params: any[] = []): { changes: number; lastID: number } {
    if (sql.includes('INSERT INTO users')) {
      const [email, password, displayName, role, isActive] = params;
      const newUser = {
        id: this.nextUserId++,
        email: email.toLowerCase(),
        password,
        displayName,
        role,
        avatar: null,
        bio: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive,
      };
      this.users.push(newUser);
      return { changes: 1, lastID: newUser.id };
    }

    if (sql.includes('INSERT INTO user_profiles')) {
      // Just track that it was called
      return { changes: 1, lastID: 1 };
    }

    if (sql.includes('UPDATE users SET')) {
      const lastParam = params[params.length - 1]; // userId is usually last
      const user = this.users.find(u => u.id === lastParam);
      if (user) {
        if (sql.includes('displayName')) {
          user.displayName = params[0];
        }
        if (sql.includes('bio')) {
          user.bio = params[sql.includes('displayName') ? 1 : 0];
        }
        if (sql.includes('avatar')) {
          const avatarIdx = sql.includes('displayName') ? 2 : sql.includes('bio') ? 1 : 0;
          user.avatar = params[avatarIdx];
        }
        if (sql.includes('role =')) {
          user.role = params[0];
        }
        user.updatedAt = new Date().toISOString();
        return { changes: 1, lastID: 0 };
      }
      return { changes: 0, lastID: 0 };
    }

    if (sql.includes('DELETE FROM users')) {
      const id = params[0];
      const index = this.users.findIndex(u => u.id === id);
      if (index !== -1) {
        this.users.splice(index, 1);
        return { changes: 1, lastID: 0 };
      }
      return { changes: 0, lastID: 0 };
    }

    return { changes: 0, lastID: 0 };
  }

  count(sql: string, params: any[] = []): number {
    return this.users.length;
  }

  transaction<T>(callback: () => T): T {
    return callback();
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockDb: TestDatabaseWrapper;

  beforeEach(() => {
    mockDb = new TestDatabaseWrapper();
    authService = new AuthService(mockDb as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerRequest = {
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        displayName: 'New User',
      };

      const result = await authService.register(registerRequest);

      expect(result).toBeDefined();
      expect(result.email).toBe(registerRequest.email.toLowerCase());
      expect(result.displayName).toBe(registerRequest.displayName);
      expect(result.role).toBe('listener');
      expect(result.token).toBeDefined();
      expect(result.token).toContain('token_');
    });

    it('should throw error if email already exists', async () => {
      const registerRequest = {
        email: 'listener@example.com',
        password: 'password123',
        displayName: 'Duplicate User',
      };

      await expect(authService.register(registerRequest)).rejects.toThrow(
        'El email ya está registrado'
      );
    });

    it('should hash the password', async () => {
      const registerRequest = {
        email: 'newuser2@example.com',
        password: 'MyPassword123!',
        displayName: 'New User 2',
      };

      await authService.register(registerRequest);

      expect(bcrypt.hashSync).toHaveBeenCalledWith(
        registerRequest.password,
        10
      );
    });

    it('should convert email to lowercase', async () => {
      const registerRequest = {
        email: 'UPPERCASE@EXAMPLE.COM',
        password: 'password123',
        displayName: 'User with Uppercase Email',
      };

      const result = await authService.register(registerRequest);

      expect(result.email).toBe('uppercase@example.com');
    });

    it('should generate JWT token with user data', async () => {
      const registerRequest = {
        email: 'tokentest@example.com',
        password: 'password123',
        displayName: 'Token Test User',
      };

      const result = await authService.register(registerRequest);

      expect(jwt.sign).toHaveBeenCalled();
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });
  });

  describe('login', () => {
    it('should successfully login with correct credentials', async () => {
      const loginRequest = {
        email: 'listener@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginRequest);

      expect(result).toBeDefined();
      expect(result.email).toBe(loginRequest.email.toLowerCase());
      expect(result.displayName).toBe('John Listener');
      expect(result.role).toBe('listener');
      expect(result.token).toBeDefined();
    });

    it('should throw error if email does not exist', async () => {
      const loginRequest = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginRequest)).rejects.toThrow(
        'Email o contraseña incorrectos'
      );
    });

    it('should throw error if password is incorrect', async () => {
      const loginRequest = {
        email: 'listener@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginRequest)).rejects.toThrow(
        'Email o contraseña incorrectos'
      );
    });

    it('should throw error if user account is inactive', async () => {
      const loginRequest = {
        email: 'inactive@example.com',
        password: 'password456',
      };

      await expect(authService.login(loginRequest)).rejects.toThrow();
    });

    it('should convert email to lowercase during login', async () => {
      const loginRequest = {
        email: 'LISTENER@EXAMPLE.COM',
        password: 'password123',
      };

      const result = await authService.login(loginRequest);

      expect(result.email).toBe('listener@example.com');
    });

    it('should verify password using bcrypt', async () => {
      const loginRequest = {
        email: 'listener@example.com',
        password: 'password123',
      };

      await authService.login(loginRequest);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        loginRequest.password,
        'hashed_password123'
      );
    });

    it('should generate token on successful login', async () => {
      const loginRequest = {
        email: 'listener@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginRequest);

      expect(jwt.sign).toHaveBeenCalled();
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const payload = {
        id: 1,
        email: 'admin@radiocesar.local',
        role: 'admin' as const,
      };

      const token = createValidToken(payload);
      const result = authService.verifyToken(token);

      expect(result).toBeDefined();
      expect(result?.id).toBe(payload.id);
      expect(result?.email).toBe(payload.email);
      expect(result?.role).toBe(payload.role);
    });

    it('should return null for invalid token', () => {
      const result = authService.verifyToken('invalid.token.format');

      expect(result).toBeNull();
    });

    it('should return null for tampered token', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
      const result = authService.verifyToken(token);

      expect(result).toBeNull();
    });

    it('should extract correct payload from token', () => {
      const payload = {
        id: 2,
        email: 'listener@example.com',
        role: 'listener' as const,
      };

      const token = createValidToken(payload);
      const result = authService.verifyToken(token);

      expect(result?.id).toBe(2);
      expect(result?.email).toBe('listener@example.com');
      expect(result?.role).toBe('listener');
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by id', async () => {
      const result = await authService.getUserById(1);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe('admin@radiocesar.local');
      expect(result?.displayName).toBe('Admin User');
    });

    it('should return null if user does not exist', async () => {
      const result = await authService.getUserById(999);

      expect(result).toBeNull();
    });

    it('should not return password field', async () => {
      const result = await authService.getUserById(1);

      expect(result).toBeDefined();
      expect('password' in (result || {})).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user displayName', async () => {
      const result = await authService.updateUser(1, {
        displayName: 'Updated Admin Name',
      });

      expect(result.displayName).toBe('Updated Admin Name');
    });

    it('should update user bio', async () => {
      const result = await authService.updateUser(2, {
        bio: 'Updated bio text',
      });

      expect(result.bio).toBe('Updated bio text');
    });

    it('should update user avatar', async () => {
      const result = await authService.updateUser(2, {
        avatar: 'https://example.com/new-avatar.jpg',
      });

      expect(result.avatar).toBe('https://example.com/new-avatar.jpg');
    });

    it('should throw error if user does not exist', async () => {
      await expect(authService.updateUser(999, { displayName: 'Test' })).rejects.toThrow();
    });
  });

  describe('getAllUsers', () => {
    it('should retrieve all users with default limit', async () => {
      const result = await authService.getAllUsers();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply limit parameter', async () => {
      const result = await authService.getAllUsers(2);

      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should not include password in user objects', async () => {
      const result = await authService.getAllUsers();

      result.forEach(user => {
        expect('password' in user).toBe(false);
      });
    });

    it('should return users with correct structure', async () => {
      const result = await authService.getAllUsers(1);

      if (result.length > 0) {
        const user = result[0];
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.displayName).toBeDefined();
        expect(user.role).toBeDefined();
      }
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      await authService.deleteUser(2);

      const deletedUser = await authService.getUserById(2);
      expect(deletedUser).toBeNull();
    });

    it('should throw error when deleting main admin', async () => {
      await expect(
        authService.deleteUser(1)
      ).rejects.toThrow('No se puede eliminar el administrador principal');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role from listener to admin', async () => {
      const result = await authService.updateUserRole(2, 'admin');

      expect(result.role).toBe('admin');
    });

    it('should throw error when changing main admin role', async () => {
      await expect(
        authService.updateUserRole(1, 'listener')
      ).rejects.toThrow('No se puede cambiar el rol del administrador principal');
    });

    it('should return user with updated role', async () => {
      const result = await authService.updateUserRole(2, 'admin');

      expect(result.id).toBe(2);
      expect(result.email).toBe('listener@example.com');
      expect(result.role).toBe('admin');
    });
  });
});

