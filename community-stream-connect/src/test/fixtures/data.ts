/**
 * Frontend test fixtures for test data
 */

export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'listener';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  category: string;
  tags: string[];
  image?: string;
  published: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface MockComment {
  id: string;
  content: string;
  userId: string;
  blogId?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockDonation {
  id: string;
  amount: number;
  currency: string;
  message?: string;
  anonymous: boolean;
  email?: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export const mockUser: MockUser = {
  id: '1',
  email: 'listener@example.com',
  displayName: 'John Listener',
  role: 'listener',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Music enthusiast',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

export const mockAdminUser: MockUser = {
  id: '1',
  email: 'admin@radiocesar.local',
  displayName: 'Admin User',
  role: 'admin',
  avatar: 'https://example.com/admin.jpg',
  bio: 'System administrator',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockBlogPost: MockBlogPost = {
  id: '1',
  title: 'Welcome to Radio Cesar',
  slug: 'welcome-to-radio-cesar',
  content: 'This is our first blog post about Radio Cesar community platform...',
  excerpt: 'Introduction to Radio Cesar',
  authorId: '1',
  category: 'Announcements',
  tags: ['welcome', 'news', 'intro'],
  image: 'https://example.com/blog-cover.jpg',
  published: true,
  viewCount: 150,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-05T10:00:00Z',
  publishedAt: '2024-01-01T10:00:00Z',
};

export const mockComment: MockComment = {
  id: '1',
  content: 'Great blog post! Thanks for sharing.',
  userId: '2',
  blogId: '1',
  approved: true,
  createdAt: '2024-02-01T15:30:00Z',
  updatedAt: '2024-02-01T15:30:00Z',
};

export const mockDonation: MockDonation = {
  id: '1',
  amount: 25.00,
  currency: 'USD',
  message: 'Keep up the good work!',
  anonymous: false,
  email: 'donor@example.com',
  transactionId: 'TXN-001-2024',
  status: 'completed',
  createdAt: '2024-02-15T10:00:00Z',
};

/**
 * Create a mock user with custom values
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    ...mockUser,
    ...overrides,
  };
}

/**
 * Create a mock blog post with custom values
 */
export function createMockBlogPost(overrides: Partial<MockBlogPost> = {}): MockBlogPost {
  return {
    ...mockBlogPost,
    ...overrides,
  };
}

/**
 * Create a mock comment with custom values
 */
export function createMockComment(overrides: Partial<MockComment> = {}): MockComment {
  return {
    ...mockComment,
    ...overrides,
  };
}

/**
 * Create a mock donation with custom values
 */
export function createMockDonation(overrides: Partial<MockDonation> = {}): MockDonation {
  return {
    ...mockDonation,
    ...overrides,
  };
}

