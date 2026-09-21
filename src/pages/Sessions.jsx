import React, { useState, useEffect, useMemo } from "react";
import Footer from "../components/Footer";
import SessionsHero from "../components/sessions/SessionsHero";
import FeaturedNextSession from "../components/sessions/FeaturedNextSession";
import ActivityArchive from "../components/sessions/ActivityArchive";
import SessionDetailModal from "../components/sessions/SessionDetailModal";
import { getPublicCalendarData, formatTimeDisplay } from "../services/sessionService";
import { ArrowRight, Clock, MapPin, Users } from "lucide-react";
import "./Sessions.css";

/* ── Category Definitions ───────────────────────────────────── */
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "camp", label: "Camps" },
  { id: "outreach", label: "Outreach" },
  { id: "visit", label: "Orphanage Visits" },
  { id: "monthly", label: "Monthly Events" },
];

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function parseDateComponents(dateStr) {
  if (!dateStr) return { day: "—", month: "—", weekday: "—", year: "—" };
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return { day: dateStr, month: "", weekday: "", year: "" };
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = parts[2];
  const month = MONTH_NAMES[parts[1] - 1] || "SEP";
  const year = parts[0];
  const weekday = d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
  return { day, month, weekday, year };
}

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

function matchesCategory(item, filterId) {
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

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("upcoming"); // "upcoming" | "all"
  const [selectedItem, setSelectedItem] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);

  /* ── Load Public Data from Supabase ───────────────────────── */
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

  /* ── Chronologically Flattened Activities List ─────────────── */
  const { allChronologicalItems, pastArchiveItems } = useMemo(() => {
    const sortedDates = Object.keys(calendarData).sort();
    const all = [];
    const past = [];

    sortedDates.forEach((dateStr) => {
      const items = calendarData[dateStr] || [];
      const isPast = dateStr < todayKey;

      items.forEach((item) => {
        const flatItem = {
          ...item,
          dateStr,
          isPast,
        };
        all.push(flatItem);
        if (isPast) {
          past.push(flatItem);
        }
      });
    });

    return {
      allChronologicalItems: all,
      pastArchiveItems: past,
    };
  }, [calendarData, todayKey]);

  /* ── Featured Next Activity (Single Imminent Session) ──────── */
  const nextFeaturedItem = useMemo(() => {
    const upcoming = allChronologicalItems.filter((it) => !it.isPast);
    if (upcoming.length > 0) return upcoming[0];
    if (allChronologicalItems.length > 0) return allChronologicalItems[0];
    return null;
  }, [allChronologicalItems]);

  /* ── Filtered Remaining Activities (Excluding Featured) ────── */
  const upcomingActivitiesList = useMemo(() => {
    let candidateList = allChronologicalItems;

    // Apply Scope Filter
    if (scopeFilter === "upcoming") {
      candidateList = candidateList.filter((it) => !it.isPast);
    }

    // Apply Category Filter
    candidateList = candidateList.filter((it) => matchesCategory(it, categoryFilter));

    // Exclude the featured session so it does not repeat
    if (nextFeaturedItem) {
      candidateList = candidateList.filter((it) => it.id !== nextFeaturedItem.id);
    }

    return candidateList;
  }, [allChronologicalItems, scopeFilter, categoryFilter, nextFeaturedItem]);

  return (
    <div className="page-wrapper nss-editorial-page">
      
      {/* 1. Magazine / Editorial Hero */}
      <SessionsHero />

      {/* Main Content Area */}
      <main className="sessions-main-container">
        
        {/* 2. Simplified Activity Navigation */}
        <nav className="sessions-nav-strip" aria-label="Activities Navigation">
          <div className="sessions-nav-left">
            <span className="sessions-nav-label">EXPLORE SESSIONS</span>
            <div className="sessions-tabs" role="tablist">
              {CATEGORIES.map((cat) => {
                const isActive = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`sessions-tab-btn ${isActive ? "sessions-tab-btn--active" : ""}`}
                    onClick={() => setCategoryFilter(cat.id)}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Far Right: Scope Switcher (Upcoming vs All) */}
          <div className="sessions-scope-toggle" role="group" aria-label="Scope Toggle">
            <button
              type="button"
              className={`sessions-scope-btn ${scopeFilter === "upcoming" ? "sessions-scope-btn--active" : ""}`}
              onClick={() => setScopeFilter("upcoming")}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`sessions-scope-btn ${scopeFilter === "all" ? "sessions-scope-btn--active" : ""}`}
              onClick={() => setScopeFilter("all")}
            >
              All
            </button>
          </div>
        </nav>

        {loading ? (
          <div className="sessions-loading-state">
            <div className="sessions-spinner" />
            <p className="sessions-loading-text">Loading NSS programme schedule…</p>
          </div>
        ) : (
          <>
            {/* 3. Featured Next Activity Showcase */}
            {nextFeaturedItem && (
              <FeaturedNextSession
                session={nextFeaturedItem}
                onSelectSession={setSelectedItem}
              />
            )}

            {/* 4. Upcoming Activities Editorial List */}
            <section className="upcoming-activities-section" aria-label="Upcoming Activities">
              <div className="upcoming-section-header">
                <h2 className="upcoming-section-title font-editorial">
                  UPCOMING ACTIVITIES
                </h2>
                <p className="upcoming-section-desc">
                  A closer look at what's happening across NSS.
                </p>
              </div>

              {upcomingActivitiesList.length === 0 ? (
                <div className="activities-empty-box">
                  <p className="empty-title">No upcoming activities found</p>
                  <p className="empty-desc">
                    {categoryFilter !== "all"
                      ? "There are no scheduled sessions in this category at this time."
                      : "Check back soon for new announcements and programme updates."}
                  </p>
                  {categoryFilter !== "all" && (
                    <button
                      type="button"
                      className="empty-reset-btn"
                      onClick={() => setCategoryFilter("all")}
                    >
                      Show All Categories
                    </button>
                  )}
                </div>
              ) : (
                <div className="activity-editorial-list">
                  {upcomingActivitiesList.map((item) => {
                    const dateInfo = parseDateComponents(item.dateStr || item.date);
                    const category = getCategoryBadge(item);
                    const startTime = item.startTime ? formatTimeDisplay(item.startTime) : "";
                    const endTime = item.endTime ? formatTimeDisplay(item.endTime) : "";
                    const timeRange = startTime ? `${startTime}${endTime ? ` — ${endTime}` : ""}` : "";
                    const location = item.location || "NSS Campus";
                    const isMonthly = item.type === "monthly_event";
                    const unitsDisplay = Array.isArray(item.units) && item.units.length > 0
                      ? isMonthly && item.units.length === 7 ? "All Units (1–7)" : `Units ${item.units.join(" · ")}`
                      : "All Units";

                    return (
                      <article
                        key={item.id}
                        className="activity-editorial-row"
                        onClick={() => setSelectedItem(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedItem(item);
                          }
                        }}
                        aria-label={`View details for ${item.title}`}
                      >
                        {/* Column 1: Date */}
                        <div className="activity-row-date">
                          <span className="activity-date-num font-editorial">
                            {dateInfo.day}
                          </span>
                          <div className="activity-date-sub">
                            <span className="activity-date-month">{dateInfo.month}</span>
                            <span className="activity-date-weekday">{dateInfo.weekday}</span>
                          </div>
                        </div>

                        {/* Column 2: Activity Details */}
                        <div className="activity-row-body">
                          <div className="activity-category-label">
                            {category}
                          </div>

                          <h3 className="activity-row-title font-editorial">
                            {item.title}
                          </h3>

                          {item.parentEventTitle ? (
                            <p className="activity-row-subtitle">
                              Part of {item.parentEventTitle}
                            </p>
                          ) : isMonthly ? (
                            <p className="activity-row-subtitle">
                              Monthly All-Unit Scheduled Assembly
                            </p>
                          ) : null}

                          {/* Subtle Metadata */}
                          <div className="activity-row-meta">
                            {timeRange && (
                              <span className="activity-meta-item">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{timeRange}</span>
                              </span>
                            )}
                            {timeRange && location && <span className="activity-meta-sep">·</span>}
                            {location && (
                              <span className="activity-meta-item">
                                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                <span>{location}</span>
                              </span>
                            )}
                            {location && unitsDisplay && <span className="activity-meta-sep">·</span>}
                            {unitsDisplay && (
                              <span className="activity-meta-item">
                                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{unitsDisplay}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Column 3: Subtle Action */}
                        <div className="activity-row-action" aria-hidden="true">
                          <span className="activity-explore-text">Explore</span>
                          <ArrowRight className="w-4 h-4 activity-arrow-icon" />
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 5. Minimalist Historical Activity Archive */}
            {pastArchiveItems.length > 0 && (
              <ActivityArchive
                archiveItems={pastArchiveItems}
                onSelectSession={setSelectedItem}
              />
            )}
          </>
        )}

      </main>

      {/* Modal: Full Specifications & Calendar Integration */}
      {selectedItem && (
        <SessionDetailModal
          session={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Standard Footer */}
      <Footer />
    </div>
  );
}
