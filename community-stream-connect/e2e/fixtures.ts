/**
 * E2E Test Fixtures & Helpers
 * Centralized test data, authentication, and utility functions
 */

import { Page, expect } from '@playwright/test';

// ============================================================================
// TEST DATA
// ============================================================================

/**
 * Test user accounts for E2E testing
 * These should be pre-created on the production server
 */
export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin@12345',
    displayName: 'Admin Test User',
    role: 'admin',
  },
  listener: {
    email: 'listener@test.com',
    password: 'Listener@12345',
    displayName: 'Listener Test User',
    role: 'listener',
  },
  newUser: {
    email: `e2etest-${Date.now()}@test.com`,
    password: 'NewUser@12345',
    displayName: 'E2E Test User',
    role: 'listener',
  },
};

export const TEST_BLOG_POST = {
  title: `E2E Test Blog Post ${Date.now()}`,
  content: 'This is a test blog post created by E2E tests',
  excerpt: 'Test excerpt',
  category: 'Technology',
  tags: 'e2e,test,automation',
  published: true,
};

export const TEST_NEWS = {
  title: `E2E Test News ${Date.now()}`,
  content: 'This is a test news item created by E2E tests',
  published: true,
};

export const TEST_EVENT = {
  title: `E2E Test Event ${Date.now()}`,
  description: 'This is a test event created by E2E tests',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  time: '18:00',
};

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  users: {
    list: '/api/admin/users',
    get: (id: number) => `/api/admin/users/${id}`,
    create: '/api/admin/users',
    update: (id: number) => `/api/admin/users/${id}`,
    delete: (id: number) => `/api/admin/users/${id}`,
  },
  blog: {
    list: '/api/blog',
    get: (id: number) => `/api/blog/${id}`,
    create: '/api/admin/blog',
    update: (id: number) => `/api/admin/blog/${id}`,
    delete: (id: number) => `/api/admin/blog/${id}`,
  },
  news: {
    list: '/api/news',
    get: (id: number) => `/api/news/${id}`,
    create: '/api/admin/news',
    update: (id: number) => `/api/admin/news/${id}`,
    delete: (id: number) => `/api/admin/news/${id}`,
  },
  events: {
    list: '/api/events',
    get: (id: number) => `/api/events/${id}`,
    create: '/api/admin/events',
    update: (id: number) => `/api/admin/events/${id}`,
    delete: (id: number) => `/api/admin/events/${id}`,
  },
};

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Logs in a user and stores auth token
 */
export async function loginUser(
  page: Page,
  email: string,
  password: string
): Promise<string | null> {
  const response = await page.request.post(API_ENDPOINTS.auth.login, {
    data: { email, password },
  });

  if (!response.ok()) {
    console.error(`Login failed for ${email}:`, response.status());
    return null;
  }

  const data = (await response.json()) as { token?: string };
  const token = data.token;

  if (token) {
    await page.context().addInitScript((token) => {
      localStorage.setItem('auth_token', token);
    }, token);
  }

  return token || null;
}

/**
 * Registers a new user
 */
export async function registerUser(
  page: Page,
  email: string,
  password: string,
  displayName: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const response = await page.request.post(API_ENDPOINTS.auth.register, {
    data: { email, password, displayName },
  });

  if (!response.ok()) {
    const error = await response.text();
    return { success: false, error };
  }

  const data = (await response.json()) as { token?: string };
  return { success: true, token: data.token };
}

/**
 * Logs out the current user
 */
export async function logoutUser(page: Page): Promise<boolean> {
  const response = await page.request.post(API_ENDPOINTS.auth.logout);
  if (response.ok()) {
    await page.context().clearCookies();
    // Clear localStorage
    await page.evaluate(() => localStorage.clear());
    return true;
  }
  return false;
}

/**
 * Gets current user info
 */
export async function getCurrentUser(page: Page) {
  const response = await page.request.get(API_ENDPOINTS.auth.me);
  if (!response.ok()) return null;
  return response.json();
}

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Navigates to a page and waits for it to load
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'networkidle' });
  // Wait a bit for React to hydrate
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Waits for a specific page element to be visible
 */
export async function waitForPageLoad(page: Page, selector: string): Promise<void> {
  await page.locator(selector).waitFor({ state: 'visible', timeout: 10000 });
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Asserts that user is logged in (token exists)
 */
export async function assertLoggedIn(page: Page): Promise<void> {
  const token = await page.evaluate(() => localStorage.getItem('auth_token'));
  expect(token).toBeTruthy();
}

/**
 * Asserts that user is logged out (token doesn't exist)
 */
export async function assertLoggedOut(page: Page): Promise<void> {
  const token = await page.evaluate(() => localStorage.getItem('auth_token'));
  expect(token).toBeNull();
}

/**
 * Asserts that an API response is successful
 */
export async function assertApiSuccess(
  response: Awaited<ReturnType<Page['request']['post']>>
): Promise<void> {
  expect(response.status()).toBeLessThan(400);
  const data = (await response.json()) as Record<string, unknown>;
  expect(data).toBeDefined();
}

/**
 * Asserts that user can access admin pages (403 or redirect otherwise)
 */
export async function assertAdminAccess(page: Page): Promise<void> {
  await navigateTo(page, '/admin/dashboard');
  // Should not be redirected to login
  expect(page.url()).toContain('/admin');
}

// ============================================================================
// DATA CREATION HELPERS
// ============================================================================

/**
 * Creates a blog post via API
 */
export async function createBlogPost(page: Page, data: typeof TEST_BLOG_POST) {
  const response = await page.request.post(API_ENDPOINTS.blog.create, { data });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Creates a news item via API
 */
export async function createNews(page: Page, data: typeof TEST_NEWS) {
  const response = await page.request.post(API_ENDPOINTS.news.create, { data });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Creates an event via API
 */
export async function createEvent(page: Page, data: typeof TEST_EVENT) {
  const response = await page.request.post(API_ENDPOINTS.events.create, { data });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Creates a user via API (admin only)
 */
export async function createUser(
  page: Page,
  email: string,
  password: string,
  displayName: string,
  role: 'admin' | 'listener' = 'listener'
) {
  const response = await page.request.post(API_ENDPOINTS.users.create, {
    data: { email, password, displayName, role },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

// ============================================================================
// CLEANUP HELPERS
// ============================================================================

/**
 * Deletes a blog post via API (admin only)
 */
export async function deleteBlogPost(page: Page, id: number) {
  const response = await page.request.delete(API_ENDPOINTS.blog.delete(id));
  return response.ok();
}

/**
 * Deletes a user via API (admin only)
 */
export async function deleteUser(page: Page, id: number) {
  const response = await page.request.delete(API_ENDPOINTS.users.delete(id));
  return response.ok();
}
