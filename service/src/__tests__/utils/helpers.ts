import { vi } from 'vitest';

/**
 * General test utilities for backend tests
 */

/**
 * Create a mock Express request object
 */
export function createMockRequest(overrides: any = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    url: '/',
    user: null,
    ...overrides,
  };
}

/**
 * Create a mock Express response object
 */
export function createMockResponse() {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    getHeader: vi.fn(),
    end: vi.fn(),
    statusCode: 200,
    statusMessage: 'OK',
  };
  return res;
}

/**
 * Create a mock Express next function
 */
export function createMockNext() {
  return vi.fn();
}

/**
 * Create a mock middleware context (req, res, next)
 */
export function createMockMiddlewareContext(
  req: any = {},
  res: any = {},
  next: any = null
) {
  return {
    req: { ...createMockRequest(req) },
    res: createMockResponse(),
    next: next || createMockNext(),
  };
}

/**
 * Wait for a promise with timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error('Timeout waiting for condition');
}

/**
 * Create a delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Assert that a function throws an error
 */
export async function expectToThrow(
  fn: () => Promise<any> | any,
  errorMessage?: string
): Promise<Error> {
  try {
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
    throw new Error('Expected function to throw but it did not');
  } catch (error) {
    if (errorMessage && !String(error).includes(errorMessage)) {
      throw new Error(
        `Expected error message to include "${errorMessage}" but got "${error}"`
      );
    }
    return error as Error;
  }
}

/**
 * Assert that a function does not throw an error
 */
export async function expectNotToThrow(fn: () => Promise<any> | any): Promise<any> {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return await result;
    }
    return result;
  } catch (error) {
    throw new Error(`Expected function not to throw but got: ${error}`);
  }
}

/**
 * Create a mock environment for tests
 */
export function createMockEnv(overrides: Record<string, string> = {}) {
  const originalEnv = { ...process.env };
  const mockEnv = {
    ...originalEnv,
    JWT_SECRET: 'test-jwt-secret',
    AZURACAST_BASE_URL: 'http://azuracast.local/api',
    AZURACAST_STATION_ID: '1',
    ...overrides,
  };

  // Set the environment variables
  Object.entries(mockEnv).forEach(([key, value]) => {
    process.env[key] = value;
  });

  return {
    env: mockEnv,
    restore: () => {
      Object.keys(process.env).forEach(key => {
        delete process.env[key];
      });
      Object.entries(originalEnv).forEach(([key, value]) => {
        process.env[key] = value;
      });
    },
  };
}

/**
 * Create a mock logger
 */
export function createMockLogger() {
  return {
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

/**
 * Compare objects while ignoring specific fields
 */
export function compareObjects(
  obj1: any,
  obj2: any,
  ignoreFields: string[] = []
): boolean {
  const o1 = { ...obj1 };
  const o2 = { ...obj2 };

  ignoreFields.forEach(field => {
    delete o1[field];
    delete o2[field];
  });

  return JSON.stringify(o1) === JSON.stringify(o2);
}

/**
 * Spy on console methods
 */
export function spyOnConsole() {
  const consoleSpy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  };

  return {
    ...consoleSpy,
    restore: () => {
      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    },
  };
}
