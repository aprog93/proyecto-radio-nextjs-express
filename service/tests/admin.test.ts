import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDatabase, MockDatabaseWrapper } from './mocks/database';
import { createAdminRouter } from '../dist/routes/admin.js';
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
      return { id, email: 'admin@test.com', displayName: 'Admin', role: 'admin' };
    }
    async register(data: any) {
      const result = this.db.run(
        `INSERT INTO users (email, password, displayName, role) VALUES (?, ?, ?, ?)`,
        [data.email, 'hashed_' + data.password, data.displayName, 'listener']
      );
      return { id: result.lastID, ...data, role: 'listener' };
    }
    async updateUserRole(id: number, role: string) {
      this.db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
      return { id, role };
    }
    async deleteUser(id: number) {
      this.db.run('DELETE FROM users WHERE id = ?', [id]);
    }
    async updateUser(id: number, data: any) {
      return { id, ...data };
    }
  },
}));

describe('Admin Routes', () => {
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

  describe('GET /api/admin/users', () => {
    it('should return all users with pagination', async () => {
      // Add more users
      db.run(
        `INSERT INTO users (email, displayName, role, isActive) VALUES (?, ?, ?, ?)`,
        ['user1@test.com', 'User 1', 'listener', 1]
      );
      db.run(
        `INSERT INTO users (email, displayName, role, isActive) VALUES (?, ?, ?, ?)`,
        ['user2@test.com', 'User 2', 'listener', 1]
      );

      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users' && r.route.methods.get);
      
      const req = mockRequest({}, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.success).toBe(true);
      expect(callArgs.total).toBe(3);
    });

    it('should filter users by search term', async () => {
      db.run(
        `INSERT INTO users (email, displayName, role, isActive) VALUES (?, ?, ?, ?)`,
        ['john@test.com', 'John Doe', 'listener', 1]
      );
      db.run(
        `INSERT INTO users (email, displayName, role, isActive) VALUES (?, ?, ?, ?)`,
        ['jane@test.com', 'Jane Doe', 'listener', 1]
      );

      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users' && r.route.methods.get);
      
      const req = mockRequest({}, {}, { authorization: 'Bearer valid_token', 'x-search': 'john' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.data).toHaveLength(1);
      expect(callArgs.data[0].email).toBe('john@test.com');
    });

    it('should require admin role', async () => {
      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users' && r.route.methods.get);
      
      const req = mockRequest({}, {}, { authorization: 'Bearer valid_listener', 'x-user-role': 'listener' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return user by id with profile', async () => {
      // Add profile
      db.run(`INSERT INTO user_profiles (userId) VALUES (?)`, [1]);

      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users/:id' && r.route.methods.get);
      
      const req = mockRequest({ id: 1 }, {}, { authorization: 'Bearer valid_token' });
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

    it('should return 404 for non-existent user', async () => {
      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users/:id' && r.route.methods.get);
      
      const req = mockRequest({ id: 9999 }, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create new user', async () => {
      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { email: 'new@test.com', password: 'password123', displayName: 'New User' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Usuario creado exitosamente' })
      );
    });

    it('should reject without email', async () => {
      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { password: 'password123', displayName: 'New User' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject without password', async () => {
      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { email: 'new@test.com', displayName: 'New User' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject without displayName', async () => {
      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { email: 'new@test.com', password: 'password123' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user successfully', async () => {
      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: 2 },
        { displayName: 'Updated Name', role: 'admin' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Usuario actualizado exitosamente' })
      );
    });

    it('should update user isActive status', async () => {
      db.run(
        `INSERT INTO users (email, displayName, role, isActive) VALUES (?, ?, ?, ?)`,
        ['test@test.com', 'Test', 'listener', 1]
      );

      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: 2 },
        { isActive: false },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user successfully', async () => {
      db.run(
        `INSERT INTO users (email, displayName, role, isActive) VALUES (?, ?, ?, ?)`,
        ['delete@test.com', 'Delete', 'listener', 1]
      );

      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users/:id' && r.route.methods.delete);
      
      const req = mockRequest({ id: 2 }, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Usuario eliminado exitosamente' })
      );
    });

    it('should not allow deleting main admin', async () => {
      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/users/:id' && r.route.methods.delete);
      
      const req = mockRequest({ id: 1 }, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('GET /api/admin/stats', () => {
    it('should return all statistics', async () => {
      // Add some data
      db.run(
        `INSERT INTO news (title, content, author_id, published, publishedAt) VALUES (?, ?, ?, ?, ?)`,
        ['News', 'Content', 1, 1, new Date().toISOString()]
      );
      db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Event', '2026-03-01', '2026-03-02', 1, 1]
      );
      db.run(
        `INSERT INTO products (name, price, published) VALUES (?, ?, ?)`,
        ['Product', 10.99, 1]
      );

      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/stats' && r.route.methods.get);
      
      const req = mockRequest({}, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            totalUsers: 1,
            totalNews: 1,
            totalEvents: 1,
            totalProducts: 1,
          }),
        })
      );
    });

    it('should require admin role', async () => {
      const router = createAdminRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/stats' && r.route.methods.get);
      
      const req = mockRequest({}, {}, { authorization: 'Bearer valid_listener', 'x-user-role': 'listener' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
