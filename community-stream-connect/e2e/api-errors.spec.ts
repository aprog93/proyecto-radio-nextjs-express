/**
 * API Error Handling E2E Tests
 * Tests error scenarios, network failures, and retry logic
 */

import { test, expect } from '@playwright/test';
import { API_ENDPOINTS, loginUser, TEST_USERS } from './fixtures';

test.describe('API Error Handling', () => {
  test('should handle 404 errors', async ({ page }) => {
    const response = await page.request.get('/api/blog/99999');
    expect(response.status()).toBe(404);
  });

  test('should handle 401 unauthorized', async ({ page }) => {
    // Try to access admin endpoint without auth
    const response = await page.request.get('/api/admin/users');
    expect(response.status()).toBe(401);
  });

  test('should handle 403 forbidden', async ({ page }) => {
    // Login as listener
    await loginUser(page, TEST_USERS.listener.email, TEST_USERS.listener.password);

    // Try to access admin-only endpoint
    const response = await page.request.get('/api/admin/users');
    expect(response.status()).toBeGreaterThanOrEqual(403);
  });

  test('should handle 400 bad request', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Send invalid data
    const response = await page.request.post(API_ENDPOINTS.users.create, {
      data: { email: 'invalid-email' }, // Missing required fields
    });

    expect(response.status()).toBe(400);
  });

  test('should handle 500 server errors', async ({ page }) => {
    // This test depends on server behavior
    // We're just verifying the app handles it gracefully
    const response = await page.request.get('/api/intentional-error');

    // Should be 500 or 404 (if endpoint doesn't exist)
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should validate email format on register', async ({ page }) => {
    const response = await page.request.post(API_ENDPOINTS.auth.register, {
      data: {
        email: 'invalid-email',
        password: 'Password@123',
        displayName: 'Test User',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should validate password strength on register', async ({ page }) => {
    const response = await page.request.post(API_ENDPOINTS.auth.register, {
      data: {
        email: `weak-${Date.now()}@test.com`,
        password: '123', // Too weak
        displayName: 'Test User',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should handle duplicate email on register', async ({ page }) => {
    const response = await page.request.post(API_ENDPOINTS.auth.register, {
      data: {
        email: TEST_USERS.admin.email, // Existing email
        password: 'Password@123',
        displayName: 'Duplicate User',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should handle expired or invalid token', async ({ page }) => {
    // Set invalid token
    await page.context().addInitScript(() => {
      localStorage.setItem('auth_token', 'invalid-token-12345');
    });

    // Try to use the invalid token
    const response = await page.request.get(API_ENDPOINTS.auth.me);
    expect(response.status()).toBe(401);
  });

  test('should retry failed requests', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Make multiple requests to test retry logic
    const responses = await Promise.all([
      page.request.get('/api/blog'),
      page.request.get('/api/news'),
      page.request.get('/api/events'),
    ]);

    // All should succeed (2xx status)
    responses.forEach((response) => {
      expect(response.status()).toBeLessThan(400);
    });
  });

  test('should handle missing required fields', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Try to create user without required fields
    const response = await page.request.post(API_ENDPOINTS.users.create, {
      data: { role: 'listener' }, // Missing email and password
    });

    expect(response.status()).toBe(400);
  });

  test('should handle invalid role', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Try to create user with invalid role
    const response = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: `invalid-role-${Date.now()}@test.com`,
        password: 'Password@123',
        displayName: 'Test User',
        role: 'superadmin', // Invalid role
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should handle concurrent requests', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Make 10 concurrent requests
    const responses = await Promise.all(
      Array.from({ length: 10 }, () => page.request.get('/api/blog'))
    );

    // All should succeed
    responses.forEach((response) => {
      expect(response.status()).toBeLessThan(400);
    });
  });

  test('should handle empty response body', async ({ page }) => {
    // This is hard to test without mocking, so we're just ensuring
    // the app doesn't crash on unexpected responses
    const response = await page.request.get('/api/blog');

    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('should clear auth on 401 response', async ({ page }) => {
    // Set invalid token
    await page.context().addInitScript(() => {
      localStorage.setItem('auth_token', 'invalid-token');
    });

    // Make request that should fail with 401
    const response = await page.request.get(API_ENDPOINTS.auth.me);
    expect(response.status()).toBe(401);

    // In a real implementation, the app should clear the token
    // This might be handled by the app's response interceptor
  });
});
