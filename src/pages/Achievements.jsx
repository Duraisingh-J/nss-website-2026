import React, { useState, useEffect, useMemo, useCallback } from "react";
import Footer from "../components/Footer";
import AchievementsCarousel from "../components/ui/AchievementsCarousel";
import { getPublicAchievements } from "../services/achievementService";
import {
  Award,
  Calendar,
  User,
  X,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import "./Achievements.css";

/**
 * Institutional Recognition Seal
 * Distinctive emblem inspired by academic rosettes & medals
 */
function RecognitionSeal({ category = "", className = "" }) {
  const isNational = /national/i.test(category);
  const isState = /state/i.test(category);
  const isUniversity = /university/i.test(category);

  const variantClass = isNational
    ? "recognition-seal--national"
    : isState
    ? "recognition-seal--state"
    : isUniversity
    ? "recognition-seal--university"
    : "recognition-seal--standard";

  return (
    <div className={`recognition-seal ${variantClass} ${className}`} aria-hidden="true">
      <div className="recognition-seal__disc">
        <svg viewBox="0 0 36 36" fill="none" className="recognition-seal__svg">
          <circle cx="18" cy="18" r="16.5" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2" opacity="0.45" />
          <circle cx="18" cy="18" r="13.5" stroke="currentColor" strokeWidth="1" opacity="0.8" />
          <circle cx="18" cy="18" r="11" fill="currentColor" fillOpacity="0.12" />
          <path
            d="M18 10.5L20 14.8L24.8 15.3L21.2 18.6L22.2 23.3L18 20.9L13.8 23.3L14.8 18.6L11.2 15.3L16 14.8L18 10.5Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeDetail, setActiveDetail] = useState(null);

  // Fetch published achievements from Supabase
  const loadAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicAchievements();
      setAchievements(data || []);
    } catch (err) {
      console.error("Public achievements fetch error:", err);
      setError(err?.message || "Unable to load achievements at this time.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Extract available years for filter pills
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    achievements.forEach((item) => {
      if (item.year && item.year !== "Archived") {
        yearsSet.add(item.year);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [achievements]);

  // Extract available categories
  const availableCategories = useMemo(() => {
    const catSet = new Set();
    achievements.forEach((item) => {
      if (item.category) {
        catSet.add(item.category);
      }
    });
    return Array.from(catSet).sort();
  }, [achievements]);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const matchYear = selectedYear === "all" || item.year === selectedYear;
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchYear && matchCategory;
    });
  }, [achievements, selectedYear, selectedCategory]);

  // Detail drawer index and navigation
  const currentDetailIndex = useMemo(() => {
    if (!activeDetail) return -1;
    return filteredAchievements.findIndex((item) => item.id === activeDetail.id);
  }, [activeDetail, filteredAchievements]);

  const handleNextDetail = useCallback(() => {
    if (currentDetailIndex >= 0 && currentDetailIndex < filteredAchievements.length - 1) {
      setActiveDetail(filteredAchievements[currentDetailIndex + 1]);
    }
  }, [currentDetailIndex, filteredAchievements]);

  const handlePrevDetail = useCallback(() => {
    if (currentDetailIndex > 0) {
      setActiveDetail(filteredAchievements[currentDetailIndex - 1]);
    }
  }, [currentDetailIndex, filteredAchievements]);

  // Keyboard navigation for drawer (ESC, Left, Right)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeDetail) return;
      if (e.key === "Escape") {
        setActiveDetail(null);
      } else if (e.key === "ArrowLeft") {
        handlePrevDetail();
      } else if (e.key === "ArrowRight") {
        handleNextDetail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDetail, handlePrevDetail, handleNextDetail]);

  return (
    <div className="achievements-page">
      {/* ── 1. Hero Header (Matching Events Page Header) ── */}
      <header className="achievements-hero">
        <div className="achievements-shell achievements-hero__shell">
          <div className="achievements-hero__content">
            <div className="achievements-hero__statement">
            Milestones <em>of distinction.</em>
            </div>
            <p>
              A record of recognition, impact, and achievements built through
              sustained NSS service at Madras Institute of Technology.
            </p>
          </div>
          <div className="achievements-hero__background-word" aria-hidden="true">
            ACHIEVEMENTS
          </div>
        </div>
      </header>

      {/* ── 2. Content Experience (Clean White Background) ── */}
      <main className="achievements-main">
        <div className="achievements-shell">
          {/* Redesigned Elevated Filter Toolbar */}
          {achievements.length > 0 && (availableYears.length > 1 || availableCategories.length > 1) && (
            <div className="achievements-filters-toolbar" role="toolbar" aria-label="Archive filters">
              <div className="achievements-filters-groups">
                {/* Academic Year Segmented Control */}
                {availableYears.length > 1 && (
                  <div className="achievements-filter-section">
                    <span className="achievements-filter-label">Year</span>
                    <div className="achievements-segment-track">
                      <button
                        type="button"
                        className={`achievements-segment-btn ${selectedYear === "all" ? "achievements-segment-btn--active" : ""}`}
                        onClick={() => setSelectedYear("all")}
                      >
                        All
                      </button>
                      {availableYears.map((year) => (
                        <button
                          key={year}
                          type="button"
                          className={`achievements-segment-btn ${selectedYear === year ? "achievements-segment-btn--active" : ""}`}
                          onClick={() => setSelectedYear(year)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider between year and category */}
                {availableYears.length > 1 && availableCategories.length > 1 && (
                  <div className="achievements-filter-sep" aria-hidden="true" />
                )}

                {/* Category Chips */}
                {availableCategories.length > 1 && (
                  <div className="achievements-filter-section">
                    <span className="achievements-filter-label">Category</span>
                    <div className="achievements-chips-track">
                      <button
                        type="button"
                        className={`achievements-chip-btn ${selectedCategory === "all" ? "achievements-chip-btn--active" : ""}`}
                        onClick={() => setSelectedCategory("all")}
                      >
                        All
                      </button>
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`achievements-chip-btn ${selectedCategory === cat ? "achievements-chip-btn--active" : ""}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Meta actions (Reset & Record counter) */}
              <div className="achievements-filters-meta">
                {(selectedYear !== "all" || selectedCategory !== "all") && (
                  <button
                    type="button"
                    className="achievements-reset-filter-btn"
                    onClick={() => {
                      setSelectedYear("all");
                      setSelectedCategory("all");
                    }}
                    title="Reset filters to All"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                )}
                <span className="achievements-count-badge">
                  <strong>{filteredAchievements.length}</strong> {filteredAchievements.length === 1 ? "Record" : "Records"}
                </span>
              </div>
            </div>
          )}

          {/* ── 3. Content States (Strictly Data-Driven) ── */}
          {loading ? (
            <div className="achievements-loading" aria-label="Loading achievements archive">
              <div className="achievements-loading__entry">
                <div className="achievements-loading__num" />
                <div className="achievements-loading__body" />
              </div>
              <div className="achievements-loading__entry">
                <div className="achievements-loading__num" />
                <div className="achievements-loading__body" />
              </div>
            </div>
          ) : error ? (
            <div className="achievements-error" role="alert">
              <div className="achievements-error__icon-wrap">
                <AlertCircle size={28} />
              </div>
              <h3 className="achievements-error__title">Unable to load achievements right now.</h3>
              <p className="achievements-error__desc">{error}</p>
              <button
                type="button"
                className="achievements-retry-btn"
                onClick={loadAchievements}
              >
                <RotateCcw size={14} /> Try Again
              </button>
            </div>
          ) : achievements.length === 0 ? (
            /* ── Genuine Institutional Empty State ── */
            <div className="achievements-empty" aria-label="Achievements archive status">
              <div className="achievements-empty__inner">
                <div className="achievements-empty__seal-wrap">
                  <RecognitionSeal className="recognition-seal--hero" />
                </div>
                <span className="achievements-empty__badge">ACHIEVEMENT ARCHIVE</span>
                <h3 className="achievements-empty__title">The record begins here.</h3>
                <p className="achievements-empty__desc">
                  New recognitions, state honours, university citations, and community milestones will appear in this public archive as the NSS journey continues.
                </p>
                <div className="achievements-empty__footer-line">
                  <span>Official repository maintained by National Service Scheme, MIT Campus, Anna University.</span>
                </div>
              </div>
            </div>
          ) : filteredAchievements.length === 0 ? (
            /* Filter produced no matches */
            <div className="achievements-no-matches" aria-label="No matches found">
              <p className="achievements-no-matches__desc">No achievements match the selected filter criteria.</p>
              <button
                type="button"
                className="achievements-reset-btn"
                onClick={() => {
                  setSelectedYear("all");
                  setSelectedCategory("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* ── Interactive Spotlight Carousel Showcase (Only Stored Records) ── */
            <AchievementsCarousel
              achievements={filteredAchievements}
              onSelectAchievement={(item) => setActiveDetail(item)}
            />
          )}
        </div>
      </main>

      {/* ── 4. Redesigned Premium Exhibition Detail Modal ── */}
      {activeDetail && (
        <div
          className="achievement-drawer-overlay"
          onClick={() => setActiveDetail(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Achievement details"
        >
          <div
            className="achievement-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Topbar with Nav Controls & Close */}
            <div className="achievement-drawer__topbar">
              <div className="achievement-drawer__nav">
                <button
                  type="button"
                  className="achievement-drawer__nav-btn"
                  onClick={handlePrevDetail}
                  disabled={currentDetailIndex <= 0}
                  aria-label="Previous achievement (Left arrow)"
                  title="Previous achievement"
                >
                  <ArrowLeft size={15} />
                </button>
                <div className="achievement-drawer__counter">
                  <span className="achievement-drawer__counter-dot" />
                  <span>{currentDetailIndex + 1} OF {filteredAchievements.length}</span>
                </div>
                <button
                  type="button"
                  className="achievement-drawer__nav-btn"
                  onClick={handleNextDetail}
                  disabled={currentDetailIndex >= filteredAchievements.length - 1}
                  aria-label="Next achievement (Right arrow)"
                  title="Next achievement"
                >
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="achievement-drawer__topbar-right">
                <span className="achievement-drawer__category-badge">
                  <Award size={12} />
                  {activeDetail.category || "HONOUR"}
                </span>
                <button
                  type="button"
                  className="achievement-drawer__close-btn"
                  onClick={() => setActiveDetail(null)}
                  aria-label="Close detail panel (ESC)"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div className="achievement-drawer__scrollable">
              {/* Cinematic Image Showcase */}
              <div className="achievement-drawer__image-showcase">
                {activeDetail.imageUrl ? (
                  <img
                    src={activeDetail.imageUrl}
                    alt={activeDetail.title}
                    className="achievement-drawer__image"
                  />
                ) : (
                  <div className="achievement-drawer__image-fallback">
                    <img
                      src={`${process.env.PUBLIC_URL}/images/NSS_logo.png`}
                      alt="National Service Scheme"
                      className="achievement-drawer__image-fallback-logo"
                      onError={(e) => {
                        if (!e.currentTarget.dataset.fallback) {
                          e.currentTarget.dataset.fallback = "true";
                          e.currentTarget.src = `${process.env.PUBLIC_URL}/NSS_logo.png`;
                        }
                      }}
                    />
                    <span className="achievement-drawer__image-fallback-text">
                      National Service Scheme · MIT Campus
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Metadata Badges */}
              <div className="achievement-drawer__header-block">
                {activeDetail.formattedDate && activeDetail.formattedDate !== "—" && (
                  <div className="achievement-drawer__date-row">
                    <Calendar size={13} />
                    <span>Conferred: {activeDetail.formattedDate}</span>
                  </div>
                )}
                <h2 className="achievement-drawer__title">{activeDetail.title}</h2>
              </div>

              {/* Conferred Recipient Card */}
              {activeDetail.personName && (
                <div className="achievement-drawer__recipient-card">
                  <div className="achievement-drawer__recipient-avatar">
                    <User size={18} />
                  </div>
                  <div className="achievement-drawer__recipient-info">
                    <span className="achievement-drawer__recipient-label">HONOUR RECIPIENT</span>
                    <h3 className="achievement-drawer__recipient-name">{activeDetail.personName}</h3>
                    {activeDetail.personDesignation && (
                      <p className="achievement-drawer__recipient-designation">{activeDetail.personDesignation}</p>
                    )}
                    {activeDetail.personUnit && (
                      <span className="achievement-drawer__recipient-unit">{activeDetail.personUnit}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Citation Details */}
              <div className="achievement-drawer__citation-block">
                <div className="achievement-drawer__citation-header">
                  <span className="achievement-drawer__citation-dot" />
                  <h4 className="achievement-drawer__citation-title">CITATION & RECOGNITION DETAILS</h4>
                </div>
                <p className="achievement-drawer__citation-text">
                  {activeDetail.description || "Official milestone awarded by the National Service Scheme in recognition of exceptional service and social development."}
                </p>
              </div>

              {/* Institutional Accreditation Footnote with Official Colored NSS Logo */}
              <div className="achievement-drawer__footnote">
                <img
                  src={`${process.env.PUBLIC_URL}/images/NSS_logo.png`}
                  alt="National Service Scheme Emblem"
                  className="achievement-drawer__emblem"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallback) {
                      e.currentTarget.dataset.fallback = "true";
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/NSS_logo.png`;
                    }
                  }}
                />
                <div className="achievement-drawer__footnote-text">
                  <strong>National Service Scheme</strong>
                  <span>Madras Institute of Technology Campus · Anna University, Chennai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Public Footer ── */}
      <Footer />
    </div>
  );
}
