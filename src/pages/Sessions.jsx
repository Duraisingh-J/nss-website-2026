import React, { useState } from "react";
import Footer from "../components/Footer";
import ImagePlaceholder from "../components/ImagePlaceholder";
import { SESSIONS } from "../data/data";
import "./Sessions.css";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAY_HEADERS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];

  // Previous month tail
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  // Next month head
  const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  let next = 1;
  while (cells.length < total) {
    cells.push({ day: next++, current: false });
  }
  return cells;
}

export default function Sessions() {
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(0);
  const [selected, setSelected] = useState(null);

  const cells = buildCalendar(year, month);

  function changeMonth(dir) {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
    setSelected(null);
  }

  function dateKey(day) {
    return `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  function handleDayClick(cell) {
    if (!cell.current) return;
    const key = dateKey(cell.day);
    if (SESSIONS[key]) setSelected(key);
  }

  const session = selected ? SESSIONS[selected] : null;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <section className="sessions-header">
        <div className="sessions-header-text">
          <div className="eyebrow">Academic Calendar</div>
          <h1>NSS Sessions</h1>
          <p>Click on a highlighted date to view the session details and photos.</p>
        </div>
      </section>

      {/* Calendar */}
      <section className="calendar-section section-pad">
        {/* Month nav */}
        <div className="month-nav">
          <button className="month-btn" onClick={() => changeMonth(-1)}>‹</button>
          <h2 className="month-label">{MONTH_NAMES[month]} {year}</h2>
          <button className="month-btn" onClick={() => changeMonth(1)}>›</button>
        </div>

        {/* Day headers */}
        <div className="cal-grid">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="cal-day-header">{d}</div>
          ))}

          {cells.map((cell, i) => {
            const key = cell.current ? dateKey(cell.day) : null;
            const hasEvent = key && !!SESSIONS[key];
            const isSelected = key === selected;
            return (
              <div
                key={i}
                className={[
                  "cal-day",
                  !cell.current && "cal-day--other",
                  hasEvent && "cal-day--event",
                  isSelected && "cal-day--selected",
                ].filter(Boolean).join(" ")}
                onClick={() => handleDayClick(cell)}
              >
                <span className="cal-day-num">{cell.day}</span>
                {hasEvent && (
                  <>
                    <div className="cal-dot-row"><span className="cal-dot" /></div>
                    <div className="cal-event-label">
                      {SESSIONS[key].name.split(" ").slice(0, 3).join(" ")}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="cal-legend">
          <span className="legend-dot" />
          <span>Session scheduled on this date — click to view details</span>
        </div>

        {/* Session Detail */}
        {session && (
          <div className="session-detail">
            <div className="session-detail-header">
              <div>
                <div className="session-detail-date">
                  {new Date(selected).toLocaleDateString("en-IN", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </div>
                <h3 className="session-detail-name">{session.name}</h3>
                <div className="session-detail-loc">📍 {session.location}</div>
              </div>
              <button className="close-btn" onClick={() => setSelected(null)}>✕ Close</button>
            </div>

            <p className="session-detail-desc">{session.desc}</p>

            <div className="session-images-heading">
              Session Photos <span>({session.images} images)</span>
            </div>
            <div className="session-images-grid">
              {Array.from({ length: session.images }).map((_, idx) => (
                <div key={idx} className="session-img-wrap">
                  <ImagePlaceholder label={`Photo ${idx + 1}`} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
