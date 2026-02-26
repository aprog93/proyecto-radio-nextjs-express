import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDatabase, MockDatabaseWrapper } from './mocks/database';
import { createProductRouter } from '../dist/routes/products.js';
import { AuthService } from '../dist/services/auth.js';
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

describe('Products Routes', () => {
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

  describe('GET /api/products', () => {
    it('should return empty array when no products exist', async () => {
      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: [], total: 0 })
      );
    });

    it('should return only published products', async () => {
      db.run(
        `INSERT INTO products (name, price, published) VALUES (?, ?, ?)`,
        ['Published Product', 10.99, 1]
      );
      db.run(
        `INSERT INTO products (name, price, published) VALUES (?, ?, ?)`,
        ['Draft Product', 9.99, 0]
      );

      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.total).toBe(1);
    });

    it('should filter by category', async () => {
      db.run(
        `INSERT INTO products (name, category, published) VALUES (?, ?, ?)`,
        ['Merch', 'merchandise', 1]
      );
      db.run(
        `INSERT INTO products (name, category, published) VALUES (?, ?, ?)`,
        ['Album', 'music', 1]
      );

      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest({}, {}, { 'x-category': 'merchandise' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.data).toHaveLength(1);
      expect(callArgs.data[0].category).toBe('merchandise');
    });
  });

  describe('POST /api/products', () => {
    it('should create product successfully', async () => {
      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { name: 'Test Product', price: 29.99, published: true },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Producto creado exitosamente' })
      );
    });

    it('should reject product without name', async () => {
      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { price: 29.99 },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject product without price', async () => {
      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { name: 'Test Product' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject negative price', async () => {
      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { name: 'Test Product', price: -10 },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'El precio no puede ser negativo' })
      );
    });

    it('should require admin role', async () => {
      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { name: 'Test', price: 10 },
        { authorization: 'Bearer valid_listener', 'x-user-role': 'listener' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product by id', async () => {
      const result = db.run(
        `INSERT INTO products (name, price, published) VALUES (?, ?, ?)`,
        ['Test Product', 19.99, 1]
      );

      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.get);
      
      const req = mockRequest({ id: result.lastID });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: expect.objectContaining({ name: 'Test Product' }) })
      );
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product successfully', async () => {
      const result = db.run(
        `INSERT INTO products (name, price, published) VALUES (?, ?, ?)`,
        ['Original', 10, 1]
      );

      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: result.lastID },
        { name: 'Updated' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Producto actualizado exitosamente' })
      );
    });

    it('should reject negative price update', async () => {
      const result = db.run(
        `INSERT INTO products (name, price, published) VALUES (?, ?, ?)`,
        ['Test', 10, 1]
      );

      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: result.lastID },
        { price: -5 },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product successfully', async () => {
      const result = db.run(
        `INSERT INTO products (name, price, published) VALUES (?, ?, ?)`,
        ['To Delete', 10, 1]
      );

      const router = createProductRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.delete);
      
      const req = mockRequest({ id: result.lastID }, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Producto eliminado exitosamente' })
      );
    });
  });
});
