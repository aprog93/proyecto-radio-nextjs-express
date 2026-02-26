/**
 * Token service tests
 */

import { describe, it, expect } from 'vitest';
import { TokenService } from '@/services/token';

describe('TokenService', () => {
  it('should generate and verify token', () => {
    const payload = { userId: 'user-123', email: 'test@example.com' };
    const token = TokenService.generateToken(payload);

    expect(token).toBeTruthy();

    const verified = TokenService.verifyToken(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.email).toBe(payload.email);
  });

  it('should throw on invalid token', () => {
    expect(() => TokenService.verifyToken('invalid-token')).toThrow();
  });

  it('should extract token from header', () => {
    const header = 'Bearer token123';
    const token = TokenService.extractFromHeader(header);
    expect(token).toBe('token123');
  });

  it('should return null for missing header', () => {
    const token = TokenService.extractFromHeader(undefined);
    expect(token).toBeNull();
  });

  it('should return null for invalid header format', () => {
    const token = TokenService.extractFromHeader('InvalidFormat');
    expect(token).toBeNull();
  });
});
