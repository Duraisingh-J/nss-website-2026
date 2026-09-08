import React, { useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Reusable image component with graceful institutional fallback.
 * Prevents Cumulative Layout Shift (CLS) by maintaining aspect ratio containers
 * and guarantees that broken image icons never appear.
 */
export default function ImageWithFallback({
  src,
  alt = "NSS Activity",
  className,
  containerClassName,
  aspectRatio = "4/3",
  priority = false,
  fallbackLabel,
  category,
}) {
  const [hasError, setHasError] = useState(!src);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-100 border border-border/80 w-full",
        containerClassName
      )}
      style={{ aspectRatio }}
    >
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      ) : null}

      {/* Elegant institutional fallback state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/90 select-none">
          {/* Subtle civic watermark */}
          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary mb-3">
            <Camera className="w-5 h-5 text-primary opacity-80" strokeWidth={1.8} />
          </div>

          {category && (
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 rounded-full mb-2">
              {category}
            </span>
          )}

          <span className="font-sans font-bold text-base text-foreground max-w-[240px] line-clamp-2 leading-snug">
            {fallbackLabel || alt}
          </span>

          <span className="text-xs text-muted font-medium tracking-wide uppercase mt-1.5">
            NSS MIT Campus · Anna University
          </span>
        </div>
      )}
    </div>
  );
}
