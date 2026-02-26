import { Blog, News, Event, Schedule, Product, Comment, Donation, Order } from '@/types/database.js';

/**
 * Blog fixtures
 */

export const mockBlog: Blog = {
  id: 1,
  title: 'Welcome to Radio Cesar',
  slug: 'welcome-to-radio-cesar',
  content: 'This is our first blog post about Radio Cesar community platform...',
  excerpt: 'Introduction to Radio Cesar',
  author_id: 1,
  category: 'Announcements',
  tags: 'welcome,news,intro',
  image: 'https://example.com/blog-cover.jpg',
  published: true,
  viewCount: 150,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-05T10:00:00Z',
  publishedAt: '2024-01-01T10:00:00Z',
};

export const mockDraftBlog: Blog = {
  id: 2,
  title: 'Draft Blog Post',
  slug: 'draft-blog-post',
  content: 'This blog post is still in draft...',
  excerpt: 'Still writing this one',
  author_id: 1,
  category: 'Updates',
  tags: 'draft',
  published: false,
  viewCount: 0,
  createdAt: '2024-02-01T10:00:00Z',
  updatedAt: '2024-02-01T10:00:00Z',
};

/**
 * News fixtures
 */

export const mockNews: News = {
  id: 1,
  title: 'New Streaming Feature Available',
  content: 'We are excited to announce a new streaming feature...',
  author_id: 1,
  image: 'https://example.com/news-image.jpg',
  published: true,
  viewCount: 500,
  createdAt: '2024-02-15T08:00:00Z',
  updatedAt: '2024-02-15T08:00:00Z',
  publishedAt: '2024-02-15T08:00:00Z',
};

export const mockExpiredNews: News = {
  id: 2,
  title: 'Event Cancelled - Old News',
  content: 'This news has expired...',
  author_id: 1,
  published: true,
  expiresAt: '2024-01-01T23:59:59Z',
  viewCount: 100,
  createdAt: '2024-01-01T08:00:00Z',
  updatedAt: '2024-01-01T08:00:00Z',
  publishedAt: '2024-01-01T08:00:00Z',
};

/**
 * Event fixtures
 */

export const mockEvent: Event = {
  id: 1,
  title: 'Live Music Event',
  description: 'Join us for an amazing live music event',
  startDate: '2024-03-15T18:00:00Z',
  endDate: '2024-03-15T22:00:00Z',
  location: 'Community Hall',
  image: 'https://example.com/event-banner.jpg',
  capacity: 100,
  registered: 45,
  author_id: 1,
  published: true,
  createdAt: '2024-02-01T10:00:00Z',
  updatedAt: '2024-02-01T10:00:00Z',
  publishedAt: '2024-02-01T10:00:00Z',
};

export const mockFullEvent: Event = {
  id: 2,
  title: 'Full Capacity Event',
  description: 'This event is full',
  startDate: '2024-03-20T19:00:00Z',
  endDate: '2024-03-20T23:00:00Z',
  location: 'Main Theater',
  capacity: 50,
  registered: 50,
  author_id: 1,
  published: true,
  createdAt: '2024-02-10T10:00:00Z',
  updatedAt: '2024-02-10T10:00:00Z',
  publishedAt: '2024-02-10T10:00:00Z',
};

/**
 * Schedule fixtures
 */

export const mockSchedule: Schedule = {
  id: 1,
  title: 'Morning Show',
  description: 'Your daily morning entertainment',
  dayOfWeek: 1, // Monday
  startTime: '06:00',
  endTime: '12:00',
  host: 'DJ Roberto',
  image: 'https://example.com/morning-show.jpg',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

export const mockEveningSchedule: Schedule = {
  id: 2,
  title: 'Evening Show',
  description: 'Wind down with evening tunes',
  dayOfWeek: 1, // Monday
  startTime: '18:00',
  endTime: '23:00',
  host: 'DJ Maria',
  image: 'https://example.com/evening-show.jpg',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

/**
 * Product fixtures
 */

export const mockProduct: Product = {
  id: 1,
  name: 'Radio Cesar T-Shirt',
  description: 'Official Radio Cesar merchandise',
  price: 19.99,
  image: 'https://example.com/tshirt.jpg',
  category: 'Merchandise',
  stock: 50,
  published: true,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

export const mockOutOfStockProduct: Product = {
  id: 2,
  name: 'Vintage Radio Cesar Cap',
  description: 'Limited edition cap',
  price: 14.99,
  image: 'https://example.com/cap.jpg',
  category: 'Merchandise',
  stock: 0,
  published: true,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

/**
 * Comment fixtures
 */

export const mockComment: Comment = {
  id: 1,
  content: 'Great blog post! Thanks for sharing.',
  user_id: 2,
  blog_id: 1,
  approved: true,
  createdAt: '2024-02-01T15:30:00Z',
  updatedAt: '2024-02-01T15:30:00Z',
};

export const mockPendingComment: Comment = {
  id: 2,
  content: 'Awaiting moderation...',
  user_id: 3,
  news_id: 1,
  approved: false,
  createdAt: '2024-02-20T12:00:00Z',
  updatedAt: '2024-02-20T12:00:00Z',
};

/**
 * Donation fixtures
 */

export const mockDonation: Donation = {
  id: 1,
  amount: 25.00,
  currency: 'USD',
  message: 'Keep up the good work!',
  anonymous: false,
  email: 'donor@example.com',
  transactionId: 'TXN-001-2024',
  status: 'completed',
  createdAt: '2024-02-15T10:00:00Z',
};

export const mockAnonymousDonation: Donation = {
  id: 2,
  amount: 50.00,
  currency: 'USD',
  message: 'Love your content!',
  anonymous: true,
  transactionId: 'TXN-002-2024',
  status: 'completed',
  createdAt: '2024-02-16T11:00:00Z',
};

export const mockPendingDonation: Donation = {
  id: 3,
  amount: 100.00,
  currency: 'USD',
  message: 'Supporting the community',
  anonymous: false,
  email: 'pending@example.com',
  transactionId: 'TXN-003-2024',
  status: 'pending',
  createdAt: '2024-02-20T09:00:00Z',
};

/**
 * Order fixtures
 */

export const mockOrder: Order = {
  id: 1,
  user_id: 2,
  total: 39.98,
  status: 'completed',
  items: '[{"productId": 1, "quantity": 2}]',
  shippingAddress: '123 Main St, City, State 12345',
  createdAt: '2024-02-10T14:00:00Z',
  updatedAt: '2024-02-12T10:00:00Z',
};

export const mockPendingOrder: Order = {
  id: 2,
  user_id: 3,
  total: 19.99,
  status: 'pending',
  items: '[{"productId": 1, "quantity": 1}]',
  shippingAddress: '456 Oak Ave, Town, Province 67890',
  createdAt: '2024-02-20T16:00:00Z',
  updatedAt: '2024-02-20T16:00:00Z',
};

/**
 * Content collections
 */

export const testBlogs = [mockBlog, mockDraftBlog];
export const testNews = [mockNews, mockExpiredNews];
export const testEvents = [mockEvent, mockFullEvent];
export const testSchedules = [mockSchedule, mockEveningSchedule];
export const testProducts = [mockProduct, mockOutOfStockProduct];
export const testComments = [mockComment, mockPendingComment];
export const testDonations = [mockDonation, mockAnonymousDonation, mockPendingDonation];
export const testOrders = [mockOrder, mockPendingOrder];

/**
 * Helper functions
 */

export function createMockBlog(overrides: Partial<Blog> = {}): Blog {
  return {
    ...mockBlog,
    id: Math.floor(Math.random() * 10000),
    slug: `blog-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockComment(overrides: Partial<Comment> = {}): Comment {
  return {
    ...mockComment,
    id: Math.floor(Math.random() * 10000),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockDonation(overrides: Partial<Donation> = {}): Donation {
  return {
    ...mockDonation,
    id: Math.floor(Math.random() * 10000),
    transactionId: `TXN-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
