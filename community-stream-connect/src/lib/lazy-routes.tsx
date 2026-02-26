import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Fallback component shown while lazy-loaded route is loading
 */
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

/**
 * Wrapper for lazy-loaded routes with Suspense
 * @param Component The lazy-loaded component
 * @returns JSX with Suspense boundary
 */
export const withSuspense = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={<RouteLoader />}>
    <Component {...props} />
  </Suspense>
);

/**
 * Lazy load route components
 * These will be code-split into separate chunks
 * Only secondary pages are lazy-loaded; critical pages are eager-loaded in App.tsx
 */

// Content pages (medium-traffic)
export const LazySchedule = lazy(() => import('@/pages/Schedule'));
export const LazyParticipate = lazy(() => import('@/pages/Participate'));
export const LazyCommunity = lazy(() => import('@/pages/Community'));
export const LazyDonate = lazy(() => import('@/pages/Donate'));
export const LazyPrograms = lazy(() => import('@/pages/Programs'));

// Info pages (low-traffic, can lazy load)
export const LazyAbout = lazy(() => import('@/pages/About'));
export const LazyTerms = lazy(() => import('@/pages/Terms'));
export const LazyHistory = lazy(() => import('@/pages/History'));
export const LazyHowToParticipate = lazy(() => import('@/pages/HowToParticipate'));
export const LazySupport = lazy(() => import('@/pages/Support'));
export const LazyTeam = lazy(() => import('@/pages/Team'));
export const LazyContact = lazy(() => import('@/pages/Contact'));

// Auth pages (lazy - lower priority than home)
export const LazyResetPassword = lazy(() => import('@/pages/ResetPassword'));

// User pages
export const LazyPortal = lazy(() => import('@/pages/Portal'));
export const LazyProfileSettings = lazy(() => import('@/pages/ProfileSettings'));
export const LazyAdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

// Content detail pages
export const LazyBlog = lazy(() => import('@/pages/Blog'));
export const LazyBlogDetail = lazy(() => import('@/pages/BlogDetail'));
export const LazyNews = lazy(() => import('@/pages/News'));
export const LazyNewsDetail = lazy(() => import('@/pages/NewsDetail'));
export const LazyEvents = lazy(() => import('@/pages/Events'));
export const LazyEventDetail = lazy(() => import('@/pages/EventDetail'));
export const LazyShop = lazy(() => import('@/pages/Shop'));
export const LazyProductDetail = lazy(() => import('@/pages/ProductDetail'));
export const LazyCart = lazy(() => import('@/pages/Cart'));

// AzuraCast modules
export const LazyDashboard = lazy(() => import('@/modules/azuracast').then(m => ({ default: m.Dashboard })));
export const LazyNowPlayingPageModule = lazy(() => import('@/modules/azuracast').then(m => ({ default: m.NowPlayingPage })));
export const LazyPlaylistsPage = lazy(() => import('@/modules/azuracast').then(m => ({ default: m.PlaylistsPage })));

