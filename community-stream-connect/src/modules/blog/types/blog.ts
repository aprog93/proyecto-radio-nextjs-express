/**
 * Blog Module Types
 * Tipos y interfaces para el sistema de blog
 */

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  viewCount?: number;
}

export interface Metric {
  id: string;
  postId: string;
  userId?: string;
  eventType: 'view' | 'comment' | 'share';
  timestamp: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  durationMs: number;
}

export interface PostMetrics {
  postId: string;
  views: number;
  comments: number;
  shares: number;
  lastUpdated: Date;
}

export type CreatePostInput = Omit<Post, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePostInput = Partial<CreatePostInput>;
