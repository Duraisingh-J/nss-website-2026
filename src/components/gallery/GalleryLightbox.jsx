import React, { useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Calendar, Tag } from "lucide-react";

/**
 * GalleryLightbox
 * Full-screen modal viewer with keyboard navigation, dark navy aesthetic,
 * touch gestures, and authentic metadata presentation.
 */
export default function GalleryLightbox({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onPrev,
  onNext,
}) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const modalRef = useRef(null);

  const activeImage = images[currentIndex] || null;

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onPrev, onNext]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      onNext();
    } else if (diff < -50) {
      onPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen || !activeImage) return null;

  return (
    <div
      ref={modalRef}
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photograph Viewer"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop */}
      <div className="gallery-lightbox__backdrop" />

      {/* Top Header Bar */}
      <div
        className="gallery-lightbox__header"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gallery-lightbox__counter">
          <span>{currentIndex + 1}</span>
          <span className="opacity-50 mx-1">/</span>
          <span>{images.length}</span>
        </div>

        <button
          type="button"
          className="gallery-lightbox__btn gallery-lightbox__btn--close"
          onClick={onClose}
          aria-label="Close photo viewer (Escape)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        className="gallery-lightbox__stage"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            type="button"
            className="gallery-lightbox__arrow gallery-lightbox__arrow--prev"
            onClick={onPrev}
            aria-label="Previous photograph (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="gallery-lightbox__media-wrap">
          <img
            src={activeImage.url}
            alt={activeImage.title || "NSS MIT photograph"}
            className="gallery-lightbox__image"
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            className="gallery-lightbox__arrow gallery-lightbox__arrow--next"
            onClick={onNext}
            aria-label="Next photograph (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Metadata Bottom Card */}
      {(activeImage.title || activeImage.caption || activeImage.date || activeImage.category) && (
        <div
          className="gallery-lightbox__meta"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="gallery-lightbox__meta-tags">
            {activeImage.category && (
              <span className="gallery-lightbox__tag">
                <Tag className="w-3 h-3 inline mr-1 opacity-70" />
                {activeImage.category}
              </span>
            )}
            {activeImage.date && (
              <span className="gallery-lightbox__date">
                <Calendar className="w-3 h-3 inline mr-1 opacity-70" />
                {activeImage.date}
              </span>
            )}
          </div>

          {activeImage.title && (
            <h3 className="gallery-lightbox__title">{activeImage.title}</h3>
          )}

          {activeImage.caption && activeImage.caption !== activeImage.title && (
            <p className="gallery-lightbox__caption">{activeImage.caption}</p>
          )}
        </div>
      )}
    </div>
  );
}
