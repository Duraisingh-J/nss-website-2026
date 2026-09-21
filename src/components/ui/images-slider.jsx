import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export const ImagesSlider = ({
  images = [],
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
  direction = "up",
  interval = 5000,
  onIndexChange,
  showDots = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const touchStartXRef = useRef(null);

  // Normalize images to array of { url, altText }
  const normalizedImages = React.useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) return [];
    return images.map((img, idx) => {
      if (typeof img === "string") {
        return { url: img, altText: `NSS Hero Slide ${idx + 1}` };
      }
      return {
        url: img.url || "",
        altText: img.altText || `NSS Hero Slide ${idx + 1}`,
      };
    }).filter((img) => Boolean(img.url));
  }, [images]);

  const totalImages = normalizedImages.length;

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  // Preload next images in background
  useEffect(() => {
    if (totalImages <= 1) return;
    normalizedImages.forEach((img) => {
      const image = new Image();
      image.src = img.url;
    });
  }, [normalizedImages, totalImages]);

  // Next Slide Handler
  const handleNext = useCallback(() => {
    if (totalImages <= 1) return;
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1 === totalImages ? 0 : prevIndex + 1;
      if (onIndexChange) onIndexChange(nextIndex);
      return nextIndex;
    });
  }, [totalImages, onIndexChange]);

  // Previous Slide Handler
  const handlePrev = useCallback(() => {
    if (totalImages <= 1) return;
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 1 < 0 ? totalImages - 1 : prevIndex - 1;
      if (onIndexChange) onIndexChange(nextIndex);
      return nextIndex;
    });
  }, [totalImages, onIndexChange]);

  // Handle Tab Visibility (Pause on background tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Autoplay Interval
  useEffect(() => {
    if (!autoplay || totalImages <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, totalImages, isPaused, interval, handleNext]);

  // Keyboard navigation when focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext(); // swiped left -> next
      } else {
        handlePrev(); // swiped right -> prev
      }
    }
    touchStartXRef.current = null;
  };

  // Animation variants supporting smooth horizontal drift & cinematic dissolve
  const slideVariants = {
    initial: prefersReducedMotion
      ? { opacity: 0 }
      : {
          scale: 1.05,
          opacity: 0,
          x: direction === "fade" ? 14 : direction === "up" ? 0 : -14,
          y: direction === "up" ? "6%" : 0,
        },
    visible: {
      scale: 1,
      opacity: 1,
      x: 0,
      y: "0%",
      transition: {
        duration: prefersReducedMotion ? 0.6 : 1.4,
        ease: [0.16, 1, 0.3, 1], // cinematic cubic-bezier
      },
    },
    exit: prefersReducedMotion
      ? { opacity: 0, transition: { duration: 0.6 } }
      : {
          scale: 0.98,
          opacity: 0,
          x: direction === "fade" ? -14 : direction === "up" ? 0 : 14,
          y: direction === "up" ? "-6%" : 0,
          transition: {
            duration: 1.1,
            ease: [0.16, 1, 0.3, 1],
          },
        },
  };

  const currentImage = normalizedImages[currentIndex] || null;

  return (
    <div
      className={cn(
        "relative overflow-hidden w-full flex items-center justify-center bg-slate-950",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="Image Slideshow"
    >
      {/* ── Background Slideshow Animation Layer ──────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {totalImages > 0 && currentImage ? (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={currentImage.url + currentIndex}
              src={currentImage.url}
              alt={currentImage.altText}
              initial={slideVariants.initial}
              animate={slideVariants.visible}
              exit={slideVariants.exit}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading={currentIndex === 0 ? "eager" : "lazy"}
            />
          </AnimatePresence>
        ) : (
          /* Graceful Fallback for 0 images */
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                NSS MIT
              </span>
            </div>
          </div>
        )}

        {/* ── Overlay Tint & Vignette Fades ────────────────────── */}
        {overlay && (
          <div
            className={cn(
              "absolute inset-0 bg-slate-950/45 backdrop-brightness-[0.82]",
              overlayClassName
            )}
          />
        )}

        {/* Soft edge fades for seamless typography readability */}
        <div className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-32 sm:w-80 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-24 sm:w-56 bg-gradient-to-l from-slate-950/50 via-slate-950/15 to-transparent" />
      </div>

      {/* ── Content Overlay Layer (Children stay stable) ───────── */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        {children}
      </div>

      {/* ── Subtle Slideshow Indicator Dots ───────────────────── */}
      {showDots && totalImages > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10"
          role="tablist"
          aria-label="Slideshow slide navigation"
        >
          {normalizedImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={currentIndex === idx}
              aria-label={`Go to slide ${idx + 1}: ${img.altText}`}
              onClick={() => {
                setCurrentIndex(idx);
                if (onIndexChange) onIndexChange(idx);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
                currentIndex === idx
                  ? "w-6 bg-[#D94B4B]"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
