import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./DepthCarousel.css";

/**
 * DepthCarousel
 * React Bits 3D Depth Carousel adapted for NSS MIT Anna University.
 * Features bilateral symmetrical 3D depth positioning ([BACK] [ACTIVE] [BACK]),
 * perspective, tilt, drag, wheel, controls & indicators.
 */
export default function DepthCarousel({
  items = [],
  cardWidth = 280,
  cardHeight = 370,
  radius = 12,
  depth = 120,
  spread = 145,
  tilt = 9,
  perspective = 1400,
  visibleCards = 5,
  falloff = 0.14,
  blur = 2,
  duration = 0.6,
  ease = "power3.out",
  autoplay = false,
  autoplayDelay = 5000,
  loop = true,
  showControls = true,
  showIndicators = true,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  className = "",
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const total = items.length;
  const viewportRef = useRef(null);
  const cardRefs = useRef([]);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragDeltaX = useRef(0);
  const wheelLock = useRef(false);
  const autoplayTimer = useRef(null);

  // Responsive state
  const [responsiveConfig, setResponsiveConfig] = useState({
    spread,
    depth,
    tilt,
    visibleCards,
  });

  // Keep ref array length synced
  cardRefs.current = cardRefs.current.slice(0, total);

  // Handle index updates
  const updateIndex = useCallback(
    (newIndex) => {
      let target = newIndex;
      if (loop) {
        target = ((target % total) + total) % total;
      } else {
        target = Math.max(0, Math.min(total - 1, target));
      }

      if (controlledIndex === undefined) {
        setInternalIndex(target);
      }
      if (onActiveIndexChange) {
        onActiveIndexChange(target);
      }
    },
    [controlledIndex, loop, onActiveIndexChange, total]
  );

  const next = useCallback(() => {
    if (total <= 1) return;
    updateIndex(activeIndex + 1);
  }, [activeIndex, total, updateIndex]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    updateIndex(activeIndex - 1);
  }, [activeIndex, total, updateIndex]);

  // Responsive adjustments for mobile / tablet / desktop
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setResponsiveConfig({
          spread: Math.min(spread, 26),
          depth: Math.min(depth, 55),
          tilt: Math.min(tilt, 4),
          visibleCards: Math.min(visibleCards, 2),
        });
      } else if (width <= 768) {
        setResponsiveConfig({
          spread: Math.min(spread, 65),
          depth: Math.min(depth, 75),
          tilt: Math.min(tilt, 6),
          visibleCards: Math.min(visibleCards, 3),
        });
      } else if (width <= 1024) {
        setResponsiveConfig({
          spread: Math.min(spread, 105),
          depth: Math.min(depth, 95),
          tilt: Math.min(tilt, 7),
          visibleCards: Math.min(visibleCards, 3),
        });
      } else {
        setResponsiveConfig({
          spread,
          depth,
          tilt,
          visibleCards,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [spread, depth, tilt, visibleCards]);

  // Bilateral 3D positioning with GSAP
  useEffect(() => {
    if (!total || !viewportRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const animDuration = prefersReducedMotion ? 0 : duration;

    const {
      spread: curSpread,
      depth: curDepth,
      tilt: curTilt,
      visibleCards: curVisible,
    } = responsiveConfig;

    const maxWing = Math.floor(curVisible / 2); // e.g. 2 wings on each side for visibleCards=5

    cardRefs.current.forEach((cardEl, i) => {
      if (!cardEl) return;

      // Calculate relative difference around activeIndex
      let diff;
      if (total === 2) {
        diff = i === activeIndex ? 0 : 1;
      } else {
        diff = (i - activeIndex) % total;
        if (diff < -Math.floor(total / 2)) {
          diff += total;
        } else if (diff > Math.floor((total - 1) / 2)) {
          diff -= total;
        }
      }

      const tintEl = cardEl.querySelector(".depth-carousel__card-tint");
      const absDiff = Math.abs(diff);

      if (diff === 0) {
        // ACTIVE CARD: Front and center
        gsap.to(cardEl, {
          x: 0,
          y: 0,
          z: 0,
          rotationY: 0,
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          zIndex: 10,
          pointerEvents: "auto",
          duration: animDuration,
          ease,
          overwrite: "auto",
        });

        if (tintEl) {
          gsap.to(tintEl, { opacity: 0, duration: animDuration });
        }
      } else if (absDiff <= maxWing) {
        // VISIBLE WINGS: Flanking cards peeking out on left and right
        const direction = diff > 0 ? 1 : -1;
        const multiplier = absDiff === 1 ? 1 : 1.65;
        const xVal = direction * curSpread * multiplier;
        const zVal = -curDepth * (absDiff === 1 ? 1 : 1.85);
        const rotYVal = -direction * curTilt * (absDiff === 1 ? 1 : 1.3);
        const scaleVal = Math.max(0.74, 1 - falloff * absDiff);
        const blurVal = blur * (absDiff === 1 ? 1 : 1.6);
        const tintOpacity = absDiff === 1 ? 0.2 : 0.4;

        gsap.to(cardEl, {
          x: xVal,
          y: 0,
          z: zVal,
          rotationY: rotYVal,
          scale: scaleVal,
          opacity: 1,
          filter: `blur(${blurVal}px)`,
          zIndex: 10 - absDiff * 2,
          pointerEvents: "auto",
          duration: animDuration,
          ease,
          overwrite: "auto",
        });

        if (tintEl) {
          gsap.to(tintEl, { opacity: tintOpacity, duration: animDuration });
        }
      } else {
        // HIDDEN REAR CARDS
        const direction = diff > 0 ? 1 : -1;
        gsap.to(cardEl, {
          x: direction * curSpread * (maxWing + 0.8),
          y: 0,
          z: -curDepth * (maxWing + 1.5),
          rotationY: -direction * curTilt * 1.5,
          scale: 0.68,
          opacity: 0,
          filter: `blur(${blur * 2.5}px)`,
          zIndex: 1,
          pointerEvents: "none",
          duration: animDuration,
          ease,
          overwrite: "auto",
        });
      }
    });
  }, [
    activeIndex,
    total,
    responsiveConfig,
    falloff,
    blur,
    duration,
    ease,
  ]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || total <= 1) return;

    autoplayTimer.current = setInterval(() => {
      next();
    }, autoplayDelay);

    return () => clearInterval(autoplayTimer.current);
  }, [autoplay, autoplayDelay, next, total]);

  const pauseAutoplay = () => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
  };

  const resumeAutoplay = () => {
    if (autoplay && total > 1) {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      autoplayTimer.current = setInterval(next, autoplayDelay);
    }
  };

  // Mouse wheel navigation with debounce lock
  const handleWheel = (e) => {
    if (wheelLock.current || total <= 1) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 25) return;

    wheelLock.current = true;
    if (delta > 0) {
      next();
    } else {
      prev();
    }

    setTimeout(() => {
      wheelLock.current = false;
    }, 450);
  };

  // Drag / Swipe interactions
  const handlePointerDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragDeltaX.current = 0;
    pauseAutoplay();
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragDeltaX.current = clientX - dragStartX.current;
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    resumeAutoplay();

    const threshold = 35;
    if (dragDeltaX.current < -threshold) {
      next();
    } else if (dragDeltaX.current > threshold) {
      prev();
    }
    dragDeltaX.current = 0;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={`depth-carousel ${className}`}
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="People 3D Carousel"
    >
      {/* 3D Viewport */}
      <div
        ref={viewportRef}
        className="depth-carousel__viewport"
        style={{ perspective: `${perspective}px` }}
        onWheel={handleWheel}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <div className="depth-carousel__stage">
          {items.map((item, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={item.id || item.name || idx}
                ref={(el) => (cardRefs.current[idx] = el)}
                className={`depth-carousel__card ${
                  isActive ? "depth-carousel__card--active" : ""
                }`}
                style={{
                  borderRadius: `${radius}px`,
                }}
                onClick={() => {
                  if (!isActive) updateIndex(idx);
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${item.name} (${idx + 1} of ${total})`}
                aria-current={isActive ? "true" : "false"}
              >
                {/* Media representation */}
                <div className="depth-carousel__card-media">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || "Profile Photo"}
                      className="depth-carousel__card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="depth-carousel__card-initials">
                      {item.initials ||
                        (item.name
                          ? item.name
                              .split(" ")
                              .map((n) => n[0])
                              .filter(Boolean)
                              .slice(0, 2)
                              .join("")
                          : "NSS")}
                    </div>
                  )}

                  {/* Role or Unit Badge */}
                  {item.badge && (
                    <div
                      className={`depth-carousel__card-badge ${
                        item.badge.includes("PO") || item.badge.includes("Unit")
                          ? "depth-carousel__card-badge--accent"
                          : ""
                      }`}
                    >
                      {item.badge}
                    </div>
                  )}

                  {/* Gradient & subtle name preview on non-active cards */}
                  <div className="depth-carousel__card-gradient" />
                  {!isActive && (
                    <div className="depth-carousel__card-caption">
                      <div className="depth-carousel__card-caption-name">
                        {item.name}
                      </div>
                    </div>
                  )}

                  {/* Navy Depth Tint Overlay */}
                  <div className="depth-carousel__card-tint" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && total > 1 && (
        <div className="depth-carousel__controls">
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            onClick={prev}
            aria-label="Previous person"
          >
            <ChevronLeft />
          </button>

          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            onClick={next}
            aria-label="Next person"
          >
            <ChevronRight />
          </button>
        </div>
      )}

      {/* Indicator Dots */}
      {showIndicators && total > 1 && (
        <div
          className="depth-carousel__indicators"
          role="tablist"
          aria-label="Carousel Slides"
        >
          {items.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              role="tab"
              aria-selected={dotIdx === activeIndex}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`depth-carousel__indicator ${
                dotIdx === activeIndex
                  ? "depth-carousel__indicator--active"
                  : ""
              }`}
              onClick={() => updateIndex(dotIdx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
