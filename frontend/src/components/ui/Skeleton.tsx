interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const base = 'skeleton-shimmer rounded';
  const variantClass = variant === 'circular' ? 'rounded-full' : variant === 'rectangular' ? 'rounded-lg' : 'rounded h-4';

  return (
    <div
      className={`${base} ${variantClass} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-0">
      <Skeleton variant="rectangular" className="w-full aspect-4/3 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-4" />
        <Skeleton className="w-1/3 h-4" />
        <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="flex-1 h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-24 h-8 mb-1" />
      <Skeleton className="w-20 h-4" />
    </div>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div>
      <Skeleton variant="rectangular" className="w-full h-[50vh] rounded-none" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="w-1/3 h-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-8 space-y-4">
              <Skeleton className="w-1/2 h-6" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
            </div>
            <div className="card p-8 space-y-4">
              <Skeleton className="w-1/3 h-6" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="card p-6 space-y-4">
              <Skeleton className="w-1/2 h-8" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-8 space-y-6">
          <Skeleton className="w-1/3 h-6" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-full h-12" />
              </div>
            ))}
          </div>
          <Skeleton className="w-1/3 h-6" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="card p-6 space-y-4">
          <Skeleton className="w-1/2 h-6" />
          <div className="flex gap-3">
            <Skeleton className="w-16 h-16" />
            <div className="space-y-2 flex-1">
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-3" />
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-4" />
          ))}
        </div>
      </div>
    </div>
  );
}
