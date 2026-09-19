import React, { useState, useEffect, useMemo, useCallback } from "react";
import Footer from "../components/Footer";
import PageHero from "../components/ui/PageHero";
import { getPublicCalendarData, formatTimeDisplay } from "../services/sessionService";
import {
  Clock,
  MapPin,
  Users,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ArrowRight,
  Calendar,
  Sparkles,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import "./Sessions.css";

/* ── Constants ─────────────────────────────────────────────── */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORIES = [
  { id: "all", label: "All Activities" },
  { id: "camp", label: "Camps" },
  { id: "outreach", label: "Outreach" },
  { id: "visit", label: "Orphanage Visits" },
  { id: "monthly", label: "Monthly Events" },
];

/**
 * Format category badge label
 */
function getCategoryBadge(item) {
  if (item.type === "monthly_event" || item.eventType === "monthly") {
    return "MONTHLY EVENT";
  }
  const t = (item.eventType || "").toLowerCase();
  if (t === "camp") return "CAMP";
  if (t === "outreach") return "OUTREACH";
  if (t.includes("visit") || t.includes("orphanage")) return "ORPHANAGE VISIT";
  return (item.eventType || "ACTIVITY").toUpperCase();
}

/**
 * Check if category matches filter
 */
function matchesCategoryFilter(item, filterId) {
  if (filterId === "all") return true;
  if (filterId === "monthly") {
    return item.type === "monthly_event" || item.eventType === "monthly";
  }
  const t = (item.eventType || "").toLowerCase();
  if (filterId === "camp") return t === "camp";
  if (filterId === "outreach") return t === "outreach";
  if (filterId === "visit") return t.includes("visit") || t.includes("orphanage");
  return true;
}

export default function Sessions() {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }, [today]);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewScope, setViewScope] = useState("month"); // "month" | "upcoming"
  const [selectedItem, setSelectedItem] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /* ── Load public calendar data ────────────────────────────── */
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getPublicCalendarData();
        setCalendarData(data || {});
      } catch (err) {
        console.error("Failed to load schedule data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  /* ── Close panel on Escape key ────────────────────────────── */
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && selectedItem) {
        setSelectedItem(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem]);

  /* ── Month Navigation with subtle slide/fade animation ─────── */
  const changeMonth = useCallback((dir) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setMonth((m) => {
        const nm = m + dir;
        if (nm > 11) {
          setYear((y) => y + 1);
          return 0;
        }
        if (nm < 0) {
          setYear((y) => y - 1);
          return 11;
        }
        return nm;
      });
      setIsTransitioning(false);
    }, 180);
  }, []);

  const goToToday = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setYear(today.getFullYear());
      setMonth(today.getMonth());
      setViewScope("month");
      setIsTransitioning(false);
    }, 180);
  }, [today]);

  /* ── Available Years for dropdown selector ─────────────────── */
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    const currentYear = today.getFullYear();
    for (let y = currentYear - 3; y <= currentYear + 5; y++) {
      yearsSet.add(y);
    }
    Object.keys(calendarData).forEach((d) => {
      const y = parseInt(d.split("-")[0], 10);
      if (!isNaN(y)) yearsSet.add(y);
    });
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [today, calendarData]);

  /* ── Process and group activities chronologically ──────────── */
  const { dateGroups, nextActivityId } = useMemo(() => {
    const allDates = Object.keys(calendarData).sort();
    const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

    let candidateDates = allDates;
    if (viewScope === "month") {
      candidateDates = allDates.filter((d) => d.startsWith(currentMonthPrefix));
    } else if (viewScope === "upcoming") {
      candidateDates = allDates.filter((d) => d >= todayKey);
    }

    const groups = [];
    let foundNextId = null;

    candidateDates.forEach((dateStr) => {
      const items = (calendarData[dateStr] || [])
        .filter((it) => matchesCategoryFilter(it, categoryFilter))
        .sort((a, b) => {
          const tA = a.startTime || "00:00";
          const tB = b.startTime || "00:00";
          return tA.localeCompare(tB);
        });

      if (items.length > 0) {
        // Parse date details
        const parts = dateStr.split("-").map(Number);
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const dayNum = parts[2];
        const monthAbbr = MONTH_NAMES[parts[1] - 1]?.slice(0, 3).toUpperCase() || "SEP";
        const weekday = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
        const isPast = dateStr < todayKey;
        const isToday = dateStr === todayKey;

        // Find next activity flag
        if (!foundNextId && !isPast && items.length > 0) {
          foundNextId = items[0].id;
        }

        groups.push({
          dateKey: dateStr,
          dateObj,
          dayNum,
          monthAbbr,
          weekday,
          year: parts[0],
          isPast,
          isToday,
          items,
        });
      }
    });

    return {
      dateGroups: groups,
      nextActivityId: foundNextId,
    };
  }, [calendarData, year, month, viewScope, categoryFilter, todayKey]);

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="page-wrapper nss-schedule-page">
      {/* Shared Page Hero with SESSIONS watermark */}
      <PageHero
        watermark="SESSIONS"
        eyebrow="NSS SCHEDULE"
        title="Sessions"
        description="Explore upcoming NSS programmes, community outreach initiatives, annual camps, and monthly split-up activities."
      />

      {/* ── Main Schedule Section ──────────────────────────────── */}
      <section className="schedule-section">
        <div className="schedule-container">

          {/* ── Top Schedule Control Bar ─────────────────────────── */}
          <div className="schedule-control-bar">
            {/* View Scope Mode: Month View vs Upcoming Stream */}
            <div className="schedule-scope-toggle">
              <button
                type="button"
                className={`scope-btn ${viewScope === "month" ? "scope-btn--active" : ""}`}
                onClick={() => setViewScope("month")}
              >
                <CalendarDays className="w-3.5 h-3.5 inline mr-1.5" />
                Monthly Schedule
              </button>
              <button
                type="button"
                className={`scope-btn ${viewScope === "upcoming" ? "scope-btn--active" : ""}`}
                onClick={() => setViewScope("upcoming")}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-amber-500" />
                All Upcoming
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="schedule-filter-pills" role="tablist" aria-label="Filter schedule by activity category">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={categoryFilter === cat.id}
                  className={`filter-pill ${categoryFilter === cat.id ? "filter-pill--active" : ""}`}
                  onClick={() => setCategoryFilter(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Month Navigation (visible in month view) ─────────── */}
          {viewScope === "month" && (
            <div className="schedule-month-nav">
              <div className="month-nav-controls">
                <button
                  type="button"
                  className="month-nav-arrow"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="month-nav-dropdowns">
                  {/* Month Dropdown Selector */}
                  <div className="month-select-wrapper">
                    <select
                      className="month-nav-select month-nav-select--month"
                      value={month}
                      onChange={(e) => {
                        const newMonth = Number(e.target.value);
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setMonth(newMonth);
                          setIsTransitioning(false);
                        }, 160);
                      }}
                      aria-label="Choose month"
                    >
                      {MONTH_NAMES.map((mName, idx) => (
                        <option key={idx} value={idx}>
                          {mName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-caret-icon" aria-hidden="true" />
                  </div>

                  {/* Year Dropdown Selector */}
                  <div className="year-select-wrapper">
                    <select
                      className="month-nav-select month-nav-select--year"
                      value={year}
                      onChange={(e) => {
                        const newYear = Number(e.target.value);
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setYear(newYear);
                          setIsTransitioning(false);
                        }, 160);
                      }}
                      aria-label="Choose year"
                    >
                      {availableYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-caret-icon" aria-hidden="true" />
                  </div>
                </div>

                <button
                  type="button"
                  className="month-nav-arrow"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="month-nav-actions">
                <button
                  type="button"
                  className={`today-badge-btn ${isCurrentMonth ? "today-badge-btn--active" : ""}`}
                  onClick={goToToday}
                >
                  Today
                </button>
              </div>
            </div>
          )}

          {/* ── Schedule Timeline Area ──────────────────────────── */}
          {loading ? (
            <div className="schedule-loading-state">
              <div className="schedule-loading-spinner" />
              <p>Loading scheduled activities…</p>
            </div>
          ) : (
            <div className={`schedule-workspace ${selectedItem ? "schedule-workspace--with-detail" : ""}`}>
              
              {/* TIMELINE COLUMN */}
              <div className={`schedule-timeline-pane ${isTransitioning ? "schedule-timeline-pane--fade" : ""}`}>
                {dateGroups.length === 0 ? (
                  /* Clean Empty State */
                  <div className="schedule-empty-card">
                    <div className="empty-icon-wrap">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="empty-title">No Scheduled Activities</h3>
                    <p className="empty-desc">
                      There are no NSS sessions or monthly activities scheduled for{" "}
                      {viewScope === "month" ? `${MONTH_NAMES[month]} ${year}` : "this selection"}.
                    </p>
                    <div className="empty-actions">
                      {viewScope === "month" ? (
                        <button
                          type="button"
                          className="empty-action-btn"
                          onClick={() => setViewScope("upcoming")}
                        >
                          View All Upcoming Activities
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="empty-action-btn"
                          onClick={() => setCategoryFilter("all")}
                        >
                          Clear Category Filter
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Vertical Chronological Timeline */
                  <div className="schedule-timeline">
                    {dateGroups.map((group, groupIdx) => (
                      <div
                        key={group.dateKey}
                        className={`timeline-group ${group.isPast ? "timeline-group--past" : ""} ${group.isToday ? "timeline-group--today" : ""}`}
                      >
                        {/* Left Date Column */}
                        <div className="timeline-date-col">
                          <div className="date-block">
                            <span className="date-day">{group.dayNum}</span>
                            <span className="date-month">{group.monthAbbr}</span>
                            <span className="date-weekday">{group.weekday}</span>
                            {group.isToday && <span className="date-today-tag">TODAY</span>}
                          </div>
                        </div>

                        {/* Middle Spine / Track Line */}
                        <div className="timeline-track-col" aria-hidden="true">
                          <div className={`timeline-node ${group.isToday ? "timeline-node--today" : ""}`} />
                          {groupIdx < dateGroups.length - 1 && <div className="timeline-spine-line" />}
                        </div>

                        {/* Right Content Column (Activities on this Date) */}
                        <div className="timeline-activities-col">
                          {group.items.map((item) => {
                            const isSelected = selectedItem?.id === item.id;
                            const isNext = nextActivityId === item.id;
                            const isMonthly = item.type === "monthly_event";
                            const categoryBadge = getCategoryBadge(item);
                            const startTime = item.startTime ? formatTimeDisplay(item.startTime) : "";
                            const endTime = item.endTime ? formatTimeDisplay(item.endTime) : "";

                            return (
                              <article
                                key={item.id}
                                className={`schedule-item-card ${isMonthly ? "schedule-item-card--monthly" : "schedule-item-card--session"} ${isSelected ? "schedule-item-card--active" : ""} ${isNext ? "schedule-item-card--next" : ""}`}
                                onClick={() => setSelectedItem(item)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setSelectedItem(item);
                                  }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-expanded={isSelected}
                                aria-label={`View details for ${item.title}`}
                              >
                                {isNext && (
                                  <div className="next-activity-indicator">
                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                    <span>Next Activity</span>
                                  </div>
                                )}

                                {/* Top Header Badge Row */}
                                <div className="card-top-row">
                                  <span className={`category-tag ${isMonthly ? "category-tag--monthly" : "category-tag--session"}`}>
                                    <Tag className="w-3 h-3 inline mr-1" />
                                    {categoryBadge}
                                  </span>

                                  {startTime && (
                                    <span className="time-badge">
                                      <Clock className="w-3 h-3 inline mr-1 text-slate-500" />
                                      {startTime}{endTime ? ` — ${endTime}` : ""}
                                    </span>
                                  )}
                                </div>

                                {/* Title & Parent Event */}
                                <h4 className="card-heading">{item.title}</h4>

                                {item.parentEventTitle && !isMonthly && (
                                  <div className="card-parent-link">
                                    <span>Part of </span>
                                    <strong className="text-slate-800">{item.parentEventTitle}</strong>
                                  </div>
                                )}

                                {isMonthly && (
                                  <div className="card-parent-link">
                                    <span className="text-amber-800 font-medium">Monthly NSS scheduled split-up programme</span>
                                  </div>
                                )}

                                {/* Meta Information Row: Venue & Units */}
                                <div className="card-meta-row">
                                  {item.location && (
                                    <div className="meta-point">
                                      <MapPin className="w-3.5 h-3.5 text-red-500 inline mr-1" />
                                      <span>{item.location}</span>
                                    </div>
                                  )}

                                  {Array.isArray(item.units) && item.units.length > 0 && (
                                    <div className="meta-point units-point">
                                      <Users className="w-3.5 h-3.5 text-slate-600 inline mr-1" />
                                      <span className="units-label">Units:</span>
                                      <span className="units-list">
                                        {isMonthly && item.units.length === 7
                                          ? "All Units (1–7)"
                                          : item.units.join(" · ")}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Bottom Interaction Trigger */}
                                <div className="card-bottom-action">
                                  <span className="action-label">
                                    {isMonthly ? "View Monthly Event Details" : "Explore Session Details"}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 action-arrow-icon" />
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Slide-In Detail Panel ───────────────────────────── */}
              {selectedItem && (
                <aside
                  className="schedule-detail-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Activity details"
                >
                  <div className="drawer-header">
                    <div className="drawer-header-left">
                      <span className={`drawer-badge ${selectedItem.type === "monthly_event" ? "drawer-badge--monthly" : "drawer-badge--session"}`}>
                        {getCategoryBadge(selectedItem)}
                      </span>
                      <span className="drawer-date-chip">
                        <Calendar className="w-3 h-3 text-gold inline mr-1" />
                        {selectedItem.date}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="drawer-close-btn"
                      onClick={() => setSelectedItem(null)}
                      aria-label="Close activity details"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="drawer-body">
                    <h3 className="drawer-title">{selectedItem.title}</h3>

                    {selectedItem.parentEventTitle && selectedItem.type !== "monthly_event" && (
                      <div className="drawer-parent-box">
                        <span className="drawer-parent-label">Parent Event:</span>
                        <h5 className="drawer-parent-title">{selectedItem.parentEventTitle}</h5>
                      </div>
                    )}

                    {selectedItem.type === "monthly_event" && (
                      <div className="drawer-monthly-note">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Monthly NSS Activity</strong>
                          <p className="text-xs text-amber-800 mt-0.5">
                            This is a scheduled all-unit NSS monthly activity. Individual sub-sessions are not required.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="drawer-spec-grid">
                      <div className="spec-item">
                        <span className="spec-label">
                          <Clock className="w-3.5 h-3.5 text-slate-500 inline mr-1" />
                          Time
                        </span>
                        <span className="spec-value">
                          {selectedItem.startTime ? formatTimeDisplay(selectedItem.startTime) : "TBA"}
                          {selectedItem.endTime ? ` – ${formatTimeDisplay(selectedItem.endTime)}` : ""}
                        </span>
                      </div>

                      <div className="spec-item">
                        <span className="spec-label">
                          <MapPin className="w-3.5 h-3.5 text-red-500 inline mr-1" />
                          Location / Venue
                        </span>
                        <span className="spec-value">{selectedItem.location || "NSS Campus"}</span>
                      </div>
                    </div>

                    {/* Attending Units */}
                    {Array.isArray(selectedItem.units) && selectedItem.units.length > 0 && (
                      <div className="drawer-units-section">
                        <span className="units-section-title">
                          <Users className="w-3.5 h-3.5 text-slate-700 inline mr-1" />
                          Attending Units
                        </span>
                        <div className="units-pill-container">
                          {selectedItem.units.map((u) => (
                            <span key={u} className="unit-number-tag">
                              Unit {u}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {selectedItem.description && (
                      <div className="drawer-description-section">
                        <span className="description-section-title">Overview & Schedule Notes</span>
                        <p className="description-text">{selectedItem.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="drawer-footer">
                    <button
                      type="button"
                      className="drawer-dismiss-btn"
                      onClick={() => setSelectedItem(null)}
                    >
                      Close Details
                    </button>
                  </div>
                </aside>
              )}

            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}
