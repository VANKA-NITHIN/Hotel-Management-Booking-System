import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean;
  containerClassName?: string;
}

export const OptimizedImage = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, className, priority = false, containerClassName, ...props }, ref) => {
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

    const optimizedSrc = getOptimizedSrc(src);

    if (hasError) {
      return (
        <div 
          className={[
            "flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400", 
            className, 
            containerClassName
          ].filter(Boolean).join(" ")}
          role="img"
          aria-label={alt || "Image failed to load"}
        >
          <ImageOff className="w-8 h-8 opacity-50" />
        </div>
      );
    }

    return (
      <div className={["relative overflow-hidden", containerClassName, className].filter(Boolean).join(" ")}>
        {/* Skeleton Placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        )}
        
        <img
          ref={ref}
          src={optimizedSrc}
          alt={alt || ""}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          // Using React 19 / standard fetchpriority
          {...((priority ? { fetchpriority: 'high' } : {}) as any)}
          className={[
            "w-full h-full transition-opacity duration-500",
            className?.includes('object-') ? "" : "object-cover",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          ].filter(Boolean).join(" ")}
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
