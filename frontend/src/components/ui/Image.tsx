import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean;
  containerClassName?: string;
}

// Detect if the caller already constrains the wrapper size (aspect-ratio
// utilities or explicit w-/h- sizing). If so, respect it — otherwise we
// reserve space using the image's intrinsic dimensions to prevent CLS.
const hasOwnSizing = (className?: string) =>
  /(?:^|\s)(?:aspect-|h-|w-)/.test(className || '');

export const OptimizedImage = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    { src, alt, className, priority = false, containerClassName, width, height, ...props },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Reset state if src changes
    useEffect(() => {
      setIsLoaded(false);
      setHasError(false);
    }, [src]);

    // Optimize Unsplash URLs automatically if they don't already have optimization params
    const getOptimizedSrc = (url?: string) => {
      if (!url) return undefined;
      try {
        if (url.includes('unsplash.com')) {
          const u = new URL(url);
          if (!u.searchParams.has('auto')) u.searchParams.append('auto', 'format,compress');
          if (!u.searchParams.has('q')) u.searchParams.append('q', '80');
          return u.toString();
        }
      } catch {
        // Ignore invalid URLs
      }
      return url;
    };

    // Intrinsic dimensions: explicit props win, then Unsplash w=/h= params.
    const deriveIntrinsicSize = () => {
      if (width != null && height != null) return { width, height };
      try {
        if (src && src.includes('unsplash.com')) {
          const u = new URL(src);
          const w = Number(u.searchParams.get('w'));
          const h = Number(u.searchParams.get('h'));
          if (w > 0 && h > 0) return { width: w, height: h };
        }
      } catch {
        // Ignore invalid URLs
      }
      return { width: undefined, height: undefined };
    };

    const { width: intrinsicWidth, height: intrinsicHeight } = deriveIntrinsicSize();
    const optimizedSrc = getOptimizedSrc(src);

    // Only reserve the wrapper's aspect ratio when the caller hasn't sized it,
    // so fixed/aspect-ratio containers keep their intended shape.
    const reservedAspectRatio =
      intrinsicWidth && intrinsicHeight && !hasOwnSizing(className)
        ? { aspectRatio: `${intrinsicWidth} / ${intrinsicHeight}` }
        : undefined;

    if (hasError) {
      return (
        <div
          className={[
            'flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400',
            className,
            containerClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          role="img"
          aria-label={alt || 'Image failed to load'}
        >
          <ImageOff className="w-8 h-8 opacity-50" />
        </div>
      );
    }

    return (
      <div
        className={['relative overflow-hidden', containerClassName, className].filter(Boolean).join(' ')}
        style={reservedAspectRatio}
      >
        {/* Skeleton Placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        )}

        <img
          ref={ref}
          src={optimizedSrc}
          alt={alt || ''}
          width={intrinsicWidth}
          height={intrinsicHeight}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          // Using React 19 / standard fetchpriority
          {...((priority ? { fetchpriority: 'high' } : {}) as any)}
          className={[
            'w-full h-full transition-opacity duration-500',
            className?.includes('object-') ? '' : 'object-cover',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          onLoad={(e) => {
            setIsLoaded(true);
            if (props.onLoad) props.onLoad(e);
          }}
          onError={(e) => {
            setHasError(true);
            if (props.onError) props.onError(e);
          }}
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';
