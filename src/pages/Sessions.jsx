import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { getPublicCalendarData, formatTimeDisplay } from "../services/sessionService";
import "./Sessions.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];

  // Previous month tail
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false, monthOffset: -1 });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, monthOffset: 0 });
  }
  // Next month head
  const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  let next = 1;
  while (cells.length < total) {
    cells.push({ day: next++, current: false, monthOffset: 1 });
  }
  return cells;
}

export default function Sessions() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getPublicCalendarData();
        setCalendarData(data || {});
      } catch (err) {
        console.error("Failed to load public calendar data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const cells = buildCalendar(year, month);

  function changeMonth(dir) {
    let m = month + dir;
    let y = year;
    if (m > 11) {
      m = 0;
      y++;
    } else if (m < 0) {
      m = 11;
      y--;
    }
    setMonth(m);
    setYear(y);
    setSelectedDateKey(null);
  }

  function goToToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDateKey(null);
  }

  function dateKey(day, monthOffset = 0) {
    let targetYear = year;
    let targetMonth = month + monthOffset;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear++;
    } else if (targetMonth < 0) {
      targetMonth = 11;
      targetYear--;
    }
    return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleDayClick(cell) {
    if (!cell.current) return;
    const key = dateKey(cell.day, cell.monthOffset);
    if (calendarData[key] && calendarData[key].length > 0) {
      setSelectedDateKey(key);
    } else {
      setSelectedDateKey(null);
    }
  }

  const selectedItems = selectedDateKey ? calendarData[selectedDateKey] || [] : [];

  return (
    <div className="page-wrapper">
      {/* Compact Header */}
      <section className="sessions-header">
        <div className="sessions-header-text">
          <div className="eyebrow">Academic Calendar & Sessions</div>
          <h1>NSS Activity Schedule</h1>
          <p>Explore upcoming sessions, camps, and monthly events. Select any scheduled date to view full details.</p>
        </div>
      </section>

      {/* Main Calendar Body */}
      <section className="calendar-section section-pad">
        <div className="container">
          {/* Top Month & Year Controls */}
          <div className="calendar-header-bar">
            <div className="month-nav">
              <button className="month-btn" onClick={() => changeMonth(-1)} title="Previous Month">‹</button>
              
              <div className="month-year-selectors">
                {/* Month Dropdown */}
                <select
                  className="month-year-select"
                  value={month}
                  onChange={(e) => {
                    setMonth(Number(e.target.value));
                    setSelectedDateKey(null);
                  }}
                  aria-label="Select Month"
                >
                  {MONTH_NAMES.map((mName, idx) => (
                    <option key={idx} value={idx}>{mName}</option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  className="month-year-select"
                  value={year}
                  onChange={(e) => {
                    setYear(Number(e.target.value));
                    setSelectedDateKey(null);
                  }}
                  aria-label="Select Year"
                >
                  {Array.from({ length: 15 }, (_, i) => today.getFullYear() - 7 + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button className="month-btn" onClick={() => changeMonth(1)} title="Next Month">›</button>
            </div>

            <button className="today-btn" onClick={goToToday}>Today</button>
          </div>

          {loading ? (
            <div className="calendar-loading">Loading calendar sessions...</div>
          ) : (
            <div className={`calendar-layout ${selectedDateKey ? "calendar-layout--split" : "calendar-layout--full"}`}>
              {/* Calendar Grid Container */}
              <div className="calendar-grid-container">
                {/* Day headers */}
                <div className="cal-grid">
                  {DAY_HEADERS.map((d) => (
                    <div key={d} className="cal-day-header">{d}</div>
                  ))}

                  {cells.map((cell, i) => {
                    const key = cell.current ? dateKey(cell.day, cell.monthOffset) : null;
                    const itemsOnDay = key ? calendarData[key] || [] : [];
                    const hasEvent = itemsOnDay.length > 0;
                    const isSelected = key === selectedDateKey;
                    const hasMonthly = itemsOnDay.some((item) => item.type === "monthly_event");

                    return (
                      <div
                        key={i}
                        className={[
                          "cal-day",
                          !cell.current && "cal-day--other",
                          hasEvent && "cal-day--event",
                          hasMonthly && "cal-day--monthly",
                          isSelected && "cal-day--selected",
                        ].filter(Boolean).join(" ")}
                        onClick={() => handleDayClick(cell)}
                      >
                        <span className="cal-day-num">{cell.day}</span>
                        {hasEvent && (
                          <div className="cal-items-preview">
                            {itemsOnDay.map((item, idx) => (
                              <div
                                key={idx}
                                className={`cal-item-badge ${item.type === "monthly_event" ? "cal-item-badge--monthly" : "cal-item-badge--session"}`}
                                title={item.title}
                              >
                                {item.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="cal-legend">
                  <div className="legend-item">
                    <span className="legend-dot legend-dot--session" />
                    <span>Session</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot legend-dot--monthly" />
                    <span>Monthly Event</span>
                  </div>
                </div>
              </div>

              {/* Session / Monthly Event Details Panel */}
              {selectedDateKey && selectedItems.length > 0 && (
                <div className="calendar-details-panel">
                  <div className="panel-header">
                    <div>
                      <span className="panel-eyebrow">Scheduled Activities</span>
                      <h3 className="panel-date-title">
                        {new Date(selectedDateKey + "T00:00:00").toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                    </div>
                    <button className="panel-close-btn" onClick={() => setSelectedDateKey(null)}>
                      ✕ Close
                    </button>
                  </div>

                  <div className="panel-items-list">
                    {selectedItems.map((item) => {
                      const isMonthly = item.type === "monthly_event";
                      return (
                        <div key={item.id} className={`panel-card ${isMonthly ? "panel-card--monthly" : "panel-card--session"}`}>
                          <div className="panel-card-tags">
                            <span className={`tag-badge ${isMonthly ? "tag-badge--monthly" : "tag-badge--session"}`}>
                              {isMonthly ? "Monthly Event" : "Session"}
                            </span>
                            {item.eventType && (
                              <span className="tag-badge tag-badge--type">
                                {item.eventType.charAt(0).toUpperCase() + item.eventType.slice(1)}
                              </span>
                            )}
                          </div>

                          <h4 className="panel-card-title">{item.title}</h4>

                          {item.parentEventTitle && !isMonthly && (
                            <div className="panel-card-parent">
                              Part of: <strong>{item.parentEventTitle}</strong>
                            </div>
                          )}

                          <div className="panel-card-meta">
                            <span>🕒 {formatTimeDisplay(item.startTime)} – {formatTimeDisplay(item.endTime)}</span>
                            <span>📍 {item.location}</span>
                          </div>

                          {/* Attending Units */}
                          {item.units && item.units.length > 0 && (
                            <div className="panel-card-units">
                              <span className="units-label">Units Attending:</span>
                              <div className="units-badges-wrap">
                                {item.units.map((u) => (
                                  <span key={u} className="unit-pill">Unit {u}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.description && (
                            <p className="panel-card-desc">{item.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

