import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "./LightboxModal.css";

/**
 * LightboxModal — Accessible, minimal image gallery modal
 */
export default function LightboxModal({
  isOpen = true,
  images = [],
  currentIndex = 0,
  onClose,
  onNavigate,
  onNext,
  onPrev,
}) {
  const active = Boolean(
    isOpen &&
    Array.isArray(images) &&
    images.length > 0 &&
    currentIndex >= 0 &&
    currentIndex < images.length
  );

  useEffect(() => {
    if (!active) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose && onClose();
      } else if (e.key === "ArrowRight") {
        if (images.length > 1) {
          if (onNavigate) {
            onNavigate((currentIndex + 1) % images.length);
          } else if (onNext) {
            onNext();
          }
        }
      } else if (e.key === "ArrowLeft") {
        if (images.length > 1) {
          if (onNavigate) {
            onNavigate((currentIndex - 1 + images.length) % images.length);
          } else if (onPrev) {
            onPrev();
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "";
    };
  }, [active, images, currentIndex, onClose, onNavigate, onNext, onPrev]);

  if (!active) {
    return null;
  }

  const currentImg = images[currentIndex];
  const total = images.length;

  const handlePrev = () => {
    if (onNavigate) {
      onNavigate((currentIndex - 1 + total) % total);
    } else if (onPrev) {
      onPrev();
    }
  };

  const handleNext = () => {
    if (onNavigate) {
      onNavigate((currentIndex + 1) % total);
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div
      className="nss-lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
    >
      <div className="nss-lightbox-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar */}
        <div className="nss-lightbox-topbar">
          <span className="nss-lightbox-counter">
            {currentIndex + 1} of {total}
          </span>
          <button
            type="button"
            className="nss-lightbox-close-btn"
            onClick={onClose}
            aria-label="Close image viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Image Stage */}
        <div className="nss-lightbox-stage">
          {total > 1 && (
            <button
              type="button"
              className="nss-lightbox-nav-btn nss-lightbox-prev"
              onClick={handlePrev}
              aria-label="Previous photograph"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="nss-lightbox-image-wrap">
            <img
              src={currentImg.url || currentImg}
              alt={currentImg.caption || `NSS photograph ${currentIndex + 1}`}
              className="nss-lightbox-image"
            />
            {currentImg.caption && (
              <div className="nss-lightbox-caption">
                <p>{currentImg.caption}</p>
              </div>
            )}
          </div>

          {total > 1 && (
            <button
              type="button"
              className="nss-lightbox-nav-btn nss-lightbox-next"
              onClick={handleNext}
              aria-label="Next photograph"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
