import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDatabase, MockDatabaseWrapper } from './mocks/database';
import { createUserRouter } from '../dist/routes/users.js';
import { AuthService } from '../dist/services/auth.js';
import express, { type Request, type Response, type NextFunction } from 'express';

// Mock AuthService
vi.mock('../dist/services/auth.js', () => ({
  AuthService: class MockAuthService {
    constructor(private db: any) {}
    verifyToken(token: string) {
      if (token.startsWith('valid_')) {
        return { id: 1, email: 'admin@test.com', role: 'admin' };
      }
      return null;
    }
    async getUserById(id: number) {
      return { id, email: 'admin@test.com', displayName: 'Admin', role: 'admin', bio: null };
    }
    async updateUser(id: number, data: any) {
      return { id, ...data };
    }
  },
}));

describe('User Routes', () => {
  let db: MockDatabaseWrapper;
  let authService: AuthService;

  const mockRequest = (params: any = {}, body: any = {}, headers: any = {}) => ({
    params,
    body,
    headers,
    userId: headers['x-user-id'] || 1,
    userRole: headers['x-user-role'] || 'admin',
    authService,
  } as unknown as Request);

  const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as unknown as Response;
  };

  const mockNext = vi.fn() as NextFunction;

  beforeEach(() => {
    db = createMockDatabase();
    authService = new AuthService(db);
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile successfully', async () => {
      // Add profile
      db.run(`INSERT INTO user_profiles (userId, bio) VALUES (?, ?)`, [1, 'Test bio']);

      const router = createUserRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/profile' && r.route.methods.get);
      
      const req = mockRequest({}, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({ id: 1 }),
          }),
        })
      );
    });

    it('should require authentication', async () => {
      const router = createUserRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/profile' && r.route.methods.get);
      
      const req = mockRequest({}, {}, {});
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update profile successfully', async () => {
      const router = createUserRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/profile' && r.route.methods.put);
      
      const req = mockRequest(
        {},
        { displayName: 'New Name', bio: 'New bio' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Perfil actualizado exitosamente',
        })
      );
    });

    it('should require authentication', async () => {
      const router = createUserRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/profile' && r.route.methods.put);
      
      const req = mockRequest({}, { displayName: 'New Name' }, {});
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
