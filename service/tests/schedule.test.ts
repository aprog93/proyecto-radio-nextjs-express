import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDatabase, MockDatabaseWrapper } from './mocks/database';
import { createScheduleRouter } from '../dist/routes/schedule.js';
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

describe('Schedule Routes', () => {
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

  describe('GET /api/schedule', () => {
    it('should return empty array when no schedule exists', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: [] })
      );
    });

    it('should return all schedule items sorted by day and time', async () => {
      db.run(
        `INSERT INTO schedule (title, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
        ['Evening Show', 3, '18:00', '22:00']
      );
      db.run(
        `INSERT INTO schedule (title, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
        ['Morning Show', 1, '06:00', '10:00']
      );

      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.get);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.data).toHaveLength(2);
      // First should be Monday (dayOfWeek 1)
      expect(callArgs.data[0].dayOfWeek).toBe(1);
    });
  });

  describe('GET /api/schedule/day/:dayOfWeek', () => {
    it('should return schedule for specific day', async () => {
      db.run(
        `INSERT INTO schedule (title, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
        ['Monday Show', 1, '08:00', '12:00']
      );
      db.run(
        `INSERT INTO schedule (title, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
        ['Tuesday Show', 2, '08:00', '12:00']
      );

      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/day/:dayOfWeek' && r.route.methods.get);
      
      const req = mockRequest({ dayOfWeek: 1 });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.data).toHaveLength(1);
      expect(callArgs.data[0].dayOfWeek).toBe(1);
    });

    it('should return 400 for invalid day', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/day/:dayOfWeek' && r.route.methods.get);
      
      const req = mockRequest({ dayOfWeek: 7 }); // Invalid (should be 0-6)
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('POST /api/schedule', () => {
    it('should create schedule successfully', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        {
          title: 'New Show',
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '12:00',
        },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Programación creada exitosamente' })
      );
    });

    it('should reject without title', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { dayOfWeek: 1, startTime: '08:00', endTime: '12:00' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject without dayOfWeek', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Show', startTime: '08:00', endTime: '12:00' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject invalid dayOfWeek', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Show', dayOfWeek: 10, startTime: '08:00', endTime: '12:00' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject without startTime', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Show', dayOfWeek: 1, endTime: '12:00' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject without endTime', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Show', dayOfWeek: 1, startTime: '08:00' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should require admin role', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/' && r.route.methods.post);
      
      const req = mockRequest(
        {},
        { title: 'Show', dayOfWeek: 1, startTime: '08:00', endTime: '12:00' },
        { authorization: 'Bearer valid_listener', 'x-user-role': 'listener' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('PUT /api/schedule/:id', () => {
    it('should update schedule successfully', async () => {
      const result = db.run(
        `INSERT INTO schedule (title, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
        ['Original', 1, '08:00', '12:00']
      );

      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: result.lastID },
        { title: 'Updated' },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Programación actualizada exitosamente' })
      );
    });

    it('should reject invalid dayOfWeek update', async () => {
      const result = db.run(
        `INSERT INTO schedule (title, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
        ['Test', 1, '08:00', '12:00']
      );

      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.put);
      
      const req = mockRequest(
        { id: result.lastID },
        { dayOfWeek: 15 },
        { authorization: 'Bearer valid_token' }
      );
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('DELETE /api/schedule/:id', () => {
    it('should delete schedule successfully', async () => {
      const result = db.run(
        `INSERT INTO schedule (title, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
        ['To Delete', 1, '08:00', '12:00']
      );

      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.delete);
      
      const req = mockRequest({ id: result.lastID }, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Programación eliminada exitosamente' })
      );
    });

    it('should return 404 for non-existent schedule', async () => {
      const router = createScheduleRouter(db);
      const route = router.stack.find((r: any) => r.route && r.route.path === '/:id' && r.route.methods.delete);
      
      const req = mockRequest({ id: 9999 }, {}, { authorization: 'Bearer valid_token' });
      const res = mockResponse();
      
      await route.route.stack[0].handle(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
