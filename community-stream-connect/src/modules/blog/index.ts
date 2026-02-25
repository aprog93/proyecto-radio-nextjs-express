// Blog Module - Public API
export { useBlogPosts } from './hooks/useBlogPosts';
export { useMetrics } from './hooks/useMetrics';
export { useSessionTracking } from './hooks/useSessionTracking';
export { BlogPage } from './pages/BlogPage';
export { BlogDetailPage } from './pages/BlogDetailPage';
export { BlogAdminPanel } from './components/BlogAdminPanel';
export { BlogMetricsDashboard } from './components/BlogMetricsDashboard';

export type { Post, Metric, UserSession } from './types/blog';
export { postsAPI, metricsAPI } from './api';
