import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "./LightboxModal.css";

/**
 * LightboxModal — Accessible, minimal image gallery modal
 */
export default function LightboxModal({ images = [], currentIndex = 0, onClose, onNavigate }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose && onClose();
      } else if (e.key === "ArrowRight") {
        if (images.length > 1 && onNavigate) {
          onNavigate((currentIndex + 1) % images.length);
        }
      } else if (e.key === "ArrowLeft") {
        if (images.length > 1 && onNavigate) {
          onNavigate((currentIndex - 1 + images.length) % images.length);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [images, currentIndex, onClose, onNavigate]);

  if (!images || images.length === 0 || currentIndex < 0 || currentIndex >= images.length) {
    return null;
  }

  const currentImg = images[currentIndex];
  const total = images.length;

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
              onClick={() => onNavigate((currentIndex - 1 + total) % total)}
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
              onClick={() => onNavigate((currentIndex + 1) % total)}
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
