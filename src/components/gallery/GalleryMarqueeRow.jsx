import React, { useState, useMemo } from "react";
import { Camera, Calendar, Tag } from "lucide-react";

// Linear speed in pixels per second. Every marquee row will move at this exact speed!
const CONSTANT_SPEED_PX_PER_SEC = 36;
const TILE_WIDTH_WITH_GAP_PX = 368;
const TEAM_TILE_WIDTH_WITH_GAP_PX = 224; // 260px height * (4/5) + 16px gap = ~224px

/**
 * GalleryMarqueeRow
 * A single horizontal continuous image marquee track moving in a specified direction.
 * Uses Sequence A + Sequence B for seamless linear looping.
 *
 * CRITICAL FIXES:
 * 1. NO artificial repetition inside Sequence A: every image appears EXACTLY ONCE.
 * 2. Constant linear speed across all rows and all filters: duration is computed
 *    from the actual track width so velocity is identical everywhere.
 * 3. Team & Volunteers portrait sizing: displays full portrait without cutting heads/faces.
 */
export default function GalleryMarqueeRow({
  images = [],
  direction = "left",
  isPaused = false,
  isTeam = false,
  onSelectImage,
  rowNumber = 1,
}) {
  const count = images?.length || 0;
  const tileWidth = isTeam ? TEAM_TILE_WIDTH_WITH_GAP_PX : TILE_WIDTH_WITH_GAP_PX;

  // Compute dynamic duration to keep speed strictly constant across any number of items
  const dynamicDuration = useMemo(() => {
    const totalRowWidth = count * tileWidth;
    const seconds = Math.round(totalRowWidth / CONSTANT_SPEED_PX_PER_SEC);
    return Math.max(20, seconds);
  }, [count, tileWidth]);

  // If there are no images, do not render
  if (!images || images.length === 0) return null;

  return (
    <div
      className={`gallery-marquee-row gallery-marquee-row--${direction} ${isPaused ? "gallery-marquee-row--paused" : ""} ${isTeam ? "gallery-marquee-row--team" : ""}`}
      role="region"
      aria-label={`Gallery Row ${rowNumber} moving ${direction}`}
    >
      <div
        className="gallery-marquee-track"
        style={{
          animationDuration: `${dynamicDuration}s`,
          animationDirection: direction === "right" ? "reverse" : "normal",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {/* Sequence A (Each image rendered exactly once) */}
        <div className="gallery-marquee-group" aria-hidden="false">
          {images.map((img, idx) => (
            <GalleryTile
              key={`row${rowNumber}-a-${img.id || idx}`}
              image={img}
              isTeam={isTeam || img.group === "team"}
              onClick={() => onSelectImage && onSelectImage(img)}
            />
          ))}
        </div>

        {/* Sequence B (Identical duplicate for seamless continuous looping) */}
        <div className="gallery-marquee-group" aria-hidden="true">
          {images.map((img, idx) => (
            <GalleryTile
              key={`row${rowNumber}-b-${img.id || idx}`}
              image={img}
              isTeam={isTeam || img.group === "team"}
              onClick={() => onSelectImage && onSelectImage(img)}
              tabIndex={-1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Single cinematic photo tile with image loading state and hover overlay
 */
function GalleryTile({ image, isTeam = false, onClick, tabIndex = 0 }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isPortrait = isTeam || image.group === "team";

  return (
    <button
      type="button"
      className={`gallery-tile ${isPortrait ? "gallery-tile--team" : ""}`}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={image.title ? `View ${image.title}` : "View photograph"}
    >
      <div className="gallery-tile__inner">
        {/* Shimmer Placeholder while loading */}
        {!isLoaded && !hasError && (
          <div className="gallery-tile__skeleton" aria-hidden="true" />
        )}

        {!hasError && image.url ? (
          <img
            src={image.url}
            alt={image.title || "NSS MIT photograph"}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            className={`gallery-tile__img ${isPortrait ? "gallery-tile__img--team" : ""} ${isLoaded ? "gallery-tile__img--loaded" : ""}`}
          />
        ) : (
          <div className="gallery-tile__fallback">
            <Camera className="gallery-tile__fallback-icon" />
            <span className="gallery-tile__fallback-text">
              {image.category || "NSS MIT"}
            </span>
          </div>
        )}

        {/* Subtle Hover Overlay with authentic details */}
        <div className="gallery-tile__overlay">
          <div className="gallery-tile__overlay-content">
            {image.category && (
              <span className="gallery-tile__tag">
                <Tag className="w-2.5 h-2.5 inline mr-1 opacity-70" />
                {image.category}
              </span>
            )}
            {image.title && (
              <h3 className="gallery-tile__title">{image.title}</h3>
            )}
            {image.date && (
              <span className="gallery-tile__date">
                <Calendar className="w-2.5 h-2.5 inline mr-1 opacity-70" />
                {image.date}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
