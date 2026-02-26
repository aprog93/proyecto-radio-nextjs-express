import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDatabase, MockDatabaseWrapper } from './mocks/database';
import { createNewsRouter } from '../dist/routes/news';
import { AuthService } from '../dist/services/auth';
import express, { type Request, type Response, type NextFunction } from 'express';

// Mock AuthService
vi.mock('../dist/services/auth.js', () => ({
  AuthService: class MockAuthService {
    constructor() {}
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

describe('News Routes', () => {
  let db: MockDatabaseWrapper;
  let app: express.Application;
  let authService: AuthService;

  // Helper to simulate request
  const mockRequest = (params: any = {}, body: any = {}, headers: any = {}) => {
    return {
      params,
      body,
      headers,
      userId: headers['x-user-id'] || 1,
      userRole: headers['x-user-role'] || 'admin',
      authService,
    } as unknown as Request;
  };

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
    app = express();
    app.use(express.json());
    app.use('/api/news', createNewsRouter(db));
  });

  describe('GET /api/news', () => {
    it('should return empty array when no news exist', async () => {
      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
          total: 0,
        })
      );
    });

    it('should return published news only', async () => {
      // Insert published news directly
      db.run(
        `INSERT INTO news (title, content, author_id, published, publishedAt) VALUES (?, ?, ?, ?, ?)`,
        ['Published News', 'Content here', 1, 1, new Date().toISOString()]
      );
      db.run(
        `INSERT INTO news (title, content, author_id, published) VALUES (?, ?, ?, ?)`,
        ['Draft News', 'Draft content', 1, 0]
      );

      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          total: 1,
        })
      );
    });
  });

  describe('POST /api/news', () => {
    it('should create news successfully', async () => {
      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        {
          title: 'Test News',
          content: 'This is test content',
          published: true,
        },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Noticia creada exitosamente',
        })
      );
    });

    it('should reject news without title', async () => {
      const router = createNewsRouter(db);
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

    it('should reject news without content', async () => {
      const router = createNewsRouter(db);
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

    it('should reject news exceeding 1500 characters', async () => {
      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const longContent = 'A'.repeat(1501);
      const req = mockRequest(
        {},
        { title: 'Test Title', content: longContent },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('1500 caracteres'),
        })
      );
    });

    it('should accept news with exactly 1500 characters', async () => {
      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const exactContent = 'A'.repeat(1500);
      const req = mockRequest(
        {},
        { title: 'Test Title', content: exactContent },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should reject expiration date more than 30 days in future', async () => {
      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 31);
      
      const req = mockRequest(
        {},
        {
          title: 'Test Title',
          content: 'Test content',
          expiresAt: futureDate.toISOString(),
        },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('30 días'),
        })
      );
    });

    it('should accept expiration date exactly 30 days in future', async () => {
      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const req = mockRequest(
        {},
        {
          title: 'Test Title',
          content: 'Test content',
          expiresAt: futureDate.toISOString(),
        },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should reject unauthenticated requests', async () => {
      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Test', content: 'Content' },
        {} // No authorization
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('GET /api/news/:id', () => {
    it('should return news by id', async () => {
      // Insert news
      const result = db.run(
        `INSERT INTO news (title, content, author_id, published, publishedAt) VALUES (?, ?, ?, ?, ?)`,
        ['Test News', 'Content', 1, 1, new Date().toISOString()]
      );

      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.get);
      
      const req = mockRequest({ id: result.lastID });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            title: 'Test News',
          }),
        })
      );
    });

    it('should return 404 for non-existent news', async () => {
      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.get);
      
      const req = mockRequest({ id: 9999 });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should not return unpublished news', async () => {
      const result = db.run(
        `INSERT INTO news (title, content, author_id, published) VALUES (?, ?, ?, ?)`,
        ['Draft', 'Content', 1, 0]
      );

      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.get);
      
      const req = mockRequest({ id: result.lastID });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('PUT /api/news/:id', () => {
    it('should update news successfully', async () => {
      const insertResult = db.run(
        `INSERT INTO news (title, content, author_id, published, publishedAt) VALUES (?, ?, ?, ?, ?)`,
        ['Original Title', 'Original Content', 1, 1, new Date().toISOString()]
      );

      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: insertResult.lastID },
        { title: 'Updated Title' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Noticia actualizada exitosamente',
        })
      );
    });

    it('should reject content exceeding 1500 characters', async () => {
      const insertResult = db.run(
        `INSERT INTO news (title, content, author_id, published, publishedAt) VALUES (?, ?, ?, ?, ?)`,
        ['Test', 'Short', 1, 1, new Date().toISOString()]
      );

      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.put);
      
      const longContent = 'A'.repeat(1501);
      const req = mockRequest(
        { id: insertResult.lastID },
        { content: longContent },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('DELETE /api/news/:id', () => {
    it('should delete news successfully', async () => {
      const insertResult = db.run(
        `INSERT INTO news (title, content, author_id, published, publishedAt) VALUES (?, ?, ?, ?, ?)`,
        ['To Delete', 'Content', 1, 1, new Date().toISOString()]
      );

      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.delete);
      
      const req = mockRequest(
        { id: insertResult.lastID },
        {},
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Noticia eliminada exitosamente',
        })
      );
    });

    it('should return 404 for non-existent news', async () => {
      const router = createNewsRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.delete);
      
      const req = mockRequest(
        { id: 9999 },
        {},
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
