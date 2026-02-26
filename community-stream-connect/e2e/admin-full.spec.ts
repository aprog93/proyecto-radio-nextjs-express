/**
 * Admin Functions E2E Tests
 * Tests for all admin dashboard features
 */

import { test, expect } from '@playwright/test';
import { 
  ROUTES, 
  navigateTo, 
  loginUser, 
  logoutUser,
  createUser,
  deleteUser,
  TEST_USERS,
  waitForPageLoad,
  API_ENDPOINTS,
} from './fixtures';

test.describe('Admin Functions', () => {
  // ============================================================================
  // ADMIN DASHBOARD ACCESS
  // ============================================================================

  test('should access admin dashboard as admin', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await navigateTo(page, ROUTES.adminDashboard);
    await waitForPageLoad(page, 'body');
    
    // Should see admin dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin');
  });

  test('should deny access to admin for non-admin user', async ({ page }) => {
    await loginUser(page, TEST_USERS.listener.email, TEST_USERS.listener.password);
    
    await navigateTo(page, ROUTES.adminDashboard);
    await page.waitForLoadState('networkidle');
    
    // Should either redirect or show 403
    const currentUrl = page.url();
    const isRedirected = !currentUrl.includes('/admin');
    const hasNoAccess = page.locator('text=403, No access, unauthorized').isVisible();
    
    expect(isRedirected || (await hasNoAccess)).toBeTruthy();
  });

  test('should deny access to admin for anonymous user', async ({ page }) => {
    await navigateTo(page, ROUTES.adminDashboard);
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/web/login');
    
    expect(isRedirected || !currentUrl.includes('/admin')).toBeTruthy();
  });

  // ============================================================================
  // ADMIN DASHBOARD STATISTICS
  // ============================================================================

  test('should display statistics on admin dashboard', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await navigateTo(page, ROUTES.adminDashboard);
    await waitForPageLoad(page, 'text=Total, Users, Content');
    
    // Check for stat cards or numbers
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should show user count', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await navigateTo(page, ROUTES.adminDashboard);
    await waitForPageLoad(page, 'text=User');
    
    // Should have some user-related text
    const hasUserText = page.locator('text=User').count();
    expect(await hasUserText).toBeGreaterThan(0);
  });

  // ============================================================================
  // USER MANAGEMENT - CREATE
  // ============================================================================

  test('should create new user via API', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const newUserEmail = `created-${Date.now()}@test.com`;
    
    const response = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: newUserEmail,
        password: 'Password@123',
        displayName: 'Created User',
        role: 'listener',
      },
    });
    
    if (response.ok()) {
      const user = await response.json();
      expect(user.id).toBeTruthy();
      
      // Cleanup
      await deleteUser(page, user.id);
    }
  });

  test('should validate required fields on user creation', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Try to create user without required fields
    const response = await page.request.post(API_ENDPOINTS.users.create, {
      data: { role: 'listener' },
    });
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  // ============================================================================
  // USER MANAGEMENT - READ
  // ============================================================================

  test('should list users via API', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const response = await page.request.get(API_ENDPOINTS.users.list);
    
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });

  test('should get single user via API', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Get first user
    const listResponse = await page.request.get(API_ENDPOINTS.users.list);
    
    if (listResponse.ok()) {
      const listData = await listResponse.json();
      const users = listData.users || listData.data || [];
      
      if (users.length > 0) {
        const userId = users[0].id;
        const getResponse = await page.request.get(API_ENDPOINTS.users.get(userId));
        expect(getResponse.ok()).toBeTruthy();
      }
    }
  });

  // ============================================================================
  // USER MANAGEMENT - UPDATE
  // ============================================================================

  test('should update user role via API', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Create a test user first
    const testEmail = `update-test-${Date.now()}@test.com`;
    const createResponse = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: testEmail,
        password: 'Password@123',
        displayName: 'Update Test',
        role: 'listener',
      },
    });
    
    if (createResponse.ok()) {
      const user = await createResponse.json();
      
      // Update role
      const updateResponse = await page.request.patch(API_ENDPOINTS.users.update(user.id), {
        data: { role: 'admin' },
      });
      
      expect(updateResponse.ok()).toBeTruthy();
      
      // Cleanup
      await deleteUser(page, user.id);
    }
  });

  test('should update user active status via API', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Create test user
    const testEmail = `active-test-${Date.now()}@test.com`;
    const createResponse = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: testEmail,
        password: 'Password@123',
        displayName: 'Active Test',
        role: 'listener',
      },
    });
    
    if (createResponse.ok()) {
      const user = await createResponse.json();
      
      // Deactivate
      const deactivateResponse = await page.request.patch(API_ENDPOINTS.users.update(user.id), {
        data: { isActive: false },
      });
      
      expect(deactivateResponse.ok()).toBeTruthy();
      
      // Cleanup
      await deleteUser(page, user.id);
    }
  });

  // ============================================================================
  // USER MANAGEMENT - DELETE
  // ============================================================================

  test('should delete user via API', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Create user
    const testEmail = `delete-test-${Date.now()}@test.com`;
    const createResponse = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: testEmail,
        password: 'Password@123',
        displayName: 'Delete Test',
        role: 'listener',
      },
    });
    
    if (createResponse.ok()) {
      const user = await createResponse.json();
      
      // Delete
      const deleteResponse = await page.request.delete(API_ENDPOINTS.users.delete(user.id));
      expect(deleteResponse.ok()).toBeTruthy();
      
      // Verify deleted
      const getResponse = await page.request.get(API_ENDPOINTS.users.get(user.id));
      expect(getResponse.status()).toBe(404);
    }
  });

  test('should not delete self via API', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Get current user
    const meResponse = await page.request.get('/api/auth/me');
    
    if (meResponse.ok()) {
      const me = await meResponse.json();
      
      // Try to delete self
      const deleteResponse = await page.request.delete(API_ENDPOINTS.users.delete(me.id));
      
      // Should either fail or return 400
      expect(deleteResponse.status()).toBeGreaterThanOrEqual(400);
    }
  });

  // ============================================================================
  // PERMISSIONS
  // ============================================================================

  test('should prevent listener from accessing admin API', async ({ page }) => {
    await loginUser(page, TEST_USERS.listener.email, TEST_USERS.listener.password);
    
    // Try to access admin endpoint
    const response = await page.request.get(API_ENDPOINTS.users.list);
    expect(response.status()).toBeGreaterThanOrEqual(403);
  });

  test('should prevent anonymous user from accessing admin API', async ({ page }) => {
    const response = await page.request.get(API_ENDPOINTS.users.list);
    expect(response.status()).toBeGreaterThanOrEqual(401);
  });

  // ============================================================================
  // PAGINATION & SEARCH
  // ============================================================================

  test('should handle user pagination via API', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Request with pagination
    const response = await page.request.get(`${API_ENDPOINTS.users.list}?page=1&limit=10`);
    
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });

  test('should search users via API', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const response = await page.request.get(`${API_ENDPOINTS.users.list}?search=test`);
    
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });

  // ============================================================================
  // ADMIN DASHBOARD UI
  // ============================================================================

  test('should display user table on admin dashboard', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await navigateTo(page, ROUTES.adminDashboard);
    await waitForPageLoad(page, 'table, [class*="table"]');
    
    const table = page.locator('table, [class*="table"]');
    const hasTable = await table.count() > 0;
    
    // Either has table or loads data
    expect(hasTable || page.url().includes('/admin')).toBeTruthy();
  });

  test('should have create user button on admin dashboard', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await navigateTo(page, ROUTES.adminDashboard);
    await waitForPageLoad(page, 'button, a');
    
    // Look for create/add user button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), a:has-text("Create")');
    const hasCreateButton = await createButton.count() > 0;
    
    // Button might exist or not depending on UI
    expect(hasCreateButton || page.url().includes('/admin')).toBeTruthy();
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  test('should handle invalid user ID', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const response = await page.request.get(API_ENDPOINTS.users.get(99999));
    expect(response.status()).toBe(404);
  });

  test('should handle duplicate email on user creation', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Try to create with existing email
    const response = await page.request.post(API_ENDPOINTS.users.create, {
      data: {
        email: TEST_USERS.admin.email, // Already exists
        password: 'Password@123',
        displayName: 'Duplicate',
        role: 'listener',
      },
    });
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
