/**
 * Admin Dashboard E2E Tests
 * Tests admin functionality: user CRUD, statistics, permissions
 */

import { test, expect } from '@playwright/test';
import {
  TEST_USERS,
  loginUser,
  createUser,
  deleteUser,
  API_ENDPOINTS,
  assertAdminAccess,
  navigateTo,
  waitForPageLoad,
} from './fixtures';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
  });

  test('should display admin dashboard for admin user', async ({ page }) => {
    await assertAdminAccess(page);
    // Check for dashboard elements
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });

  test('should display user statistics', async ({ page }) => {
    await navigateTo(page, '/admin/dashboard');
    await waitForPageLoad(page, 'text=Total Users');

    // Check for stat cards
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Users')).toBeVisible();
    await expect(page.locator('text=Total Content')).toBeVisible();
  });

  test('should list users in table', async ({ page }) => {
    await navigateTo(page, '/admin/dashboard');
    await waitForPageLoad(page, 'text=Users');

    // Check for table headers
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Role')).toBeVisible();
  });

  test('should create new user', async ({ page }) => {
    const newUserEmail = `admin-create-${Date.now()}@test.com`;
    const newUserPassword = 'NewAdminUser@123';
    const newUserName = 'Created Admin User';

    const response = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: newUserEmail,
        password: newUserPassword,
        displayName: newUserName,
        role: 'listener',
      },
    });

    expect(response.ok()).toBeTruthy();
    const user = (await response.json()) as { id: number };
    expect(user.id).toBeTruthy();

    // Cleanup
    await deleteUser(page, user.id);
  });

  test('should update user role', async ({ page }) => {
    // Create a test user first
    const testEmail = `role-update-${Date.now()}@test.com`;
    const createResp = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: testEmail,
        password: 'Password@123',
        displayName: 'Role Test User',
        role: 'listener',
      },
    });

    const user = (await createResp.json()) as { id: number };

    // Update role to admin
    const updateResp = await page.request.patch(API_ENDPOINTS.users.update(user.id), {
      data: { role: 'admin' },
    });

    expect(updateResp.ok()).toBeTruthy();

    // Verify role was updated
    const getResp = await page.request.get(API_ENDPOINTS.users.get(user.id));
    const updatedUser = (await getResp.json()) as { role: string };
    expect(updatedUser.role).toBe('admin');

    // Cleanup
    await deleteUser(page, user.id);
  });

  test('should deactivate user', async ({ page }) => {
    // Create a test user
    const testEmail = `deactivate-${Date.now()}@test.com`;
    const createResp = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: testEmail,
        password: 'Password@123',
        displayName: 'Deactivate Test User',
        role: 'listener',
      },
    });

    const user = (await createResp.json()) as { id: number };

    // Deactivate user
    const updateResp = await page.request.patch(API_ENDPOINTS.users.update(user.id), {
      data: { isActive: false },
    });

    expect(updateResp.ok()).toBeTruthy();

    // Verify user is deactivated
    const getResp = await page.request.get(API_ENDPOINTS.users.get(user.id));
    const updatedUser = (await getResp.json()) as { isActive: boolean };
    expect(updatedUser.isActive).toBeFalsy();

    // Cleanup
    await deleteUser(page, user.id);
  });

  test('should delete user', async ({ page }) => {
    // Create a test user
    const testEmail = `delete-${Date.now()}@test.com`;
    const createResp = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: testEmail,
        password: 'Password@123',
        displayName: 'Delete Test User',
        role: 'listener',
      },
    });

    const user = (await createResp.json()) as { id: number };

    // Delete user
    const deleteResp = await page.request.delete(API_ENDPOINTS.users.delete(user.id));
    expect(deleteResp.ok()).toBeTruthy();

    // Verify user is deleted
    const getResp = await page.request.get(API_ENDPOINTS.users.get(user.id));
    expect(getResp.status()).toBe(404);
  });

  test('should paginate users', async ({ page }) => {
    await navigateTo(page, '/admin/dashboard');
    await waitForPageLoad(page, 'text=Users');

    // Check for pagination buttons
    const nextButton = page.locator('button:has-text("Next")');
    const prevButton = page.locator('button:has-text("Previous")');

    // May or may not be visible depending on user count
    // But if visible, they should be functional
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should search users', async ({ page }) => {
    await navigateTo(page, '/admin/dashboard');
    await waitForPageLoad(page, 'text=Search');

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(TEST_USERS.admin.email);
      await page.waitForLoadState('networkidle');

      // Verify search results contain admin user
      await expect(page.locator(`text=${TEST_USERS.admin.email}`)).toBeVisible();
    }
  });

  test('should not allow listener to access admin dashboard', async ({ page }) => {
    // Logout admin
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Login as listener
    await loginUser(page, TEST_USERS.listener.email, TEST_USERS.listener.password);

    // Try to navigate to admin
    await navigateTo(page, '/admin/dashboard');

    // Should be redirected or see 403
    const isRedirected = !page.url().includes('/admin');
    const has403 = page.locator('text=403').isVisible();

    expect(isRedirected || (await has403)).toBeTruthy();
  });
});
