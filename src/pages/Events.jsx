import React, { useState, useEffect, useMemo } from "react";
import Footer from "../components/Footer";
import LightboxModal from "../components/ui/LightboxModal";
import { EVENT_TYPE_DEFINITIONS } from "../data/mockEventsData";
import { getPublicEvents, getPublicEventDetail } from "../services/eventService";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import "./Events.css";

const MONTHS_LIST = [
  { key: "01", short: "JAN", name: "January", index: "01" },
  { key: "02", short: "FEB", name: "February", index: "02" },
  { key: "03", short: "MAR", name: "March", index: "03" },
  { key: "04", short: "APR", name: "April", index: "04" },
  { key: "05", short: "MAY", name: "May", index: "05" },
  { key: "06", short: "JUN", name: "June", index: "06" },
  { key: "07", short: "JUL", name: "July", index: "07" },
  { key: "08", short: "AUG", name: "August", index: "08" },
  { key: "09", short: "SEP", name: "September", index: "09" },
  { key: "10", short: "OCT", name: "October", index: "10" },
  { key: "11", short: "NOV", name: "November", index: "11" },
  { key: "12", short: "DEC", name: "December", index: "12" },
];

export default function Events() {
  // Navigation State
  // "types" | "collection" | "months" | "month-events" | "event-detail"
  const [activeView, setActiveView] = useState("types");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2026");

  // Expanded child session state within Event Detail
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  // Lightbox viewer state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  function openLightbox(images, idx = 0) {
    if (!images || images.length === 0) return;
    setLightboxImages(images);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }

  const [dbEvents, setDbEvents] = useState([]);

  // Dynamic Supabase data hook
  useEffect(() => {
    async function loadDynamic() {
      try {
        const events = await getPublicEvents();
        setDbEvents(events || []);
      } catch (err) {
        console.warn("Could not load events:", err);
      }
    }
    loadDynamic();
  }, []);

  // Scroll smoothly to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeView, selectedType, selectedMonthKey, selectedEvent]);

  // Available academic years from database events
  const availableYears = useMemo(() => {
    const years = new Set(["2026"]);
    dbEvents.forEach((e) => {
      const d = e.start_date || e.startDate;
      if (d && d.length >= 4) {
        years.add(d.slice(0, 4));
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [dbEvents]);

  // Map of events grouped by monthKey (e.g. "2026-09" -> [Event, Event...])
  const monthlyEventsMap = useMemo(() => {
    const map = {};
    dbEvents.forEach((e) => {
      const type = (e.event_type || e.typeId || "").toLowerCase();
      if (type === "monthly" || type === "monthly event") {
        const d = e.start_date || e.startDate;
        if (d && d.length >= 7) {
          const mKey = d.slice(0, 7);
          if (!map[mKey]) map[mKey] = [];
          map[mKey].push({
            ...e,
            dateDisplay: e.dateDisplay || e.start_date,
            shortDesc: e.shortDesc || e.description || "",
            coverImage: e.coverImage || e.cover_image_url,
          });
        }
      }
    });
    return map;
  }, [dbEvents]);

  // Active month's events
  const activeMonthEvents = useMemo(() => {
    if (!selectedMonthKey) return [];
    return monthlyEventsMap[selectedMonthKey] || [];
  }, [selectedMonthKey, monthlyEventsMap]);

  // Active month display metadata
  const activeMonthInfo = useMemo(() => {
    if (!selectedMonthKey) return null;
    const parts = selectedMonthKey.split("-");
    const year = parts[0];
    const monthNum = parts[1];
    const foundMonth = MONTHS_LIST.find((m) => m.key === monthNum);
    return {
      year,
      monthNum,
      short: foundMonth ? foundMonth.short : "SEP",
      fullName: foundMonth ? `${foundMonth.name} ${year}` : selectedMonthKey,
      eventCount: activeMonthEvents.length
    };
  }, [selectedMonthKey, activeMonthEvents]);

  // Events for selected non-monthly category
  const collectionEvents = useMemo(() => {
    if (!selectedType || selectedType.id === "monthly") return [];
    return dbEvents.filter((e) => {
      const t = (e.event_type || e.typeId || "").toLowerCase();
      const target = selectedType.id.toLowerCase();
      if (target === "camp") return t === "camp";
      if (target === "outreach") return t === "outreach" || t === "drive";
      if (target === "orphanage" || target === "visit") return t.includes("orphanage") || t.includes("visit");
      if (target === "monthly") return t === "monthly" || t === "monthly event";
      return t === target;
    }).map((ev) => ({
      ...ev,
      dateDisplay: ev.dateDisplay || ev.start_date,
      shortDesc: ev.shortDesc || ev.description || "",
      coverImage: ev.coverImage || ev.cover_image_url,
    }));
  }, [selectedType, dbEvents]);

  // ── Handlers ────────────────────────────────────────────────
  function handleSelectType(typeDef) {
    setSelectedType(typeDef);
    setSelectedEvent(null);
    if (typeDef.id === "monthly") {
      setActiveView("months");
    } else {
      setActiveView("collection");
    }
  }

  function handleSelectMonth(monthKey) {
    setSelectedMonthKey(monthKey);
    setSelectedEvent(null);
    setActiveView("month-events");
  }

  async function handleOpenEvent(event) {
    setSelectedEvent(event);
    setExpandedSessionId(null);
    setActiveView("event-detail");

    if (event.id) {
      try {
        const fullDetail = await getPublicEventDetail(event.id);
        if (fullDetail) {
          setSelectedEvent((prev) => ({
            ...prev,
            ...fullDetail,
            gallery: fullDetail.gallery?.length > 0 ? fullDetail.gallery : prev?.gallery || [],
            sessions: fullDetail.sessions?.length > 0 ? fullDetail.sessions : prev?.sessions || [],
          }));
        }
      } catch (err) {
        console.warn("Using current event data:", err);
      }
    }
  }

  function handleBack() {
    if (activeView === "event-detail") {
      if (selectedMonthKey) {
        setActiveView("month-events");
      } else if (selectedType && selectedType.id !== "monthly") {
        setActiveView("collection");
      } else {
        setActiveView("types");
      }
      setSelectedEvent(null);
    } else if (activeView === "month-events") {
      setActiveView("months");
      setSelectedMonthKey(null);
    } else if (activeView === "months" || activeView === "collection") {
      setActiveView("types");
      setSelectedType(null);
      setSelectedMonthKey(null);
    }
  }

  function toggleSessionExpand(sessionId) {
    setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId));
  }

  return (
    <div className="page-wrapper nss-events-page">
      {/* ── 1. Compact Hero (Discovery Level Only) ─────────────── */}
      {activeView === "types" && (
        <header className="events-compact-hero" aria-label="NSS Events Directory">
          <div className="events-center-container">
            <div className="hero-kicker">
              <span className="hero-kicker-dash" />
              <span>EVENTS DIRECTORY</span>
            </div>
            <h1 className="hero-compact-title font-editorial">
              Stories of Service, Across Every Kind of Activity
            </h1>
            <p className="hero-compact-desc">
              Explore NSS residential camps, monthly split-up assemblies, community outreach,
              and student-led civic initiatives across MIT Campus and rural communities.
            </p>
          </div>
        </header>
      )}

      {/* ── 2. Focused Section Header (When Drilled In) ───────── */}
      {activeView !== "types" && (
        <header className="events-focused-header" aria-label="Events Navigation">
          <div className="events-center-container">
            {/* Contextual Step-Back Button */}
            <button
              type="button"
              className="events-back-nav-btn"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {activeView === "event-detail"
                  ? selectedMonthKey
                    ? `Back to ${activeMonthInfo?.fullName || "Month"} Events`
                    : `Back to ${selectedType?.title || "Collection"}`
                  : activeView === "month-events"
                  ? "Back to All Months"
                  : "All Event Types"}
              </span>
            </button>

            {/* Header Identity */}
            <div className="focused-header-identity">
              {activeView === "months" && (
                <>
                  <span className="focused-kicker">CHRONOLOGICAL CALENDAR</span>
                  <h2 className="focused-title font-editorial">Monthly Events</h2>
                  <p className="focused-desc">
                    Explore NSS events organized chronologically across the academic calendar.
                  </p>
                </>
              )}

              {activeView === "month-events" && (
                <>
                  <span className="focused-kicker">MONTHLY EVENTS</span>
                  <h2 className="focused-title font-editorial">
                    {activeMonthInfo?.fullName}
                  </h2>
                  <p className="focused-desc">
                    {activeMonthEvents.length}{" "}
                    {activeMonthEvents.length === 1 ? "Event" : "Events"} conducted in{" "}
                    {activeMonthInfo?.fullName}. Select an event to explore its details and individual sessions.
                  </p>
                </>
              )}

              {activeView === "collection" && selectedType && (
                <>
                  <span className="focused-kicker">EVENT TYPE</span>
                  <h2 className="focused-title font-editorial">{selectedType.title}</h2>
                  <p className="focused-desc">{selectedType.shortDesc}</p>
                </>
              )}

              {activeView === "event-detail" && selectedEvent && (
                <>
                  <span className="focused-kicker">
                    {selectedEvent.categoryLabel?.toUpperCase() || "EVENT DETAILS"}
                  </span>
                  <h2 className="focused-title font-editorial">{selectedEvent.title}</h2>
                  {selectedEvent.tagline && (
                    <p className="focused-tagline font-editorial">{selectedEvent.tagline}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ── 3. Main Stage Content Container ──────────────────── */}
      <main className="events-stage-main">
        <div className="events-center-container">

          {/* ======================================================= */}
          {/* LEVEL 1: EVENT TYPES (Public Discovery Level)          */}
          {/* ======================================================= */}
          {activeView === "types" && (
            <section className="event-types-section" aria-label="Event Collections">
              <div className="collections-editorial-grid">
                {EVENT_TYPE_DEFINITIONS.map((typeDef) => {
                  const eventCount = dbEvents.filter((e) => {
                    const t = (e.event_type || e.typeId || "").toLowerCase();
                    const target = typeDef.id.toLowerCase();
                    if (target === "camp") return t === "camp";
                    if (target === "outreach") return t === "outreach" || t === "drive";
                    if (target === "orphanage" || target === "visit") return t.includes("orphanage") || t.includes("visit");
                    if (target === "monthly") return t === "monthly" || t === "monthly event";
                    return t === target;
                  }).length;
                  const countText = `${eventCount} ${eventCount === 1 ? "EVENT" : "EVENTS"}`;

                  return (
                    <article
                      key={typeDef.id}
                      className="type-editorial-card"
                      onClick={() => handleSelectType(typeDef)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectType(typeDef);
                        }
                      }}
                      aria-label={`${typeDef.title}, ${countText}. Click to explore collection.`}
                    >
                      {/* Animated SVG Border stroke on hover */}
                      <svg
                        className="type-card-border-svg"
                        aria-hidden="true"
                        preserveAspectRatio="none"
                      >
                        <rect
                          className="type-card-border-rect"
                          rx="8"
                          ry="8"
                          pathLength="100"
                        />
                      </svg>

                      {/* Natural Photographic Cover Image */}
                      <div className="type-card-image-wrap">
                        <img
                          src={typeDef.coverImage}
                          alt=""
                          className="type-card-img"
                          loading="lazy"
                        />
                        <div className="type-card-scrim" />
                      </div>

                      {/* Interactive Card Foreground Content */}
                      <div className="type-card-content">
                        {/* Top Meta: Kicker and Dynamic Count Badge */}
                        <div className="type-card-header">
                          <span className="type-card-kicker">
                            {typeDef.id === "monthly" ? "CHRONOLOGICAL ARCHIVE" : "COLLECTION"}
                          </span>
                          <span className="type-card-count-badge">
                            {countText}
                          </span>
                        </div>

                        {/* Bottom Information: Title + Smooth Reveal Excerpt + Directional Arrow */}
                        <div className="type-card-body">
                          <h3 className="type-card-name font-editorial">
                            {typeDef.title}
                          </h3>

                          <div className="type-card-reveal-area">
                            <div className="type-card-reveal-inner">
                              <p className="type-card-excerpt">
                                {typeDef.excerpt || typeDef.shortDesc}
                              </p>

                              <div className="type-card-action">
                                <span className="type-card-cta-text">
                                  {typeDef.id === "monthly" ? "Explore Monthly Archive" : "Explore Collection"}
                                </span>
                                <ArrowRight className="type-card-arrow-icon" aria-hidden="true" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* ======================================================= */}
          {/* LEVEL 2B: MONTHLY EVENTS (12-Month Matrix)              */}
          {/* ======================================================= */}
          {activeView === "months" && (
            <section className="months-timeline-section" aria-label="Months Timeline">
              {/* Year Selector Bar */}
              <div className="timeline-year-bar">
                <span className="year-bar-label">ACADEMIC YEAR</span>
                <div className="year-pills">
                  {availableYears.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      className={`year-pill ${selectedYear === yr ? "year-pill--active" : ""}`}
                      onClick={() => setSelectedYear(yr)}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* 12-Month Grid */}
              <div className="months-matrix-grid">
                {MONTHS_LIST.map((month) => {
                  const monthKey = `${selectedYear}-${month.key}`;
                  const eventsInMonth = monthlyEventsMap[monthKey] || [];
                  const hasEvents = eventsInMonth.length > 0;
                  const isCompleted = month.key < "09";
                  const isActive = month.key === "09";

                  return (
                    <div
                      key={month.key}
                      className={`month-matrix-card ${hasEvents ? "month--has-activities" : "month--empty"} ${isActive ? "month--active-current" : ""}`}
                      onClick={() => hasEvents && handleSelectMonth(monthKey)}
                      role={hasEvents ? "button" : "presentation"}
                      tabIndex={hasEvents ? 0 : -1}
                      onKeyDown={(e) => {
                        if (hasEvents && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          handleSelectMonth(monthKey);
                        }
                      }}
                      aria-label={`${month.name} ${selectedYear}: ${eventsInMonth.length} Events`}
                    >
                      <div className="month-card-header">
                        <span className="month-short-name font-editorial">{month.short}</span>
                        <span className="month-index-num">{month.index}</span>
                      </div>

                      <div className="month-card-footer">
                        {hasEvents ? (
                          <div className="month-activity-info">
                            <span className={`month-status-dot ${isCompleted ? "dot--completed" : isActive ? "dot--active" : "dot--upcoming"}`} />
                            <span className="month-count-text">
                              {eventsInMonth.length} {eventsInMonth.length === 1 ? "Event" : "Events"}
                            </span>
                          </div>
                        ) : (
                          <span className="month-no-activity">No events</span>
                        )}
                        {hasEvents && (
                          <ArrowRight className="w-3.5 h-3.5 month-arrow-icon" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ======================================================= */}
          {/* LEVEL 2C: EVENTS IN SELECTED MONTH                      */}
          {/* ======================================================= */}
          {activeView === "month-events" && (
            <section className="collection-events-section" aria-label={`Events in ${activeMonthInfo?.fullName}`}>
              {activeMonthEvents.length === 0 ? (
                <div className="events-empty-box">
                  <p className="empty-title">No events recorded for this month</p>
                  <button type="button" className="empty-back-btn" onClick={() => setActiveView("months")}>
                    Return to Month Selector
                  </button>
                </div>
              ) : (
                <div className="collection-events-list">
                  {activeMonthEvents.map((event) => {
                    const sessionCount = Array.isArray(event.sessions) ? event.sessions.length : 1;

                    return (
                      <article
                        key={event.id}
                        className="collection-event-card"
                        onClick={() => handleOpenEvent(event)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleOpenEvent(event);
                          }
                        }}
                        aria-label={`Explore event: ${event.title}`}
                      >
                        {/* Cover Image Column */}
                        {event.coverImage && (
                          <div className="event-card-media-wrap">
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="event-card-img"
                              loading="lazy"
                            />
                            <span className="event-card-status-badge">
                              {event.status || "Upcoming"}
                            </span>
                          </div>
                        )}

                        {/* Event Content Column */}
                        <div className="event-card-body-wrap">
                          <div>
                            <div className="event-card-kicker-row">
                              <span className="event-card-kicker">
                                {event.categoryLabel || "MONTHLY EVENT"}
                              </span>
                              <span className="event-card-sessions-pill">
                                <Layers className="w-3.5 h-3.5" />
                                <span>{sessionCount} {sessionCount === 1 ? "Session" : "Sessions"}</span>
                              </span>
                            </div>

                            <h3 className="event-card-title font-editorial">
                              {event.title}
                            </h3>

                            <div className="event-card-meta-line">
                              <span className="meta-item">
                                <Calendar className="w-3.5 h-3.5 text-red-500" />
                                <span>{event.dateDisplay}</span>
                              </span>
                              <span className="meta-sep">·</span>
                              <span className="meta-item">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{event.location}</span>
                              </span>
                              <span className="meta-sep">·</span>
                              <span className="meta-item">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>{event.volunteersCount} Volunteers</span>
                              </span>
                            </div>

                            <p className="event-card-desc">
                              {event.shortDesc}
                            </p>
                          </div>

                          <div className="event-card-footer-action">
                            <span className="event-card-action-btn">
                              <span>Explore Event & Sessions</span>
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ======================================================= */}
          {/* LEVEL 2A: NON-MONTHLY CATEGORY EVENTS LIST              */}
          {/* ======================================================= */}
          {activeView === "collection" && selectedType && (
            <section className="collection-events-section" aria-label={selectedType.title}>
              {collectionEvents.length === 0 ? (
                <div className="events-empty-box">
                  <p className="empty-title">No events published in this collection yet</p>
                  <p className="empty-sub">Check back soon for upcoming programme schedules.</p>
                  <button type="button" className="empty-back-btn" onClick={() => setActiveView("types")}>
                    Return to All Event Types
                  </button>
                </div>
              ) : (
                <div className="collection-events-list">
                  {collectionEvents.map((event) => {
                    const sessionCount = Array.isArray(event.sessions) ? event.sessions.length : 1;

                    return (
                      <article
                        key={event.id}
                        className="collection-event-card"
                        onClick={() => handleOpenEvent(event)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleOpenEvent(event);
                          }
                        }}
                        aria-label={`Explore event: ${event.title}`}
                      >
                        {/* Media Image Column */}
                        {event.coverImage && (
                          <div className="event-card-media-wrap">
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="event-card-img"
                              loading="lazy"
                            />
                            <span className="event-card-status-badge">
                              {event.status || "Upcoming"}
                            </span>
                          </div>
                        )}

                        {/* Event Content Column */}
                        <div className="event-card-body-wrap">
                          <div>
                            <div className="event-card-kicker-row">
                              <span className="event-card-kicker">
                                {event.categoryLabel || "SPECIAL EVENT"}
                              </span>
                              <span className="event-card-sessions-pill">
                                <Layers className="w-3.5 h-3.5" />
                                <span>{sessionCount} {sessionCount === 1 ? "Session" : "Sessions"}</span>
                              </span>
                            </div>

                            <h3 className="event-card-title font-editorial">
                              {event.title}
                            </h3>

                            <div className="event-card-meta-line">
                              <span className="meta-item">
                                <Calendar className="w-3.5 h-3.5 text-red-500" />
                                <span>{event.dateDisplay}</span>
                              </span>
                              <span className="meta-sep">·</span>
                              <span className="meta-item">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{event.location}</span>
                              </span>
                              <span className="meta-sep">·</span>
                              <span className="meta-item">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>{event.volunteersCount} Volunteers</span>
                              </span>
                            </div>

                            <p className="event-card-desc">
                              {event.shortDesc}
                            </p>
                          </div>

                          <div className="event-card-footer-action">
                            <span className="event-card-action-btn">
                              <span>Explore Event & Sessions</span>
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ======================================================= */}
          {/* LEVEL 3: EVENT DETAIL + CHILD SESSIONS                  */}
          {/* ======================================================= */}
          {activeView === "event-detail" && selectedEvent && (
            <section className="detail-inpage-section" aria-label="Event Details and Sessions">
              {/* Large Cover Hero Anchor */}
              {selectedEvent.coverImage && (
                <div className="detail-cover-hero-wrap">
                  <img
                    src={selectedEvent.coverImage}
                    alt={selectedEvent.title}
                    className="detail-cover-img"
                  />
                  <div className="detail-cover-scrim">
                    <span className="detail-cover-badge">
                      NSS MIT · {selectedEvent.categoryLabel?.toUpperCase() || "EVENT ARCHIVE"}
                    </span>
                  </div>
                </div>
              )}

              {/* Scannable Event Specifications Grid */}
              <div className="detail-specs-grid">
                <div className="spec-card">
                  <span className="spec-label">DATE / SCHEDULE</span>
                  <p className="spec-value">{selectedEvent.dateDisplay}</p>
                </div>
                <div className="spec-card">
                  <span className="spec-label">DURATION & SCALE</span>
                  <p className="spec-value">{selectedEvent.durationDays || "Multi-Session Event"}</p>
                </div>
                <div className="spec-card">
                  <span className="spec-label">VOLUNTEER MOBILIZATION</span>
                  <p className="spec-value">{selectedEvent.volunteersCount ? `${selectedEvent.volunteersCount} Volunteers` : "All Units"}</p>
                </div>
                <div className="spec-card spec-card--wide">
                  <span className="spec-label">PRIMARY LOCATION & VENUE</span>
                  <p className="spec-value">{selectedEvent.location}</p>
                </div>
              </div>

              {/* Narrative & Highlights Layout */}
              <div className="detail-narrative-layout">
                {/* Left Prose Column: About the Event */}
                <div className="detail-prose-col">
                  <h3 className="detail-subheading font-editorial">About the Event</h3>
                  <div className="detail-prose-body">
                    {Array.isArray(selectedEvent.about) ? (
                      selectedEvent.about.map((p, pIdx) => <p key={pIdx}>{p}</p>)
                    ) : (
                      <p>{selectedEvent.shortDesc}</p>
                    )}
                  </div>
                </div>

                {/* Right Outcomes Card */}
                {selectedEvent.highlights && selectedEvent.highlights.length > 0 && (
                  <aside className="detail-highlights-card">
                    <h4 className="highlights-title font-editorial">Key Highlights & Outcomes</h4>
                    <ul className="highlights-list">
                      {selectedEvent.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="highlight-item">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}
              </div>

              {/* ──────────────────────────────────────────────────── */}
              {/* CHILD SESSIONS SECTION (EVENT -> SESSIONS)            */}
              {/* ──────────────────────────────────────────────────── */}
              <div className="event-sessions-container">
                <div className="event-sessions-header">
                  <div>
                    <span className="sessions-kicker">ACTIVITIES & TIMELINE</span>
                    <h3 className="sessions-main-title font-editorial">Sessions</h3>
                  </div>
                  <span className="sessions-count-badge">
                    {Array.isArray(selectedEvent.sessions) ? selectedEvent.sessions.length : 0} {selectedEvent.sessions?.length === 1 ? "Session" : "Sessions"}
                  </span>
                </div>

                {Array.isArray(selectedEvent.sessions) && selectedEvent.sessions.length > 0 ? (
                  <div className="event-sessions-list">
                    {selectedEvent.sessions.map((session, sIdx) => {
                      const isExpanded = expandedSessionId === session.id;
                      const parts = session.date ? session.date.split("-") : ["2026", "09", "18"];
                      const dayNum = parts[2] || `${sIdx + 1}`;
                      const monthNum = parts[1] || "09";
                      const foundMonth = MONTHS_LIST.find((m) => m.key === monthNum);
                      const monthText = foundMonth ? foundMonth.short : "SEP";

                      const sessionPhotos =
                        session.gallery && session.gallery.length > 0
                          ? session.gallery
                          : Array.isArray(session.photos) && session.photos.length > 0
                          ? session.photos.map((p) => ({
                              url: p.publicUrl || p.url,
                              caption: p.caption || p.alt_text || session.title,
                            }))
                          : [];

                      return (
                        <article
                          key={session.id || sIdx}
                          className={`session-timeline-card ${isExpanded ? "session-card--expanded" : ""}`}
                        >
                          <div
                            className="session-card-main-bar"
                            onClick={() => toggleSessionExpand(session.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleSessionExpand(session.id);
                              }
                            }}
                            aria-expanded={isExpanded}
                            aria-label={`Toggle session details for ${session.title}`}
                          >
                            {/* Date Badge Column */}
                            <div className="session-card-date-badge">
                              <span className="session-badge-day font-editorial">{dayNum}</span>
                              <span className="session-badge-month">{monthText}</span>
                              {session.weekday && (
                                <span className="session-badge-weekday">{session.weekday}</span>
                              )}
                            </div>

                            {/* Session Information */}
                            <div className="session-card-content">
                              <div className="session-card-kicker-row">
                                <span className="session-pill">
                                  {session.dayLabel || `Session ${sIdx + 1}`}
                                </span>
                                {session.unitsDisplay && (
                                  <span className="session-units-pill">
                                    <Users className="w-3 h-3" />
                                    <span>{session.unitsDisplay}</span>
                                  </span>
                                )}
                                {sessionPhotos.length > 0 && (
                                  <span className="session-units-pill text-red-600 bg-red-50/80 border-red-200">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>{sessionPhotos.length} {sessionPhotos.length === 1 ? "Photo" : "Photos"}</span>
                                  </span>
                                )}
                              </div>

                              <h4 className="session-card-title font-editorial">
                                {session.title}
                              </h4>

                              <div className="session-card-meta-row">
                                <span className="session-meta-item">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{session.timeDisplay}</span>
                                </span>
                                <span className="session-meta-sep">·</span>
                                <span className="session-meta-item">
                                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                                  <span>{session.location}</span>
                                </span>
                              </div>

                              <p className="session-card-summary">
                                {session.shortDesc}
                              </p>
                            </div>

                            {/* Expand Indicator */}
                            <div className="session-card-expand-btn">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-500" />
                              )}
                            </div>
                          </div>

                          {/* Collapsible Session Details */}
                          {isExpanded && (
                            <div className="session-card-expanded-body">
                              {session.about && session.about.length > 0 && (
                                <div className="session-about-prose">
                                  {session.about.map((p, pIdx) => (
                                    <p key={pIdx}>{p}</p>
                                  ))}
                                </div>
                              )}

                              {session.outcomes && session.outcomes.length > 0 && (
                                <div className="session-outcomes-box">
                                  <span className="outcomes-label">Key Outcomes & Deliverables:</span>
                                  <ul className="outcomes-list">
                                    {session.outcomes.map((out, oIdx) => (
                                      <li key={oIdx}>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>{out}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {session.organizer && (
                                <p className="session-organizer-line">
                                  <strong>Coordinated by:</strong> {session.organizer}
                                </p>
                              )}

                              {/* Session Photos Grid */}
                              {sessionPhotos.length > 0 && (
                                <div className="pt-3 mt-3 border-t border-slate-200/80">
                                  <div className="flex items-center gap-1.5 mb-2.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                                    <span className="text-xs font-semibold text-slate-800">
                                      Session Photographs ({sessionPhotos.length})
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {sessionPhotos.map((photo, pIdx) => (
                                      <div
                                        key={pIdx}
                                        className="relative aspect-4/3 rounded-md overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group shadow-2xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openLightbox(sessionPhotos, pIdx);
                                        }}
                                        title={photo.caption || "View photo"}
                                      >
                                        <img
                                          src={photo.url}
                                          alt={photo.caption || `Session photo ${pIdx + 1}`}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <ImageIcon className="w-4 h-4 text-white drop-shadow-sm" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="sessions-empty-text">No sessions scheduled for this event yet.</p>
                )}
              </div>

              {/* Moments Photography Gallery (Event Level) */}
              {Array.isArray(selectedEvent.gallery) && selectedEvent.gallery.length > 0 && (
                <div className="detail-gallery-section">
                  <h3 className="detail-subheading font-editorial">Moments from the Event</h3>
                  <div className="detail-gallery-grid">
                    {selectedEvent.gallery.map((photo, gIdx) => (
                      <div
                        key={gIdx}
                        className="detail-gallery-thumb-card"
                        onClick={() => openLightbox(selectedEvent.gallery, gIdx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openLightbox(selectedEvent.gallery, gIdx);
                          }
                        }}
                        aria-label={`View photo: ${photo.caption}`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || `Event photo ${gIdx + 1}`}
                          className="gallery-thumb-img"
                          loading="lazy"
                        />
                        <div className="gallery-thumb-overlay">
                          <p className="thumb-caption">{photo.caption}</p>
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Return Button */}
              <div className="detail-bottom-return-bar">
                <button
                  type="button"
                  className="detail-return-btn"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    {selectedMonthKey
                      ? `Return to ${activeMonthInfo?.fullName || "Month"} Events`
                      : `Return to ${selectedType?.title || "Collection"}`}
                  </span>
                </button>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <LightboxModal
          images={lightboxImages.length > 0 ? lightboxImages : selectedEvent?.gallery || []}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}

      <Footer />
    </div>
  );
}
