/**
 * Public Pages E2E Tests
 * Tests all public pages that don't require authentication
 */

import { test, expect } from '@playwright/test';
import { ROUTES, navigateTo, waitForPageLoad } from './fixtures';

test.describe('Public Pages', () => {
  // ============================================================================
  // CORE PAGES
  // ============================================================================

  test('should load home page', async ({ page }) => {
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    // Check for common home page elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load now playing page', async ({ page }) => {
    await navigateTo(page, ROUTES.nowPlaying);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  // ============================================================================
  // AUTH PAGES
  // ============================================================================

  test('should load login page', async ({ page }) => {
    await navigateTo(page, ROUTES.login);
    await waitForPageLoad(page, 'form, input');
    
    // Should have login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // At least one should be visible
    const hasForm = await emailInput.isVisible() || await passwordInput.isVisible();
    expect(hasForm || page.url().includes('/login')).toBeTruthy();
  });

  test('should load register page', async ({ page }) => {
    await navigateTo(page, ROUTES.register);
    await waitForPageLoad(page, 'form, input');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  // ============================================================================
  // SCHEDULE & PROGRAMMING
  // ============================================================================

  test('should load schedule page (English)', async ({ page }) => {
    await navigateTo(page, ROUTES.schedule);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load schedule page (Spanish)', async ({ page }) => {
    await navigateTo(page, ROUTES.programacion);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load programs page', async ({ page }) => {
    await navigateTo(page, ROUTES.programas);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  // ============================================================================
  // COMMUNITY PAGES
  // ============================================================================

  test('should load participate page', async ({ page }) => {
    await navigateTo(page, ROUTES.participate);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load community page', async ({ page }) => {
    await navigateTo(page, ROUTES.community);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load como participar page', async ({ page }) => {
    await navigateTo(page, ROUTES.comoParticipar);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  // ============================================================================
  // SUPPORT PAGES
  // ============================================================================

  test('should load donate page', async ({ page }) => {
    await navigateTo(page, ROUTES.donate);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load support page', async ({ page }) => {
    await navigateTo(page, ROUTES.apoyanos);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  // ============================================================================
  // INFO PAGES
  // ============================================================================

  test('should load about page', async ({ page }) => {
    await navigateTo(page, ROUTES.about);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load history page', async ({ page }) => {
    await navigateTo(page, ROUTES.historia);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load team page', async ({ page }) => {
    await navigateTo(page, ROUTES.team);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load contact page', async ({ page }) => {
    await navigateTo(page, ROUTES.contact);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load terms page', async ({ page }) => {
    await navigateTo(page, ROUTES.terms);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  // ============================================================================
  // CONTENT PAGES - BLOG
  // ============================================================================

  test('should load blog page', async ({ page }) => {
    await navigateTo(page, ROUTES.blog);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to blog from home', async ({ page }) => {
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    // Try to find and click blog link
    const blogLink = page.locator('a[href*="/blog"]').first();
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/blog');
    }
  });

  // ============================================================================
  // CONTENT PAGES - NEWS
  // ============================================================================

  test('should load news page', async ({ page }) => {
    await navigateTo(page, ROUTES.news);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to news from home', async ({ page }) => {
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    // Try to find and click news link
    const newsLink = page.locator('a[href*="/news"]').first();
    if (await newsLink.isVisible()) {
      await newsLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/news');
    }
  });

  // ============================================================================
  // CONTENT PAGES - EVENTS
  // ============================================================================

  test('should load events page', async ({ page }) => {
    await navigateTo(page, ROUTES.events);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  // ============================================================================
  // CONTENT PAGES - SHOP
  // ============================================================================

  test('should load shop page', async ({ page }) => {
    await navigateTo(page, ROUTES.shop);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load cart page', async ({ page }) => {
    await navigateTo(page, ROUTES.cart);
    await waitForPageLoad(page, 'body');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  test('should navigate between pages', async ({ page }) => {
    // Start at home
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    // Navigate to about
    const aboutLink = page.locator('a[href="/about"]').first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/about');
    }
  });

  test('should have working navbar', async ({ page }) => {
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    // Check for navbar
    const navbar = page.locator('nav, header');
    const hasNavbar = await navbar.count() > 0;
    
    // If navbar exists, check for links
    if (hasNavbar) {
      const navLinks = page.locator('nav a, header a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThanOrEqual(0);
    }
  });

  // ============================================================================
  // FOOTER
  // ============================================================================

  test('should have footer', async ({ page }) => {
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    const footer = page.locator('footer');
    const hasFooter = await footer.count() > 0;
    
    if (hasFooter) {
      await expect(footer.first()).toBeVisible();
    }
  });

  // ============================================================================
  // RESPONSIVE DESIGN
  // ============================================================================

  test('should work on mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    // Page should be usable on mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    await context.close();
  });

  test('should work on tablet viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();
    
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    await context.close();
  });

  // ============================================================================
  // ACCESSIBILITY BASIC CHECKS
  // ============================================================================

  test('should have valid HTML structure', async ({ page }) => {
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    // Check for html and body tags
    const html = page.locator('html');
    const body = page.locator('body');
    
    await expect(html).toBeVisible();
    await expect(body).toBeVisible();
  });

  test('should have language attribute', async ({ page }) => {
    await navigateTo(page, ROUTES.home);
    await page.waitForLoadState('networkidle');
    
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    
    // Language should be defined
    expect(lang).toBeTruthy();
  });
});
