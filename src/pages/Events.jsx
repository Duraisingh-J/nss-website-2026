import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import ImagePlaceholder from "../components/ImagePlaceholder";
import { getPublicEvents, formatDateDisplay } from "../services/eventService";
import { getSessionsForEvent, formatTimeDisplay } from "../services/sessionService";
import { EVENTS_BY_YEAR } from "../data/data";
import "./Events.css";

export default function Events() {
  const [eventsByYear, setEventsByYear] = useState(EVENTS_BY_YEAR);
  const [activeYear, setActiveYear] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeDay, setActiveDay]   = useState(1);
  const [eventSessions, setEventSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const publicEvents = await getPublicEvents();
        if (publicEvents && publicEvents.length > 0) {
          // Group fetched events by Academic Year (e.g., "2026–27" based on start_date)
          const grouped = {};
          publicEvents.forEach((ev) => {
            const yr = ev.start_date ? new Date(ev.start_date).getFullYear() : 2026;
            const academicYrKey = `${yr}–${String(yr + 1).slice(2)}`;
            if (!grouped[academicYrKey]) grouped[academicYrKey] = [];
            grouped[academicYrKey].push({
              id: ev.id,
              title: ev.title,
              type: ev.event_type,
              categoryLabel: ev.categoryLabel,
              date: formatDateDisplay(ev.start_date),
              location: "NSS Campus",
              desc: ev.description,
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

  function selectYear(yr) {
    if (activeYear === yr) {
      setActiveYear(null);
      setActiveEvent(null);
      setEventSessions([]);
    } else {
      setActiveYear(yr);
      setActiveEvent(null);
      setEventSessions([]);
    }
  }

  async function selectEvent(ev) {
    setActiveEvent(ev);
    setActiveDay(1);
    setEventSessions([]);

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

    setTimeout(() => {
      document.getElementById("event-detail-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const event = activeEvent;
  const hasDays = isArrayWithItems(event?.days);
  const isCampWithDays = event?.type === "camp" && hasDays;

  function isArrayWithItems(arr) {
    return Array.isArray(arr) && arr.length > 0;
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <section className="events-page-header">
        <div className="events-page-header-text">
          <div className="eyebrow">NSS Activities</div>
          <h1>Events</h1>
          <p>Browse events by academic year. Click an event to view full details and scheduled sessions.</p>
        </div>
      </section>

      <section className="events-page-body section-pad">
        {/* Year list */}
        <div className="year-list">
          {academicYears.map((yr) => (
            <div key={yr} className={`year-block${activeYear === yr ? " year-block--open" : ""}`}>
              {/* Year row */}
              <button className="year-row" onClick={() => selectYear(yr)}>
                <div className="year-row-left">
                  <span className="year-icon">📅</span>
                  <div>
                    <div className="year-title">{yr}</div>
                    <div className="year-sub">{eventsByYear[yr]?.length || 0} events</div>
                  </div>
                </div>
                <span className={`year-arrow${activeYear === yr ? " year-arrow--open" : ""}`}>›</span>
              </button>

              {/* Events for this year */}
              {activeYear === yr && (
                <div className="event-list">
                  {eventsByYear[yr]?.map((ev) => (
                    <button
                      key={ev.id}
                      className={`event-row${activeEvent?.id === ev.id ? " event-row--active" : ""}`}
                      onClick={() => selectEvent(ev)}
                    >
                      <div className="event-row-icon">
                        {ev.type === "camp" ? "🏕️" : "🤝"}
                      </div>
                      <div className="event-row-info">
                        <div className="event-row-title">{ev.title}</div>
                        <div className="event-row-meta">{ev.date} · {ev.location}</div>
                      </div>
                      <div className="event-row-badge">
                        {ev.categoryLabel || (ev.type === "camp" ? "Camp" : "Visit")}
                      </div>
                      <span className="event-row-arrow">›</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Event detail */}
        {event && (
          <div id="event-detail-section" className="event-detail-panel">
            {/* Event top */}
            <div className="event-detail-top">
              <div className="event-detail-meta">
                <span className="event-detail-type">
                  {event.categoryLabel || (event.type === "camp" ? "🏕️ Camp" : "🤝 Event")}
                </span>
                <span className="event-detail-date">{event.date}</span>
              </div>
              <h2 className="event-detail-title">{event.title}</h2>
              <div className="event-detail-loc">📍 {event.location}</div>
              <button className="close-btn" onClick={() => setActiveEvent(null)}>✕ Close</button>
            </div>

            {/* Event Body */}
            {!isCampWithDays && (
              <div className="visit-body">
                <p>{event.desc || "No description provided for this event."}</p>

                {/* Cover Image if uploaded */}
                {event.coverUrl && (
                  <div className="event-cover-banner" style={{ margin: "20px 0" }}>
                    <img
                      src={event.coverUrl}
                      alt={event.title}
                      style={{ maxWidth: "100%", maxHeight: "360px", borderRadius: "6px", objectFit: "cover" }}
                    />
                  </div>
                )}

                {/* Standard Images Grid if static */}
                {event.images > 0 && !event.coverUrl && (
                  <>
                    <div className="event-images-label">
                      Event Photos <span>({event.images} images)</span>
                    </div>
                    <div className="event-images-grid">
                      {Array.from({ length: event.images }).map((_, i) => (
                        <div key={i} className="event-img-wrap">
                          <ImagePlaceholder label={`Photo ${i + 1}`} size="sm" />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Embedded Event Sessions List */}
                <div className="public-sessions-container" style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #E2E8F0" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--navy)", marginBottom: "12px" }}>
                    Event Sessions & Schedule
                  </h3>

                  {loadingSessions ? (
                    <div style={{ fontSize: "13px", color: "#64748B" }}>Loading sessions...</div>
                  ) : eventSessions.length === 0 ? (
                    <div style={{ fontSize: "13px", color: "#64748B", italic: "true" }}>
                      No sub-sessions scheduled for this event.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {eventSessions.map((s, idx) => (
                        <div
                          key={s.id || idx}
                          style={{
                            background: "#F8FAFC",
                            padding: "14px 16px",
                            borderRadius: "6px",
                            borderLeft: "4px solid var(--navy)",
                            border: "1px solid #E2E8F0",
                            borderLeftWidth: "4px",
                          }}
                        >
                          <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--navy)" }}>
                            {s.title}
                          </div>
                          <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
                            🕒 {formatDateDisplay(s.session_date)} · {formatTimeDisplay(s.start_time)} – {formatTimeDisplay(s.end_time)} | 📍 {s.location}
                          </div>
                          {s.units && s.units.length > 0 && (
                            <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748B" }}>Units:</span>
                              {s.units.map((u) => (
                                <span
                                  key={u}
                                  style={{
                                    background: "#E2E8F0",
                                    color: "#1E293B",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    padding: "2px 6px",
                                    borderRadius: "10px",
                                  }}
                                >
                                  Unit {u}
                                </span>
                              ))}
                            </div>
                          )}
                          {s.description && (
                            <p style={{ fontSize: "13px", color: "#475569", marginTop: "6px", margin: "6px 0 0" }}>
                              {s.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Camp — day tabs (Legacy static structure) */}
            {isCampWithDays && (
              <div className="camp-body">
                {/* Day tab strip */}
                <div className="day-tabs">
                  {event.days.map((d) => (
                    <button
                      key={d.day}
                      className={`day-tab${activeDay === d.day ? " day-tab--active" : ""}`}
                      onClick={() => setActiveDay(d.day)}
                    >
                      Day {d.day}
                    </button>
                  ))}
                </div>

                {/* Day content */}
                {event.days
                  .filter((d) => d.day === activeDay)
                  .map((d) => (
                    <div key={d.day} className="day-content">
                      <div className="day-content-top">
                        <div className="day-badge">Day {d.day} of {event.days.length}</div>
                        <h3 className="day-title">{d.title}</h3>
                      </div>
                      <p className="day-desc">{d.desc}</p>

                      <div className="event-images-label">
                        Day {d.day} Photos <span>(3 images)</span>
                      </div>
                      <div className="event-images-grid">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="event-img-wrap">
                            <ImagePlaceholder label={`Day ${d.day} · Photo ${n}`} size="sm" />
                          </div>
                        ))}
                      </div>

                      {/* Prev / Next day nav */}
                      <div className="day-nav">
                        <button
                          className="day-nav-btn"
                          disabled={activeDay === 1}
                          onClick={() => setActiveDay(activeDay - 1)}
                        >
                          ‹ Previous Day
                        </button>
                        <span className="day-nav-label">Day {d.day} / {event.days.length}</span>
                        <button
                          className="day-nav-btn"
                          disabled={activeDay === event.days.length}
                          onClick={() => setActiveDay(activeDay + 1)}
                        >
                          Next Day ›
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

