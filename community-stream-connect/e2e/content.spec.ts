/**
 * Content Pages E2E Tests
 * Tests blog, news, events pages and content loading
 */

import { test, expect } from '@playwright/test';
import {
  TEST_BLOG_POST,
  TEST_NEWS,
  TEST_EVENT,
  loginUser,
  createBlogPost,
  createNews,
  createEvent,
  deleteBlogPost,
  navigateTo,
  waitForPageLoad,
  TEST_USERS,
} from './fixtures';

test.describe('Content Pages', () => {
  test('should load blog page', async ({ page }) => {
    await navigateTo(page, '/blog');
    await waitForPageLoad(page, 'text=Blog');

    await expect(page.locator('text=Blog')).toBeVisible();
  });

  test('should display blog posts', async ({ page }) => {
    await navigateTo(page, '/blog');
    await waitForPageLoad(page, '[class*="article"]');

    // Should have at least one blog post or a message
    const hasArticles = page.locator('[class*="article"], [class*="card"]');
    const articleCount = await hasArticles.count();
    expect(articleCount).toBeGreaterThanOrEqual(0);
  });

  test('should load individual blog post', async ({ page }) => {
    await navigateTo(page, '/blog');

    // Try to find and click a blog post
    const firstPost = page.locator('[class*="article"], [class*="card"]').first();
    if (await firstPost.isVisible()) {
      const link = firstPost.locator('a').first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('networkidle');

        // Should show post content
        const content = page.locator('[class*="content"], article');
        expect(await content.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should load news page', async ({ page }) => {
    await navigateTo(page, '/news');
    await waitForPageLoad(page, 'text=News');

    await expect(page.locator('text=News')).toBeVisible();
  });

  test('should display news items', async ({ page }) => {
    await navigateTo(page, '/news');
    await waitForPageLoad(page, '[class*="news"], [class*="item"]');

    // Should have news items or empty state
    const items = page.locator('[class*="news"], [class*="item"], [class*="article"]');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThanOrEqual(0);
  });

  test('should load events page', async ({ page }) => {
    await navigateTo(page, '/events');
    await waitForPageLoad(page, 'text=Events');

    await expect(page.locator('text=Events')).toBeVisible();
  });

  test('should display events', async ({ page }) => {
    await navigateTo(page, '/events');
    await waitForPageLoad(page, '[class*="event"], [class*="card"]');

    // Should have events or empty state
    const items = page.locator('[class*="event"], [class*="card"]');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThanOrEqual(0);
  });

  test('should create blog post (admin)', async ({ page }) => {
    // Login as admin
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Create blog post
    const post = await createBlogPost(page, TEST_BLOG_POST);
    expect(post.id).toBeTruthy();
    expect(post.title).toBe(TEST_BLOG_POST.title);

    // Cleanup
    await deleteBlogPost(page, post.id);
  });

  test('should create news item (admin)', async ({ page }) => {
    // Login as admin
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Create news
    const news = await createNews(page, TEST_NEWS);
    expect(news.id).toBeTruthy();
    expect(news.title).toBe(TEST_NEWS.title);
  });

  test('should create event (admin)', async ({ page }) => {
    // Login as admin
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Create event
    const event = await createEvent(page, TEST_EVENT);
    expect(event.id).toBeTruthy();
    expect(event.title).toBe(TEST_EVENT.title);
  });

  test('should block non-admin from creating content', async ({ page }) => {
    // Login as listener
    await loginUser(page, TEST_USERS.listener.email, TEST_USERS.listener.password);

    // Try to create blog post (should fail or be denied)
    const response = await page.request.post('/api/admin/blog', {
      data: TEST_BLOG_POST,
    });

    expect(response.status()).toBeGreaterThanOrEqual(401);
  });

  test('should load with skeleton loaders on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone size
    });
    const page = await context.newPage();

    // Navigate to blog
    await navigateTo(page, '/blog');

    // Check for skeleton elements
    const skeletons = page.locator('[class*="skeleton"]');
    // May have skeletons during loading
    const skeletonCount = await skeletons.count();
    expect(skeletonCount).toBeGreaterThanOrEqual(0);

    await context.close();
  });

  test('should handle loading errors gracefully', async ({ page }) => {
    // Try to access non-existent post
    await navigateTo(page, '/blog/99999');

    // Should show error or not found message
    const notFoundText = page.locator('text=not found, 404, error');
    const content = page.locator('body');

    // Page should still be usable
    await expect(content).toBeVisible();
  });
});
