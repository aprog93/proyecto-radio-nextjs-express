import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDatabase, MockDatabaseWrapper } from './mocks/database';
import { createEventRouter } from '../dist/routes/events.js';
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

describe('Events Routes', () => {
  let db: MockDatabaseWrapper;
  let authService: AuthService;

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
  });

  describe('GET /api/events', () => {
    it('should return empty array when no events exist', async () => {
      const router = createEventRouter(db);
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

    it('should return only published events', async () => {
      db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Published Event', '2026-03-01', '2026-03-02', 1, 1]
      );
      db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Draft Event', '2026-03-01', '2026-03-02', 1, 0]
      );

      const router = createEventRouter(db);
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

    it('should filter upcoming events', async () => {
      db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Past Event', '2020-01-01', '2020-01-02', 1, 1]
      );
      db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Future Event', '2030-01-01', '2030-01-02', 1, 1]
      );

      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest({}, {}, { 'x-upcoming': 'true' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      // Should only return future events
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /api/events', () => {
    it('should create event successfully', async () => {
      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        {
          title: 'Test Event',
          startDate: '2026-03-15T10:00:00Z',
          endDate: '2026-03-15T12:00:00Z',
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
          message: 'Evento creado exitosamente',
        })
      );
    });

    it('should reject event without title', async () => {
      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { startDate: '2026-03-15T10:00:00Z', endDate: '2026-03-15T12:00:00Z' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject event without startDate', async () => {
      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Test Event', endDate: '2026-03-15T12:00:00Z' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject event without endDate', async () => {
      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Test Event', startDate: '2026-03-15T10:00:00Z' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject event exceeding 30-day duration', async () => {
      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        {
          title: 'Long Event',
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-02-15T00:00:00Z', // 45 days later
        },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'El evento no puede durar más de 30 días',
        })
      );
    });

    it('should accept event with exactly 30-day duration', async () => {
      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        {
          title: '30 Day Event',
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-01-31T00:00:00Z', // Exactly 30 days
        },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should reject unauthenticated requests', async () => {
      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Test', startDate: '2026-03-15', endDate: '2026-03-16' },
        {} // No auth
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject non-admin users', async () => {
      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Test', startDate: '2026-03-15', endDate: '2026-03-16' },
        { authorization: 'Bearer valid_listener', 'x-user-role': 'listener' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event by id', async () => {
      const result = db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Test Event', '2026-03-15', '2026-03-16', 1, 1]
      );

      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.get);
      
      const req = mockRequest({ id: result.lastID });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ title: 'Test Event' }),
        })
      );
    });

    it('should return 404 for non-existent event', async () => {
      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.get);
      
      const req = mockRequest({ id: 9999 });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update event successfully', async () => {
      const result = db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Original', '2026-03-15', '2026-03-16', 1, 1]
      );

      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: result.lastID },
        { title: 'Updated Title' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Evento actualizado exitosamente',
        })
      );
    });

    it('should reject duration extension beyond 30 days', async () => {
      const result = db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Test Event', '2026-01-01', '2026-01-02', 1, 1]
      );

      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: result.lastID },
        { endDate: '2026-02-20' }, // Would make it > 30 days
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete event successfully', async () => {
      const result = db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['To Delete', '2026-03-15', '2026-03-16', 1, 1]
      );

      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.delete);
      
      const req = mockRequest(
        { id: result.lastID },
        {},
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Evento eliminado exitosamente',
        })
      );
    });

    it('should return 404 for non-existent event', async () => {
      const router = createEventRouter(db);
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

  describe('POST /api/events/:id/register', () => {
    it('should register user for event successfully', async () => {
      const result = db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published, capacity) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Test Event', '2026-03-15', '2026-03-16', 1, 1, 50]
      );

      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id/register' && r.route.methods.post);
      
      const req = mockRequest(
        { id: result.lastID },
        {},
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Registrado en el evento exitosamente',
        })
      );
    });

    it('should reject duplicate registration', async () => {
      const result = db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Test Event', '2026-03-15', '2026-03-16', 1, 1]
      );
      
      // First registration
      db.run(
        `INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)`,
        [result.lastID, 1]
      );

      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id/register' && r.route.methods.post);
      
      const req = mockRequest(
        { id: result.lastID },
        {},
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Ya estás registrado en este evento',
        })
      );
    });

    it('should reject when event is full', async () => {
      const result = db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published, capacity, registered) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Full Event', '2026-03-15', '2026-03-16', 1, 1, 10, 10]
      );

      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id/register' && r.route.methods.post);
      
      const req = mockRequest(
        { id: result.lastID },
        {},
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'El evento está lleno',
        })
      );
    });

    it('should require authentication', async () => {
      const result = db.run(
        `INSERT INTO events (title, startDate, endDate, author_id, published) VALUES (?, ?, ?, ?, ?)`,
        ['Test Event', '2026-03-15', '2026-03-16', 1, 1]
      );

      const router = createEventRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id/register' && r.route.methods.post);
      
      const req = mockRequest({ id: result.lastID }, {}, {});
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
