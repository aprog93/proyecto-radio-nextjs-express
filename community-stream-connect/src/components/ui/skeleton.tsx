import { cn } from "@/lib/utils";

/**
 * Base Skeleton component - animated gray placeholder
 * Use as a base for custom skeleton layouts
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

/**
 * SkeletonText - Multiple lines of text skeleton
 * Useful for titles, descriptions, content blocks
 */
interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lineHeight?: string;
}

function SkeletonText({ lines = 3, lineHeight = 'h-4', className, ...props }: SkeletonTextProps) {
  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            lineHeight,
            i === lines - 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Stats card skeleton for dashboard
 * Mimics the layout of a stat card with title, value, and icon
 */
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-3 w-1/4 mt-2" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}

/**
 * SkeletonTable - Table rows skeleton
 */
interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

function SkeletonTable({ rows = 5, cols = 5 }: SkeletonTableProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 items-center p-4 border border-border rounded-lg">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className={cn(
                'h-4 rounded',
                colIdx === 0 ? 'flex-1' : colIdx === cols - 1 ? 'w-20' : 'w-24'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonAvatar - Circular avatar skeleton
 */
interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

function SkeletonAvatar({ size = 'md', className, ...props }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <Skeleton
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

/**
 * SkeletonImage - Rectangular image skeleton with aspect ratio
 */
interface SkeletonImageProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: 'square' | 'video' | 'auto';
}

function SkeletonImage({ aspectRatio = 'video', className, ...props }: SkeletonImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  };

  return (
    <Skeleton
      className={cn(
        'w-full rounded-lg',
        aspectClasses[aspectRatio],
        className
      )}
      {...props}
    />
  );
}

/**
 * SkeletonArticleCard - Full article/blog card skeleton (grid layout)
 */
function SkeletonArticleCard() {
  return (
    <div className="space-y-4">
      <SkeletonImage aspectRatio="video" className="h-48" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <SkeletonText lines={2} lineHeight="h-3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

/**
 * SkeletonArticleRow - Article row skeleton (list layout)
 */
function SkeletonArticleRow() {
  return (
    <div className="rounded-2xl border border-border p-6 flex gap-6">
      <SkeletonImage aspectRatio="square" className="w-48 h-48 flex-shrink-0" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <SkeletonText lines={2} lineHeight="h-3" />
        <div className="flex gap-6 pt-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonArticleCard,
  SkeletonArticleRow,
};
