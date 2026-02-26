/**
 * Authentication E2E Tests
 * Tests login, register, logout, and session management flows
 */

import { test, expect } from '@playwright/test';
import {
  TEST_USERS,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  assertLoggedIn,
  assertLoggedOut,
  API_ENDPOINTS,
} from './fixtures';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    const token = await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    expect(token).toBeTruthy();
    await assertLoggedIn(page);
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    const response = await page.request.post(API_ENDPOINTS.auth.login, {
      data: {
        email: TEST_USERS.admin.email,
        password: 'WrongPassword123!',
      },
    });
    expect(response.status()).toBe(401);
  });

  test('should fail login with non-existent user', async ({ page }) => {
    const response = await page.request.post(API_ENDPOINTS.auth.login, {
      data: {
        email: 'nonexistent@test.com',
        password: 'Password123!',
      },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should register new user', async ({ page }) => {
    const newUser = TEST_USERS.newUser;
    const result = await registerUser(
      page,
      newUser.email,
      newUser.password,
      newUser.displayName
    );

    expect(result.success).toBeTruthy();
    expect(result.token).toBeTruthy();

    // Verify can login with new credentials
    const loginToken = await loginUser(page, newUser.email, newUser.password);
    expect(loginToken).toBeTruthy();
  });

  test('should fail register with duplicate email', async ({ page }) => {
    const result = await registerUser(
      page,
      TEST_USERS.admin.email,
      'Password123!',
      'Duplicate User'
    );
    expect(result.success).toBeFalsy();
  });

  test('should fail register with weak password', async ({ page }) => {
    const response = await page.request.post(API_ENDPOINTS.auth.register, {
      data: {
        email: `weakpass-${Date.now()}@test.com`,
        password: '123', // Too weak
        displayName: 'Weak Password User',
      },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should logout user', async ({ page }) => {
    // First login
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await assertLoggedIn(page);

    // Then logout
    const success = await logoutUser(page);
    expect(success).toBeTruthy();
    await assertLoggedOut(page);
  });

  test('should get current user info when logged in', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    const user = await getCurrentUser(page);
    expect(user).toBeTruthy();
    expect(user.email).toBe(TEST_USERS.admin.email);
    expect(user.role).toBe(TEST_USERS.admin.role);
  });

  test('should not get user info when logged out', async ({ page }) => {
    const user = await getCurrentUser(page);
    expect(user).toBeNull();
  });

  test('should maintain session after page reload', async ({ page }) => {
    // Login
    const token = await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    expect(token).toBeTruthy();

    // Reload page
    await page.reload();

    // Token should still exist
    const storedToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(storedToken).toBe(token);

    // Should still be able to get user info
    const user = await getCurrentUser(page);
    expect(user).toBeTruthy();
  });
});
