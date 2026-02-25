import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDatabase, MockDatabaseWrapper } from './mocks/database';
import { createBlogRouter } from '../dist/routes/blogs.js';
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
  },
}));

describe('Blog Routes', () => {
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

  describe('GET /api/blogs', () => {
    it('should return empty array when no blogs exist', async () => {
      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: [], total: 0 })
      );
    });

    it('should return published blogs only', async () => {
      db.run(
        `INSERT INTO blogs (title, content, author_id, published) VALUES (?, ?, ?, ?)`,
        ['Published Blog', 'Content here', 1, 1]
      );
      db.run(
        `INSERT INTO blogs (title, content, author_id, published) VALUES (?, ?, ?, ?)`,
        ['Draft Blog', 'Draft content', 1, 0]
      );

      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.total).toBe(1);
    });
  });

  describe('POST /api/blogs', () => {
    it('should create blog successfully', async () => {
      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Test Blog', content: 'Test content', published: true },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Blog creado exitosamente' })
      );
    });

    it('should reject blog without title', async () => {
      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { content: 'Some content' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject blog without content', async () => {
      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Test Title' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should require admin role', async () => {
      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Test', content: 'Content' },
        { authorization: 'Bearer valid_listener', 'x-user-role': 'listener' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('GET /api/blogs/:id', () => {
    it('should return blog by id', async () => {
      const result = db.run(
        `INSERT INTO blogs (title, content, author_id, published) VALUES (?, ?, ?, ?)`,
        ['Test Blog', 'Content', 1, 1]
      );

      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.get);
      
      const req = mockRequest({ id: result.lastID });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: expect.objectContaining({ title: 'Test Blog' }) })
      );
    });
  });

  describe('PUT /api/blogs/:id', () => {
    it('should update blog successfully', async () => {
      const result = db.run(
        `INSERT INTO blogs (title, content, author_id, published) VALUES (?, ?, ?, ?)`,
        ['Original', 'Content', 1, 1]
      );

      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: result.lastID },
        { title: 'Updated' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Blog actualizado exitosamente' })
      );
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    it('should delete blog successfully', async () => {
      const result = db.run(
        `INSERT INTO blogs (title, content, author_id, published) VALUES (?, ?, ?, ?)`,
        ['To Delete', 'Content', 1, 1]
      );

      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.delete);
      
      const req = mockRequest({ id: result.lastID }, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Blog eliminado exitosamente' })
      );
    });
  });

  describe('POST /api/blogs/:id/publish', () => {
    it('should publish blog successfully', async () => {
      const result = db.run(
        `INSERT INTO blogs (title, content, author_id, published) VALUES (?, ?, ?, ?)`,
        ['Draft', 'Content', 1, 0]
      );

      const router = createBlogRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id/publish' && r.route.methods.post);
      
      const req = mockRequest({ id: result.lastID }, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Blog publicado exitosamente' })
      );
    });
  });
});
