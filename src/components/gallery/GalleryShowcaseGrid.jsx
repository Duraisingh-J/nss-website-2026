import React, { useState } from "react";
import { Camera, Calendar, Tag, Maximize2 } from "lucide-react";

/**
 * GalleryShowcaseGrid
 * Renders small sets of photographs (1 to 7 photos) in a clean, non-repeating,
 * centered editorial card showcase. Every photograph is displayed EXACTLY ONCE.
 */
export default function GalleryShowcaseGrid({ images = [], onSelectImage }) {
  if (!images || images.length === 0) return null;

  const count = images.length;
  let layoutModifier = "grid-multi";
  if (count === 1) layoutModifier = "single";
  else if (count === 2) layoutModifier = "dual";
  else if (count === 3) layoutModifier = "trio";

  return (
    <section
      className="gallery-showcase-section"
      aria-label="Photograph Showcase"
    >
      <div className={`gallery-showcase-container gallery-showcase-container--${layoutModifier}`}>
        {images.map((img, idx) => (
          <ShowcaseCard
            key={img.id || `showcase-${idx}`}
            image={img}
            isSingle={count === 1}
            isTeam={img.group === "team"}
            onClick={() => onSelectImage && onSelectImage(img)}
          />
        ))}
      </div>
    </section>
  );
}

function ShowcaseCard({ image, onClick, isSingle, isTeam }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`gallery-showcase-card ${isSingle ? "gallery-showcase-card--single" : ""} ${isTeam ? "gallery-showcase-card--team" : ""}`}>
      <button
        type="button"
        className="gallery-showcase-media"
        onClick={onClick}
        aria-label={image.title ? `View ${image.title} in full screen` : "View photograph in full screen"}
      >
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
            className={`gallery-showcase-img ${isLoaded ? "gallery-showcase-img--loaded" : ""}`}
          />
        ) : (
          <div className="gallery-tile__fallback">
            <Camera className="gallery-tile__fallback-icon" />
            <span className="gallery-tile__fallback-text">
              {image.category || "NSS MIT"}
            </span>
          </div>
        )}

        {/* Hover zoom indicator */}
        <div className="gallery-showcase-hover-hint">
          <Maximize2 className="w-4 h-4 text-white" />
          <span>Click to Enlarge</span>
        </div>
      </button>

      {/* Structured photo metadata */}
      <div className="gallery-showcase-info">
        <div className="gallery-showcase-meta-bar">
          {image.category && (
            <span className="gallery-showcase-tag">
              <Tag className="w-3 h-3 inline mr-1 opacity-80" />
              {image.category}
            </span>
          )}
          {image.date && (
            <span className="gallery-showcase-date">
              <Calendar className="w-3 h-3 inline mr-1 opacity-80" />
              {image.date}
            </span>
          )}
        </div>

        {image.title && (
          <h3 className="gallery-showcase-title">{image.title}</h3>
        )}

        {image.caption && image.caption !== image.title && (
          <p className="gallery-showcase-caption">{image.caption}</p>
        )}
      </div>
    </div>
  );
}
