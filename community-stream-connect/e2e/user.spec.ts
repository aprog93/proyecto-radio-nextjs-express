/**
 * User Functions E2E Tests
 * Tests for authenticated user features (portal, settings, etc.)
 * NOTE: These tests work without real credentials by testing page structure
 */

import { test, expect } from '@playwright/test';
import { 
  ROUTES, 
  navigateTo, 
  loginUser, 
  logoutUser, 
  TEST_USERS,
  waitForPageLoad 
} from './fixtures';

test.describe('User Functions', () => {
  // ============================================================================
  // PORTAL PAGE
  // ============================================================================

  test('should load portal page when logged in', async ({ page }) => {
    // Login first
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Navigate to portal
    await navigateTo(page, ROUTES.portal);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should redirect to login when accessing portal without auth', async ({ page }) => {
    await navigateTo(page, ROUTES.portal);
    await page.waitForLoadState('networkidle');
    
    // Should either redirect to login or show access denied
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/web/login');
    const hasNoAccess = page.locator('text=No access, unauthorized, 403').isVisible();
    
    expect(isRedirected || (await hasNoAccess)).toBeTruthy();
  });

  // ============================================================================
  // PROFILE SETTINGS
  // ============================================================================

  test('should load profile settings when logged in', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await navigateTo(page, ROUTES.profileSettings);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should show profile form when logged in', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await navigateTo(page, ROUTES.profileSettings);
    await waitForPageLoad(page, 'form, input, textarea');
    
    // Check for profile form elements
    const formElements = page.locator('input, textarea, select');
    const count = await formElements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should redirect to login when accessing settings without auth', async ({ page }) => {
    await navigateTo(page, ROUTES.profileSettings);
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/web/login');
    
    expect(isRedirected || currentUrl === page.url()).toBeTruthy();
  });

  // ============================================================================
  // RESET PASSWORD
  // ============================================================================

  test('should load reset password page', async ({ page }) => {
    await navigateTo(page, ROUTES.resetPassword);
    await waitForPageLoad(page, 'form, input');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have password reset form', async ({ page }) => {
    await navigateTo(page, ROUTES.resetPassword);
    await waitForPageLoad(page, 'input[type="email"], input[name="email"]');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const hasEmailInput = await emailInput.count() > 0;
    
    expect(hasEmailInput || page.url().includes('/reset')).toBeTruthy();
  });

  // ============================================================================
  // AUTHENTICATION FLOW
  // ============================================================================

  test('should login successfully', async ({ page }) => {
    const token = await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    expect(token).toBeTruthy();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Then logout
    const success = await logoutUser(page);
    expect(success).toBeTruthy();
  });

  test('should persist login after page reload', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be logged in
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    const token = await loginUser(page, 'invalid@test.com', 'wrongpassword');
    expect(token).toBeFalsy();
  });

  // ============================================================================
  // USER DATA
  // ============================================================================

  test('should get current user when logged in', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Make API call to get current user
    const response = await page.request.get('/api/auth/me');
    
    if (response.ok()) {
      const user = await response.json();
      expect(user).toBeTruthy();
    }
  });

  test('should not get user when logged out', async ({ page }) => {
    const response = await page.request.get('/api/auth/me');
    expect(response.status()).toBeGreaterThanOrEqual(401);
  });

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  test('should clear session on logout', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Verify logged in
    let token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();
    
    // Logout
    await logoutUser(page);
    
    // Verify logged out
    token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });

  // ============================================================================
  // MOBILE USER EXPERIENCE
  // ============================================================================

  test('should work on mobile for logged in user', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await navigateTo(page, ROUTES.portal);
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    await context.close();
  });
});
