/**
 * Typed API Client for Proyecto Radio Cesar Backend
 * Centralizes all backend calls with proper error handling and types
 */

import { apiCall, ApiResponse } from './backend-api';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Unwraps ApiResponse and throws on error
 */
async function unwrapResponse<T>(response: ApiResponse<T>): Promise<T> {
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'API request failed');
  }
  return response.data;
}

/**
 * Gets token from localStorage (used for API calls that need auth)
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// ============================================================================
// TYPES (from backend)
// ============================================================================

export interface User {
  id: number;
  email: string;
  displayName: string;
  role: 'admin' | 'listener';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface UserProfile {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  socialMedia?: string;
  preferences?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  displayName: string;
  role: 'admin' | 'listener';
  avatar?: string;
  token: string;
}

export interface Blog {
  id: number;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  author_id: number;
  category?: string;
  tags?: string;
  image?: string;
  published: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  author_id: number;
  image?: string;
  published: boolean;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  image?: string;
  capacity?: number;
  registered: number;
  author_id: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  stock: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleEvent {
  id: number;
  title: string;
  description?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  host?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AUTH API
// ============================================================================

export const auth = {
  register: async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    return unwrapResponse(response);
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return unwrapResponse(response);
  },

  logout: async (token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall('/auth/logout', { method: 'POST' }, finalToken);
    if (!response.success) {
      throw new Error(response.error?.message || 'Logout failed');
    }
  },

  getCurrentUser: async (token?: string): Promise<User> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<User>('/auth/me', {}, finalToken);
    return unwrapResponse(response);
  },

  refreshToken: async (token?: string): Promise<AuthResponse> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<AuthResponse>('/auth/refresh', { method: 'POST' }, finalToken);
    return unwrapResponse(response);
  },
};

// ============================================================================
// USERS API
// ============================================================================

export const users = {
  getProfile: async (token?: string): Promise<{ user: User; profile: UserProfile | null }> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<{ user: User; profile: UserProfile | null }>('/users/profile', {}, finalToken);
    return unwrapResponse(response);
  },

  updateProfile: async (
    data: Partial<{
      displayName: string;
      bio: string;
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      postalCode: string;
    }>,
    token?: string
  ): Promise<{ user: User; profile: UserProfile }> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<{ user: User; profile: UserProfile }>(
      '/users/profile',
      { method: 'PUT', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  uploadAvatar: async (avatar: string, token?: string): Promise<User> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<User>(
      '/users/avatar',
      { method: 'POST', body: JSON.stringify({ avatar }) },
      finalToken
    );
    return unwrapResponse(response);
  },
};

// ============================================================================
// BLOGS API
// ============================================================================

export const blogs = {
  getPublished: async (page = 1, limit = 10, category?: string, search?: string): Promise<{ blogs: Blog[]; total: number }> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const response = await apiCall<{ blogs: Blog[]; total: number }>(`/blogs?${params}`);
    return unwrapResponse(response);
  },

  getBySlug: async (slug: string): Promise<Blog> => {
    const response = await apiCall<Blog>(`/blogs/${slug}`);
    return unwrapResponse(response);
  },

  getUserBlogs: async (page = 1, limit = 10, token?: string): Promise<{ blogs: Blog[]; total: number }> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await apiCall<{ blogs: Blog[]; total: number }>(`/blogs/user?${params}`, {}, finalToken);
    return unwrapResponse(response);
  },

  create: async (
    data: {
      title: string;
      content: string;
      excerpt?: string;
      category?: string;
      tags?: string;
      published?: boolean;
    },
    token?: string
  ): Promise<Blog> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<Blog>(
      '/blogs',
      { method: 'POST', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  update: async (
    id: number,
    data: Partial<{
      title: string;
      content: string;
      excerpt: string;
      category: string;
      tags: string;
      published: boolean;
    }>,
    token?: string
  ): Promise<Blog> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<Blog>(
      `/blogs/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  delete: async (id: number, token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(`/blogs/${id}`, { method: 'DELETE' }, finalToken);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete blog');
    }
  },
};

// ============================================================================
// NEWS API
// ============================================================================

export const news = {
  getPublished: async (page = 1, limit = 10, search?: string): Promise<{ news: News[]; total: number }> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    const response = await apiCall<{ news: News[]; total: number }>(`/news?${params}`);
    return unwrapResponse(response);
  },

  getById: async (id: number): Promise<News> => {
    const response = await apiCall<News>(`/news/${id}`);
    return unwrapResponse(response);
  },

  create: async (
    data: {
      title: string;
      content: string;
      published?: boolean;
      expiresAt?: string;
    },
    token?: string
  ): Promise<News> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<News>(
      '/news',
      { method: 'POST', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  update: async (
    id: number,
    data: Partial<{
      title: string;
      content: string;
      published: boolean;
      expiresAt: string;
    }>,
    token?: string
  ): Promise<News> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<News>(
      `/news/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  delete: async (id: number, token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(`/news/${id}`, { method: 'DELETE' }, finalToken);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete news');
    }
  },
};

// ============================================================================
// EVENTS API
// ============================================================================

export const events = {
  getPublished: async (page = 1, limit = 10, search?: string, upcoming = false): Promise<{ events: Event[]; total: number }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      upcoming: upcoming.toString(),
    });
    if (search) params.append('search', search);
    const response = await apiCall<{ events: Event[]; total: number }>(`/events?${params}`);
    return unwrapResponse(response);
  },

  getById: async (id: number): Promise<Event> => {
    const response = await apiCall<Event>(`/events/${id}`);
    return unwrapResponse(response);
  },

  create: async (
    data: {
      title: string;
      description?: string;
      startDate: string;
      endDate: string;
      location?: string;
      capacity?: number;
      published?: boolean;
    },
    token?: string
  ): Promise<Event> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<Event>(
      '/events',
      { method: 'POST', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  update: async (
    id: number,
    data: Partial<{
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      location: string;
      capacity: number;
      published: boolean;
    }>,
    token?: string
  ): Promise<Event> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<Event>(
      `/events/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  delete: async (id: number, token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(`/events/${id}`, { method: 'DELETE' }, finalToken);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete event');
    }
  },

  register: async (eventId: number, token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(`/events/${eventId}/register`, { method: 'POST' }, finalToken);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to register for event');
    }
  },

  unregister: async (eventId: number, token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(`/events/${eventId}/unregister`, { method: 'POST' }, finalToken);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to unregister from event');
    }
  },
};

// ============================================================================
// PRODUCTS API
// ============================================================================

export const products = {
  getPublished: async (page = 1, limit = 10, category?: string, search?: string): Promise<{ products: Product[]; total: number }> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const response = await apiCall<{ products: Product[]; total: number }>(`/products?${params}`);
    return unwrapResponse(response);
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiCall<Product>(`/products/${id}`);
    return unwrapResponse(response);
  },

  create: async (
    data: {
      name: string;
      description?: string;
      price: number;
      category?: string;
      stock?: number;
      published?: boolean;
    },
    token?: string
  ): Promise<Product> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<Product>(
      '/products',
      { method: 'POST', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  update: async (
    id: number,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
      published: boolean;
    }>,
    token?: string
  ): Promise<Product> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<Product>(
      `/products/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  delete: async (id: number, token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(`/products/${id}`, { method: 'DELETE' }, finalToken);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete product');
    }
  },
};

// ============================================================================
// ADMIN API
// ============================================================================

export const admin = {
  listUsers: async (page = 1, limit = 20, search?: string, token?: string): Promise<{ data: User[]; total: number }> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    const response = await apiCall<{ data: User[]; total: number }>(`/admin/users?${params}`, {}, finalToken);
    return unwrapResponse(response);
  },

  getUserDetail: async (userId: number, token?: string): Promise<{ user: User; profile: UserProfile | null }> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<{ user: User; profile: UserProfile | null }>(`/admin/users/${userId}`, {}, finalToken);
    return unwrapResponse(response);
  },

  createUser: async (
    data: {
      email: string;
      password: string;
      displayName: string;
      role?: 'admin' | 'listener';
    },
    token?: string
  ): Promise<AuthResponse> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<AuthResponse>(
      '/admin/users',
      { method: 'POST', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  updateUser: async (
    userId: number,
    data: Partial<{
      displayName: string;
      email: string;
      role: string;
      isActive: boolean;
    }>,
    token?: string
  ): Promise<User> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<User>(
      `/admin/users/${userId}`,
      { method: 'PUT', body: JSON.stringify(data) },
      finalToken
    );
    return unwrapResponse(response);
  },

  deleteUser: async (userId: number, token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(`/admin/users/${userId}`, { method: 'DELETE' }, finalToken);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete user');
    }
  },

  getStats: async (token?: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    admins: number;
    listeners: number;
    totalBlogs: number;
    publishedBlogs: number;
    totalNews: number;
    publishedNews: number;
    totalEvents: number;
    publishedEvents: number;
    totalProducts: number;
    publishedProducts: number;
    totalDonations: { count: number; amount: number };
  }> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall<{
      totalUsers: number;
      activeUsers: number;
      admins: number;
      listeners: number;
      totalBlogs: number;
      publishedBlogs: number;
      totalNews: number;
      publishedNews: number;
      totalEvents: number;
      publishedEvents: number;
      totalProducts: number;
      publishedProducts: number;
      totalDonations: { count: number; amount: number };
    }>('/admin/stats', {}, finalToken);
    return unwrapResponse(response);
  },
};

// ============================================================================
// SCHEDULE API
// ============================================================================

export const schedule = {
  getAll: async (): Promise<ScheduleEvent[]> => {
    const response = await apiCall<ScheduleEvent[]>('/schedule');
    return unwrapResponse(response);
  },

  getByDay: async (dayOfWeek: number): Promise<ScheduleEvent[]> => {
    const response = await apiCall<ScheduleEvent[]>(`/schedule/day/${dayOfWeek}`);
    return unwrapResponse(response);
  },

  create: async (
    data: {
      title: string;
      description?: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      host?: string;
      image?: string;
    },
    token?: string
  ): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(
      '/schedule',
      { method: 'POST', body: JSON.stringify(data) },
      finalToken
    );
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create schedule');
    }
  },

  update: async (id: number, data: Partial<ScheduleEvent>, token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(
      `/schedule/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      finalToken
    );
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update schedule');
    }
  },

  delete: async (id: number, token?: string): Promise<void> => {
    const finalToken = token || getStoredToken();
    if (!finalToken) throw new Error('No token available');
    const response = await apiCall(`/schedule/${id}`, { method: 'DELETE' }, finalToken);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete schedule');
    }
  },
};

// ============================================================================
// EXPORT API NAMESPACE
// ============================================================================

export const api = {
  auth,
  users,
  blogs,
  news,
  events,
  products,
  admin,
  schedule,
};

export default api;
