import React, { useState, useEffect, useMemo, useCallback } from "react";
import PageHero from "../components/ui/PageHero";
import Footer from "../components/Footer";
import { getPublicAchievements } from "../services/achievementService";
import {
  Award,
  Calendar,
  User,
  X,
  ArrowRight,
  ArrowLeft,
  Shield,
  RotateCcw,
  AlertCircle,
  Sparkles,
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

  // Group filtered achievements chronologically by year
  const groupedByYear = useMemo(() => {
    const groups = {};
    filteredAchievements.forEach((item) => {
      const yearKey = item.year || "Archived";
      if (!groups[yearKey]) {
        groups[yearKey] = [];
      }
      groups[yearKey].push(item);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "Archived") return 1;
      if (b === "Archived") return -1;
      return b.localeCompare(a);
    });

    return sortedKeys.map((year) => ({
      year,
      items: groups[year],
    }));
  }, [filteredAchievements]);

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
      {/* ── 1. Shared Editorial Hero ── */}
      <PageHero
        watermark="ACHIEVEMENTS"
        eyebrow="NSS ACHIEVEMENTS"
        title="Achievements"
        description="Recognising the milestones, contributions, and accomplishments that shape the NSS journey at MIT."
      />

      {/* ── 2. Content Experience ── */}
      <main className="achievements-main">
        <div className="achievements-shell">
          {/* Editorial Section Introduction */}
          <header className="achievements-header">
            <div className="achievements-header__titles">
              <span className="achievements-header__eyebrow">NSS RECOGNITION ARCHIVE</span>
              <h2 className="achievements-header__title">Milestones of Distinction</h2>
              <p className="achievements-header__lead">
                An institutional archive chronicling state awards, university citations, and community service honours conferred upon National Service Scheme volunteers and units at Madras Institute of Technology, Anna University.
              </p>
            </div>

            {/* Filter Pills — only rendered when real achievements exist and options are multiple */}
            {achievements.length > 0 && (availableYears.length > 1 || availableCategories.length > 1) && (
              <div className="achievements-filters" role="toolbar" aria-label="Archive filters">
                {availableYears.length > 1 && (
                  <div className="achievements-pill-group">
                    <span className="achievements-pill-group__caption">YEAR</span>
                    <button
                      type="button"
                      className={`achievements-pill ${selectedYear === "all" ? "achievements-pill--active" : ""}`}
                      onClick={() => setSelectedYear("all")}
                    >
                      All
                    </button>
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        className={`achievements-pill ${selectedYear === year ? "achievements-pill--active" : ""}`}
                        onClick={() => setSelectedYear(year)}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}

                {availableCategories.length > 1 && (
                  <div className="achievements-pill-group">
                    <span className="achievements-pill-group__caption">CATEGORY</span>
                    <button
                      type="button"
                      className={`achievements-pill ${selectedCategory === "all" ? "achievements-pill--active" : ""}`}
                      onClick={() => setSelectedCategory("all")}
                    >
                      All
                    </button>
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`achievements-pill ${selectedCategory === cat ? "achievements-pill--active" : ""}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </header>

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
            /* ── Genuine Institutional Empty State (Section 30) ── */
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
            /* ── 4. Editorial Broadsheet Archive ── */
            <div className="achievements-archive">
              {groupedByYear.map((group) => (
                <section key={group.year} className="achievements-year-section" aria-label={`Archive ${group.year}`}>
                  {/* Year Divider */}
                  <div className="achievements-year-divider">
                    <span className="achievements-year-divider__year">{group.year}</span>
                    <div className="achievements-year-divider__line" />
                    <span className="achievements-year-divider__count">
                      {group.items.length} {group.items.length === 1 ? "RECORD" : "RECORDS"}
                    </span>
                  </div>

                  {/* Editorial Entry Rows */}
                  <div className="achievements-entries">
                    {group.items.map((item, itemIdx) => {
                      const displayIndex = String(itemIdx + 1).padStart(2, "0");
                      const isSelected = activeDetail?.id === item.id;

                      return (
                        <article
                          key={item.id}
                          className={`achievement-entry ${isSelected ? "achievement-entry--active" : ""}`}
                          onClick={() => setActiveDetail(item)}
                          tabIndex={0}
                          role="button"
                          aria-label={`View recognition for ${item.title}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActiveDetail(item);
                            }
                          }}
                        >
                          {/* Accent Marker line */}
                          <div className="achievement-entry__marker-line" aria-hidden="true" />

                          {/* Left Column: Number, Seal & Year */}
                          <div className="achievement-entry__left">
                            <span className="achievement-entry__index">{displayIndex}</span>
                            <RecognitionSeal category={item.category} />
                            <span className="achievement-entry__year-tag">{item.year || group.year}</span>
                          </div>

                          {/* Center Column: Recognition Content */}
                          <div className="achievement-entry__main">
                            <div className="achievement-entry__eyebrow-row">
                              <span className="achievement-entry__category">
                                <Award size={13} />
                                {item.category || "RECOGNITION"}
                              </span>
                              {item.formattedDate && item.formattedDate !== "—" && (
                                <span className="achievement-entry__date">
                                  <Calendar size={13} />
                                  {item.formattedDate}
                                </span>
                              )}
                              {item.unitLabel && (
                                <span className="achievement-entry__unit-tag">
                                  <Shield size={12} />
                                  {item.unitLabel}
                                </span>
                              )}
                            </div>

                            <h3 className="achievement-entry__title">{item.title}</h3>

                            {item.description && (
                              <p className="achievement-entry__desc">{item.description}</p>
                            )}

                            {/* Linked Recipient Attribution */}
                            {item.personName && (
                              <div className="achievement-entry__attribution">
                                <span className="achievement-entry__recipient">
                                  <User size={12} />
                                  {item.personName}
                                  {item.personDesignation ? ` · ${item.personDesignation}` : ""}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Optional Thumbnail Image */}
                          {item.imageUrl && (
                            <div className="achievement-entry__thumb-wrap">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="achievement-entry__thumb"
                                loading="lazy"
                              />
                              <div className="achievement-entry__thumb-overlay">
                                <Sparkles size={13} />
                              </div>
                            </div>
                          )}

                          {/* Interactive CTA */}
                          <div className="achievement-entry__cta">
                            <span className="achievement-entry__cta-text">View Recognition</span>
                            <ArrowRight size={15} className="achievement-entry__cta-arrow" />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── 5. Detail Drawer Panel ── */}
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
            {/* Drawer Topbar */}
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
                  <ArrowLeft size={16} />
                </button>
                <span className="achievement-drawer__counter">
                  {currentDetailIndex + 1} of {filteredAchievements.length}
                </span>
                <button
                  type="button"
                  className="achievement-drawer__nav-btn"
                  onClick={handleNextDetail}
                  disabled={currentDetailIndex >= filteredAchievements.length - 1}
                  aria-label="Next achievement (Right arrow)"
                  title="Next achievement"
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              <button
                type="button"
                className="achievement-drawer__close-btn"
                onClick={() => setActiveDetail(null)}
                aria-label="Close detail panel (ESC)"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="achievement-drawer__scrollable">
              {/* Image Preview with Containment */}
              {activeDetail.imageUrl && (
                <div className="achievement-drawer__image-wrap">
                  <img
                    src={activeDetail.imageUrl}
                    alt={activeDetail.title}
                    className="achievement-drawer__image"
                  />
                </div>
              )}

              <div className="achievement-drawer__content">
                <div className="achievement-drawer__badges">
                  <span className="achievement-drawer__category-badge">
                    <Award size={13} />
                    {activeDetail.category || "Recognition"}
                  </span>
                  {activeDetail.formattedDate && activeDetail.formattedDate !== "—" && (
                    <span className="achievement-drawer__date-badge">
                      <Calendar size={13} />
                      {activeDetail.formattedDate}
                    </span>
                  )}
                  {activeDetail.unitLabel && (
                    <span className="achievement-drawer__unit-badge">
                      <Shield size={13} />
                      {activeDetail.unitLabel}
                    </span>
                  )}
                </div>

                <h2 className="achievement-drawer__title">{activeDetail.title}</h2>

                {/* Recipient Profile Card if Linked */}
                {activeDetail.personName && (
                  <div className="achievement-drawer__recipient-card">
                    <div className="achievement-drawer__recipient-avatar">
                      <User size={18} />
                    </div>
                    <div className="achievement-drawer__recipient-info">
                      <span className="achievement-drawer__recipient-label">HONOUR RECIPIENT</span>
                      <strong>{activeDetail.personName}</strong>
                      {activeDetail.personDesignation && (
                        <span>{activeDetail.personDesignation}</span>
                      )}
                      {activeDetail.personUnit && (
                        <small>{activeDetail.personUnit}</small>
                      )}
                    </div>
                  </div>
                )}

                {/* Accomplishment Narrative */}
                <div className="achievement-drawer__description">
                  <h4 className="achievement-drawer__desc-heading">ACCOMPLISHMENT DETAILS</h4>
                  <p>{activeDetail.description || "Milestone achieved under the National Service Scheme, Anna University MIT Campus."}</p>
                </div>

                {/* Institutional Accreditation Footnote */}
                <div className="achievement-drawer__footnote">
                  <RecognitionSeal category={activeDetail.category} />
                  <span>National Service Scheme · Madras Institute of Technology, Anna University</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Public Footer ── */}
      <Footer />
    </div>
  );
}
