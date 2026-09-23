import React, { useState, useEffect, useCallback, useMemo } from "react";
import PageHero from "../components/ui/PageHero";
import Footer from "../components/Footer";
import GalleryMarqueeRow from "../components/gallery/GalleryMarqueeRow";
import GalleryShowcaseGrid from "../components/gallery/GalleryShowcaseGrid";
import GalleryLightbox from "../components/gallery/GalleryLightbox";
import {
  getGalleryImages,
  getGalleryEventsList,
  distributeGalleryRows,
} from "../services/galleryService";
import {
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Filter,
  Calendar,
  X,
} from "lucide-react";
import "./Gallery.css";

const CATEGORY_TABS = [
  { id: "activities", label: "Field Documentation" },
  { id: "events", label: "Special Camps & Drives" },
  { id: "sessions", label: "Campus Sessions" },
  { id: "team", label: "Team & Volunteers" },
  { id: "posters", label: "Posters & Creative" },
  { id: "all", label: "All Photos" },
];

// If there are fewer than 8 photos in a view, render a clean static card showcase
// so single or few photos are NEVER artificially duplicated across marquee rows!
const MARQUEE_MIN_COUNT = 8;

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("activities");
  const [selectedEventId, setSelectedEventId] = useState("all");

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGalleryImages();
      setImages(data || []);
    } catch (err) {
      console.error("Gallery fetch failed:", err);
      setError("Unable to load the gallery right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Extract unique events that possess photos
  const availableEvents = useMemo(() => {
    return getGalleryEventsList(images);
  }, [images]);

  // Apply filters
  const filteredImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    let result = images;

    // 1. If an event is selected from the dropdown, prioritize event filtering
    if (selectedEventId !== "all") {
      result = result.filter((img) => img.eventId === selectedEventId);
      return result;
    }

    // 2. Otherwise filter by organized category
    if (selectedCategory === "activities") {
      // Clean field documentation (camps, sessions, achievements) without passport headshots
      result = result.filter(
        (img) => img.group === "events" || img.group === "sessions" || img.group === "achievements"
      );
    } else if (selectedCategory === "events") {
      result = result.filter((img) => img.group === "events");
    } else if (selectedCategory === "sessions") {
      result = result.filter((img) => img.group === "sessions");
    } else if (selectedCategory === "team") {
      result = result.filter((img) => img.group === "team");
    } else if (selectedCategory === "posters") {
      result = result.filter((img) => img.group === "posters");
    }

    return result;
  }, [images, selectedCategory, selectedEventId]);

  // Check if we have enough distinct photos for a 2-row continuous marquee
  const isMarqueeMode = filteredImages.length >= MARQUEE_MIN_COUNT;

  // Distribute filtered images into EXACTLY TWO rows without duplicates
  const { row1, row2 } = useMemo(() => {
    if (!isMarqueeMode) return { row1: [], row2: [] };
    return distributeGalleryRows(filteredImages);
  }, [filteredImages, isMarqueeMode]);

  // Active event detail
  const activeEvent = useMemo(() => {
    if (selectedEventId === "all") return null;
    return availableEvents.find((e) => e.id === selectedEventId) || null;
  }, [selectedEventId, availableEvents]);

  // Reset event filter
  const handleClearEventFilter = () => {
    setSelectedEventId("all");
  };

  // Handle category tab click
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedEventId("all"); // Reset specific event when switching category
  };

  // Handle image click from any marquee row or showcase card
  const handleSelectImage = (img) => {
    const foundIdx = filteredImages.findIndex(
      (item) => item.id === img.id || item.url === img.url
    );
    setSelectedPhotoIndex(foundIdx !== -1 ? foundIdx : 0);
    setLightboxOpen(true);
  };

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) =>
      prev > 0 ? prev - 1 : filteredImages.length - 1
    );
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) =>
      prev < filteredImages.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="page-wrapper gallery-page">
      {/* ── 1. Compact Page Hero with Subtle Watermark ─────────── */}
      <PageHero
        watermark="GALLERY"
        eyebrow="NSS GALLERY"
        title="Visual Archive"
        description="A visual archive of NSS initiatives, field documentation, community outreach, and volunteer moments."
      />

      <main className="gallery-main-container">
        {/* ── 2. FILTER & CONTROLS TOOLBAR ─────────────────────── */}
        {!loading && !error && images.length > 0 && (
          <section className="gallery-controls-section" aria-label="Gallery Filters">
            <div className="gallery-controls-container">
              {/* Top Row: Category Pills & Motion Pause Button */}
              <div className="gallery-controls-header">
                {/* Category Pills */}
                <div className="gallery-category-tabs" role="tablist" aria-label="Photo categories">
                  {CATEGORY_TABS.map((tab) => {
                    const isActive = selectedEventId === "all" && selectedCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => handleCategorySelect(tab.id)}
                        className={`gallery-category-pill ${isActive ? "gallery-category-pill--active" : ""}`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row: Event Dropdown & Active Filter Badge */}
              <div className="gallery-controls-subbar">
                <div className="gallery-event-picker-wrap">
                  <label htmlFor="gallery-event-select" className="gallery-event-label">
                    <Filter className="w-3.5 h-3.5 text-red-600" />
                    <span>Filter by Event:</span>
                  </label>
                  <select
                    id="gallery-event-select"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="gallery-event-select"
                  >
                    <option value="all">All Events ({availableEvents.length})</option>
                    {availableEvents.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({evt.count} {evt.count === 1 ? "photo" : "photos"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Indicator & Active Event Tag */}
                <div className="gallery-status-indicator">
                  {activeEvent ? (
                    <span className="gallery-active-event-tag">
                      <Calendar className="w-3 h-3 text-red-600" />
                      <span className="truncate max-w-[280px]">{activeEvent.title}</span>
                      <button
                        type="button"
                        onClick={handleClearEventFilter}
                        className="gallery-active-event-clear"
                        aria-label="Clear event filter"
                        title="Show all activities"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null}

                  <span className="gallery-photo-count">
                    {filteredImages.length} {filteredImages.length === 1 ? "photograph" : "photographs"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── LOADING STATE: 2 Static Skeleton Strip Rows ──────── */}
        {loading && (
          <section className="gallery-marquee-section" aria-label="Loading Gallery">
            <div className="gallery-skeleton-container">
              <div className="gallery-skeleton-row" />
              <div className="gallery-skeleton-row" />
            </div>
          </section>
        )}

        {/* ── ERROR STATE: Retry Prompt ────────────────────────── */}
        {!loading && error && (
          <section className="gallery-status-container" role="alert">
            <div className="gallery-status-card">
              <div className="gallery-status-icon-wrap gallery-status-icon-wrap--error">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="gallery-status-title">Unable to load the gallery right now.</h2>
              <p className="gallery-status-text">
                Please check your network connection or try refreshing the visual archive.
              </p>
              <button
                type="button"
                onClick={fetchImages}
                className="gallery-btn-retry"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>Try Again</span>
              </button>
            </div>
          </section>
        )}

        {/* ── EMPTY STATE: No photos for chosen filter ─────────── */}
        {!loading && !error && filteredImages.length === 0 && (
          <section className="gallery-status-container">
            <div className="gallery-status-card">
              <div className="gallery-status-icon-wrap">
                <ImageIcon className="w-6 h-6 text-slate-500" />
              </div>
              <span className="gallery-status-badge">NO PHOTOGRAPHS FOUND</span>
              <h2 className="gallery-status-title">No images in this category yet</h2>
              <p className="gallery-status-text">
                Try selecting "Field Documentation" or another event to explore our photo archive.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("activities");
                  setSelectedEventId("all");
                }}
                className="gallery-btn-retry"
              >
                <span>View All Field Documentation</span>
              </button>
            </div>
          </section>
        )}

        {/* ── PRESENTATION MODE A: CLEAN SHOWCASE GRID (< 8 PHOTOS) ─ */}
        {/* If an event has 1 to 7 photos, each photo appears EXACTLY ONCE with no repetition! */}
        {!loading && !error && filteredImages.length > 0 && !isMarqueeMode && (
          <GalleryShowcaseGrid
            images={filteredImages}
            onSelectImage={handleSelectImage}
          />
        )}

        {/* ── PRESENTATION MODE B: EXACTLY TWO CONTINUOUS MOVING ROWS (>= 8 PHOTOS) ─ */}
        {/* Moves at CONSTANT speed across all categories with zero artificial duplicates */}
        {!loading && !error && filteredImages.length > 0 && isMarqueeMode && (
          <section
            className="gallery-marquee-section"
            aria-label="NSS MIT 2-Row Moving Photo Archive"
          >
            {/* Left and Right Edge Masks for seamless entrance / exit */}
            <div className="gallery-edge-mask gallery-edge-mask--left" aria-hidden="true" />
            <div className="gallery-edge-mask gallery-edge-mask--right" aria-hidden="true" />

            <div className="gallery-marquee-wrapper">
              {/* Row 1: Moves LEFT at constant 36px/sec speed */}
              <GalleryMarqueeRow
                images={row1}
                direction="left"
                isTeam={selectedCategory === "team"}
                onSelectImage={handleSelectImage}
                rowNumber={1}
              />

              {/* Row 2: Moves RIGHT at constant 36px/sec speed */}
              <GalleryMarqueeRow
                images={row2}
                direction="right"
                isTeam={selectedCategory === "team"}
                onSelectImage={handleSelectImage}
                rowNumber={2}
              />
            </div>
          </section>
        )}
      </main>

      {/* ── LIGHTBOX MODAL VIEWER ─────────────────────────────── */}
      <GalleryLightbox
        isOpen={lightboxOpen}
        images={filteredImages}
        currentIndex={selectedPhotoIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrevPhoto}
        onNext={handleNextPhoto}
      />

      {/* Global Footer (Preserved untouched) */}
      <Footer />
    </div>
  );
}
