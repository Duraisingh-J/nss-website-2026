import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import PageHero from "../components/ui/PageHero";
import { getPublicEvents, formatDateDisplay } from "../services/eventService";
import { getSessionsForEvent, formatTimeDisplay } from "../services/sessionService";
import { EVENTS_BY_YEAR } from "../data/data";
import { Calendar, MapPin, Clock, ArrowRight, ArrowLeft, X, Tag } from "lucide-react";
import "./Events.css";

export default function Events() {
  const [eventsByYear, setEventsByYear] = useState(EVENTS_BY_YEAR);
  const [activeYear, setActiveYear] = useState("all");
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventSessions, setEventSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const publicEvents = await getPublicEvents();
        if (publicEvents && publicEvents.length > 0) {
          const grouped = {};
          publicEvents.forEach((ev) => {
            const yr = ev.start_date ? new Date(ev.start_date).getFullYear() : 2026;
            const academicYrKey = `${yr}–${String(yr + 1).slice(2)}`;
            if (!grouped[academicYrKey]) grouped[academicYrKey] = [];
            grouped[academicYrKey].push({
              id: ev.id,
              title: ev.title,
              type: ev.event_type || "camp",
              categoryLabel: ev.categoryLabel || "Event",
              date: formatDateDisplay(ev.start_date),
              startDateRaw: ev.start_date,
              location: "NSS Campus",
              desc: ev.description || "",
              coverUrl: ev.cover_image_url,
              images: ev.cover_image_url ? 1 : 0,
            });
          });
          setEventsByYear(grouped);
        }
      } catch (err) {
        console.warn("Failed to load public events from Supabase:", err.message);
      }
    }
    loadEvents();
  }, []);

  const academicYears = Object.keys(eventsByYear);

  // Flatten events based on active year filter
  const allEventsList = React.useMemo(() => {
    if (activeYear === "all") {
      let list = [];
      Object.values(eventsByYear).forEach((arr) => {
        list = list.concat(arr);
      });
      return list;
    }
    return eventsByYear[activeYear] || [];
  }, [eventsByYear, activeYear]);

  // Featured Event: first item in selected year/all list
  const featuredEvent = allEventsList.length > 0 ? allEventsList[0] : null;
  const gridEvents = allEventsList.length > 1 ? allEventsList.slice(1) : allEventsList;

  async function selectEvent(ev) {
    setActiveEvent(ev);
    setEventSessions([]);
    setSelectedSessionDetail(null);

    if (ev.id && typeof ev.id === "string" && ev.id.length > 20) {
      setLoadingSessions(true);
      try {
        const sessions = await getSessionsForEvent(ev.id);
        setEventSessions(sessions || []);
      } catch (err) {
        console.warn("Failed to load sessions for public event:", err);
      } finally {
        setLoadingSessions(false);
      }
    }

    window.scrollTo({ top: 100, behavior: "smooth" });
  }

  return (
    <div className="page-wrapper events-page-theme">
      {/* -------------------------------------------------- */}
      {/* PAGE HERO — unified design via shared PageHero     */}
      {/* -------------------------------------------------- */}
      <PageHero
        watermark="EVENTS"
        eyebrow="NSS ACTIVITIES"
        title="Events"
        description="Explore NSS programmes, community outreach initiatives, annual camps, and monthly split-up activities."
      >
        {/* Academic Year Filter Selector Pills */}
        <div className="academic-year-bar">
          <span className="academic-year-label">Academic Year:</span>
          <div className="year-pills-wrap">
            <button
              type="button"
              className={`year-pill ${activeYear === "all" ? "year-pill--active" : ""}`}
              onClick={() => {
                setActiveYear("all");
                setActiveEvent(null);
              }}
            >
              All Years
            </button>
            {academicYears.map((yr) => (
              <button
                key={yr}
                type="button"
                className={`year-pill ${activeYear === yr ? "year-pill--active" : ""}`}
                onClick={() => {
                  setActiveYear(yr);
                  setActiveEvent(null);
                }}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </PageHero>

      {/* -------------------------------------------------- */}
      {/* MAIN BODY: EVENT DETAIL OR EDITORIAL GRID          */}
      {/* -------------------------------------------------- */}
      <section className="events-main-body section-pad">
        <div className="events-body-container">
          {activeEvent ? (
            /* ================================================== */
            /* EVENT DETAIL EDITORIAL VIEW                        */
            /* ================================================== */
            <div className="event-editorial-detail animate-in fade-in duration-300">
              <button
                type="button"
                className="back-events-btn"
                onClick={() => {
                  setActiveEvent(null);
                  setSelectedSessionDetail(null);
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Events</span>
              </button>

              <div className="event-detail-hero-card">
                <div className="event-detail-header-top">
                  <div className="event-category-badge">
                    <Tag className="w-3.5 h-3.5 inline mr-1" />
                    {activeEvent.categoryLabel || activeEvent.type?.toUpperCase()}
                  </div>
                  <div className="event-date-chip">
                    <Calendar className="w-3.5 h-3.5 text-gold inline mr-1" />
                    {activeEvent.date}
                  </div>
                </div>

                <h2 className="event-detail-heading">{activeEvent.title}</h2>

                <div className="event-detail-location-chip">
                  <MapPin className="w-4 h-4 text-red-500 inline mr-1" />
                  {activeEvent.location || "NSS MIT Campus"}
                </div>

                {activeEvent.desc && (
                  <p className="event-detail-description-lead">
                    {activeEvent.desc}
                  </p>
                )}

                {activeEvent.coverUrl && (
                  <div className="event-detail-cover-wrap">
                    <img
                      src={activeEvent.coverUrl}
                      alt={activeEvent.title}
                      className="event-detail-cover-img"
                    />
                  </div>
                )}

                {/* SESSIONS SCHEDULE TIMELINE SECTION */}
                <div className="event-sessions-schedule-section">
                  <div className="schedule-section-header">
                    <Clock className="w-5 h-5 text-red-600" />
                    <h3 className="schedule-section-title">Program Schedule & Sessions</h3>
                  </div>

                  {activeEvent.categoryLabel === "Monthly Event" ? (
                    <div className="monthly-event-schedule-notice">
                      <p className="font-semibold text-slate-900 mb-1">Monthly Event Activity</p>
                      <p className="text-xs text-slate-600">
                        This Monthly Event represents a scheduled single activity for NSS units. Individual sub-sessions are not required.
                      </p>
                    </div>
                  ) : loadingSessions ? (
                    <div className="sessions-loading-notice">Loading scheduled sessions...</div>
                  ) : eventSessions.length === 0 ? (
                    <div className="no-sessions-notice">
                      No sub-sessions currently scheduled for this event.
                    </div>
                  ) : (
                    <div className="sessions-timeline">
                      {eventSessions.map((s, idx) => (
                        <div
                          key={s.id || idx}
                          className="timeline-item"
                          onClick={() => setSelectedSessionDetail(s)}
                        >
                          <div className="timeline-marker">
                            <span className="marker-dot" />
                            {idx < eventSessions.length - 1 && <span className="marker-line" />}
                          </div>

                          <div className="timeline-content-card">
                            <div className="timeline-card-top">
                              <span className="timeline-time-badge">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatTimeDisplay(s.start_time)} – {formatTimeDisplay(s.end_time)}
                              </span>
                              <span className="timeline-date-chip">
                                {formatDateDisplay(s.session_date)}
                              </span>
                            </div>

                            <h4 className="timeline-session-title">{s.title}</h4>

                            <div className="timeline-meta-row">
                              <span>📍 {s.location}</span>
                            </div>

                            {Array.isArray(s.units) && s.units.length > 0 && (
                              <div className="timeline-units-row">
                                <span className="units-heading">Units:</span>
                                <div className="units-pills-wrap">
                                  {s.units.map((u) => (
                                    <span key={u} className="unit-badge">
                                      Unit {u}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {s.description && (
                              <p className="timeline-session-desc line-clamp-2">{s.description}</p>
                            )}

                            <div className="timeline-view-more flex items-center gap-1 text-xs text-red-700 font-semibold mt-2">
                              <span>View session details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================================================== */
            /* EDITORIAL EVENTS LIST & FEATURED HERO GRID         */
            /* ================================================== */
            <div className="editorial-events-wrapper">
              {/* FEATURED EVENT HERO CARD */}
              {featuredEvent && (
                <div className="featured-event-hero" onClick={() => selectEvent(featuredEvent)}>
                  <div className="featured-event-media">
                    {featuredEvent.coverUrl ? (
                      <img
                        src={featuredEvent.coverUrl}
                        alt={featuredEvent.title}
                        className="featured-hero-img"
                      />
                    ) : (
                      <div className="featured-hero-fallback">
                        <Calendar className="w-16 h-16 text-slate-300" />
                      </div>
                    )}
                    <span className="featured-badge">FEATURED ACTIVITY</span>
                  </div>

                  <div className="featured-event-content">
                    <div className="featured-category-pill">
                      {featuredEvent.categoryLabel || featuredEvent.type?.toUpperCase()}
                    </div>
                    <h2 className="featured-title">{featuredEvent.title}</h2>
                    <div className="featured-meta">
                      <span className="meta-item">
                        <Calendar className="w-4 h-4 text-gold inline mr-1" />
                        {featuredEvent.date}
                      </span>
                      <span className="meta-item">
                        <MapPin className="w-4 h-4 text-red-500 inline mr-1" />
                        {featuredEvent.location}
                      </span>
                    </div>
                    {featuredEvent.desc && (
                      <p className="featured-desc line-clamp-3">{featuredEvent.desc}</p>
                    )}
                    <button type="button" className="featured-explore-btn">
                      <span>Explore Event</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* UPCOMING / RECENT ACTIVITIES SECTION HEADER */}
              <div className="section-divider-bar">
                <h3 className="section-divider-title">Upcoming & Recent Activities</h3>
                <span className="section-divider-count">({allEventsList.length} events)</span>
              </div>

              {/* EVENTS GRID */}
              {gridEvents.length === 0 ? (
                <div className="no-events-box">
                  <p>No events found for the selected academic year.</p>
                </div>
              ) : (
                <div className="events-grid-layout">
                  {gridEvents.map((ev) => (
                    <article
                      key={ev.id}
                      className="event-card-item"
                      onClick={() => selectEvent(ev)}
                    >
                      <div className="event-card-media">
                        {ev.coverUrl ? (
                          <img
                            src={ev.coverUrl}
                            alt={ev.title}
                            className="event-card-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="event-card-placeholder">
                            <Calendar className="w-10 h-10 text-slate-300" />
                          </div>
                        )}
                        <span className="card-category-tag">
                          {ev.categoryLabel || ev.type?.toUpperCase()}
                        </span>
                      </div>

                      <div className="event-card-body">
                        <div className="card-date-badge">
                          <Calendar className="w-3.5 h-3.5 text-red-600 inline mr-1" />
                          {ev.date}
                        </div>
                        <h4 className="card-title">{ev.title}</h4>
                        {ev.desc && <p className="card-snippet line-clamp-2">{ev.desc}</p>}

                        <div className="card-footer-action">
                          <span className="action-text">Explore</span>
                          <ArrowRight className="w-4 h-4 action-arrow" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SESSION DETAIL MODAL DIALOG                        */}
      {/* -------------------------------------------------- */}
      {selectedSessionDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
              <div>
                <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-red-700 text-white">
                  Session Details
                </span>
                <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                  {selectedSessionDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              {activeEvent && (
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">Parent Event</span>
                  <span className="font-bold text-slate-900 text-sm">{activeEvent.title}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDateDisplay(selectedSessionDetail.session_date)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">Timing</span>
                  <span className="font-semibold text-slate-800">
                    {formatTimeDisplay(selectedSessionDetail.start_time)} – {formatTimeDisplay(selectedSessionDetail.end_time)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block">Location</span>
                <span className="font-semibold text-slate-800">
                  📍 {selectedSessionDetail.location || "NSS Campus"}
                </span>
              </div>

              {Array.isArray(selectedSessionDetail.units) && selectedSessionDetail.units.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold block">Attending Units</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSessionDetail.units.map((u) => (
                      <span
                        key={u}
                        className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-red-50 text-red-700 border border-red-200"
                      >
                        Unit {u}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSessionDetail.description && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Description & Agenda</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-md border border-slate-200">
                    {selectedSessionDetail.description}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="px-4 py-2 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}


