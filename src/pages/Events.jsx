import React, { useState } from "react";
import Footer from "../components/Footer";
import ImagePlaceholder from "../components/ImagePlaceholder";
import { EVENTS_BY_YEAR } from "../data/data";
import "./Events.css";

const ACADEMIC_YEARS = Object.keys(EVENTS_BY_YEAR);

export default function Events() {
  const [activeYear, setActiveYear] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeDay, setActiveDay]   = useState(1);

  function selectYear(yr) {
    if (activeYear === yr) {
      setActiveYear(null);
      setActiveEvent(null);
    } else {
      setActiveYear(yr);
      setActiveEvent(null);
    }
  }

  function selectEvent(ev) {
    setActiveEvent(ev);
    setActiveDay(1);
    setTimeout(() => {
      document.getElementById("event-detail-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const event = activeEvent;
  const isCamp = event?.type === "camp";

  return (
    <div className="page-wrapper">
      {/* Header */}
      <section className="events-page-header">
        <div className="events-page-header-text">
          <div className="eyebrow">NSS Activities</div>
          <h1>Events</h1>
          <p>Browse events by academic year. Click an event to view full details, and explore each day of our camps.</p>
        </div>
      </section>

      <section className="events-page-body section-pad">
        {/* Year list */}
        <div className="year-list">
          {ACADEMIC_YEARS.map((yr) => (
            <div key={yr} className={`year-block${activeYear === yr ? " year-block--open" : ""}`}>
              {/* Year row */}
              <button className="year-row" onClick={() => selectYear(yr)}>
                <div className="year-row-left">
                  <span className="year-icon">📅</span>
                  <div>
                    <div className="year-title">{yr}</div>
                    <div className="year-sub">{EVENTS_BY_YEAR[yr].length} events</div>
                  </div>
                </div>
                <span className={`year-arrow${activeYear === yr ? " year-arrow--open" : ""}`}>›</span>
              </button>

              {/* Events for this year */}
              {activeYear === yr && (
                <div className="event-list">
                  {EVENTS_BY_YEAR[yr].map((ev) => (
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
                        {ev.type === "camp" ? "7‑Day Camp" : "Visit"}
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
                  {event.type === "camp" ? "🏕️ Camp" : "🤝 Visit"}
                </span>
                <span className="event-detail-date">{event.date}</span>
              </div>
              <h2 className="event-detail-title">{event.title}</h2>
              <div className="event-detail-loc">📍 {event.location}</div>
              <button className="close-btn" onClick={() => setActiveEvent(null)}>✕ Close</button>
            </div>

            {/* Visit — simple desc + images */}
            {!isCamp && (
              <div className="visit-body">
                <p>{event.desc}</p>
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
              </div>
            )}

            {/* Camp — day tabs */}
            {isCamp && (
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
                        <div className="day-badge">Day {d.day} of 7</div>
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
                        <span className="day-nav-label">Day {d.day} / 7</span>
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
