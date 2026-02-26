/**
 * Tipos de base de datos para Proyecto Radio Cesar
 */

export type UserRole = 'admin' | 'listener';

export interface User {
  id: number;
  email: string;
  password?: string;
  displayName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
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

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  registeredAt: string;
}

export interface Schedule {
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

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: string;
  shippingAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: number;
  amount: number;
  currency: string;
  message?: string;
  anonymous: boolean;
  email?: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  blog_id?: number;
  news_id?: number;
  event_id?: number;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTOs para requests/responses
 */

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  displayName: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  published?: boolean;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  published?: boolean;
  expiresAt?: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  capacity?: number;
  published?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category?: string;
  stock?: number;
  published?: boolean;
}

export interface AuthResponse {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  avatar?: string;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
