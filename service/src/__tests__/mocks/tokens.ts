import jwt from 'jsonwebtoken';
import { UserRole } from '@/types/database.js';

/**
 * Mock JWT tokens for testing
 */

const TEST_JWT_SECRET = 'test-secret-key-for-testing-only';

/**
 * Create a valid JWT token for testing
 */
export function createValidToken(payload: {
  id: number;
  email: string;
  role: UserRole;
}): string {
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Create an expired JWT token for testing
 */
export function createExpiredToken(payload: {
  id: number;
  email: string;
  role: UserRole;
}): string {
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '-1h' });
}

/**
 * Create an invalid JWT token for testing
 */
export function createInvalidToken(): string {
  return 'invalid.token.string';
}

/**
 * Create a malformed JWT token for testing
 */
export function createMalformedToken(): string {
  return 'not.a.proper.jwt.token.at.all';
}

/**
 * Mock tokens for common test scenarios
 */

export const adminToken = createValidToken({
  id: 1,
  email: 'admin@radiocesar.local',
  role: 'admin',
});

export const listenerToken = createValidToken({
  id: 2,
  email: 'listener@example.com',
  role: 'listener',
});

export const expiredAdminToken = createExpiredToken({
  id: 1,
  email: 'admin@radiocesar.local',
  role: 'admin',
});

export const invalidToken = createInvalidToken();

export const malformedToken = createMalformedToken();

/**
 * Extract payload from token (without verification)
 */
export function extractTokenPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Verify token with test secret
 */
export function verifyTestToken(token: string): any {
  try {
    return jwt.verify(token, TEST_JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Create Authorization header value
 */
export function createAuthHeader(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Mock tokens object for easy access in tests
 */
export const mockTokens = {
  admin: {
    token: adminToken,
    header: createAuthHeader(adminToken),
    payload: extractTokenPayload(adminToken),
  },
  listener: {
    token: listenerToken,
    header: createAuthHeader(listenerToken),
    payload: extractTokenPayload(listenerToken),
  },
  expired: {
    token: expiredAdminToken,
    header: createAuthHeader(expiredAdminToken),
    payload: extractTokenPayload(expiredAdminToken),
  },
  invalid: {
    token: invalidToken,
    header: createAuthHeader(invalidToken),
    payload: null,
  },
  malformed: {
    token: malformedToken,
    header: createAuthHeader(malformedToken),
    payload: null,
  },
};
