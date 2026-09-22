/**
 * Time and Status Utility Functions for Live Automatic Schedule Transitions
 * 
 * Rules:
 *   now < start_at           => "UPCOMING"
 *   start_at <= now < end_at => "ONGOING"
 *   now >= end_at            => "COMPLETED"
 * 
 * At exactly start time: ONGOING
 * At exactly end time: COMPLETED
 */

export const STATUS = {
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
};

/**
 * Parses date string and time string into a valid local Date object.
 * 
 * @param {string|Date} dateStr - Date representation (e.g. "2026-09-22", "2026-09-22T00:00:00.000Z")
 * @param {string} [timeStr] - Optional time string (e.g. "10:00", "10:00:00", "10:00 AM", "02:30 PM")
 * @param {boolean} [isEnd=false] - If true and time is omitted, defaults to 23:59:59.999; if false, defaults to 00:00:00.000
 * @returns {Date|null}
 */
export function parseDateTime(dateStr, timeStr, isEnd = false) {
  if (!dateStr) return null;

  let year, month, day;

  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return null;
    year = dateStr.getFullYear();
    month = dateStr.getMonth();
    day = dateStr.getDate();
  } else if (typeof dateStr === "string") {
    const cleanDate = dateStr.split("T")[0];
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
  }

  if (year === undefined || isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  let hours = isEnd ? 23 : 0;
  let minutes = isEnd ? 59 : 0;
  let seconds = isEnd ? 59 : 0;
  let milliseconds = isEnd ? 999 : 0;

  if (timeStr && typeof timeStr === "string") {
    const trimmed = timeStr.trim();
    const isPM = /pm/i.test(trimmed);
    const isAM = /am/i.test(trimmed);
    const numPart = trimmed.replace(/[^\d:]/g, "");
    const timeParts = numPart.split(":");

    if (timeParts.length >= 1 && timeParts[0] !== "") {
      let h = parseInt(timeParts[0], 10);
      const m = timeParts.length >= 2 ? parseInt(timeParts[1], 10) : 0;
      const s = timeParts.length >= 3 ? parseInt(timeParts[2], 10) : 0;

      if (!isNaN(h)) {
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;
        hours = h;
        minutes = !isNaN(m) ? m : 0;
        seconds = !isNaN(s) ? s : 0;
        milliseconds = 0;
      }
    }
  }

  // NSS schedules are stored as India Standard Time (Asia/Kolkata, UTC+05:30).
  // Build the instant explicitly so the result is identical regardless of the viewer's device timezone.
  const utcMs = Date.UTC(year, month, day, hours, minutes, seconds, milliseconds);
  return new Date(utcMs - (5 * 60 + 30) * 60 * 1000);
}

/**
 * Calculates live timing status for a single Session object.
 *
 * @param {Object} session
 * @param {Date|number} [now=new Date()]
 * @returns {"UPCOMING"|"ONGOING"|"COMPLETED"}
 */
export function getSessionStatus(session, now = new Date()) {
  if (!session) return STATUS.UPCOMING;

  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const dateStr = session.session_date || session.date || session.start_date || session.startDate;
  if (!dateStr) return STATUS.UPCOMING;

  const startTimeStr = session.start_time || session.startTime;
  const endTimeStr = session.end_time || session.endTime;

  const startDT = parseDateTime(dateStr, startTimeStr, false);
  const endDT = parseDateTime(dateStr, endTimeStr || startTimeStr, true);

  if (!startDT) return STATUS.UPCOMING;

  const startMs = startDT.getTime();
  // If no end time was provided, give standard session default of 1.5 hours after start
  const endMs = endDT ? endDT.getTime() : startMs + 90 * 60 * 1000;

  if (nowMs < startMs) {
    return STATUS.UPCOMING;
  } else if (nowMs >= startMs && nowMs < endMs) {
    return STATUS.ONGOING;
  } else {
    return STATUS.COMPLETED;
  }
}

/**
 * Calculates live timing status for an Event (supporting multiple Sessions).
 *
 * Multi-session rules:
 * - If ANY session is ONGOING => Event is ONGOING
 * - If NO session is ONGOING, but at least ONE session is UPCOMING => Event is UPCOMING
 * - If ALL sessions are COMPLETED => Event is COMPLETED
 * - If Event has no sessions, status is derived from start_date / end_date.
 *
 * @param {Object} event
 * @param {Date|number} [now=new Date()]
 * @returns {"UPCOMING"|"ONGOING"|"COMPLETED"}
 */
export function getEventStatus(event, now = new Date()) {
  if (!event) return STATUS.UPCOMING;

  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();

  // If event contains sessions, derive status from child sessions
  const sessions = Array.isArray(event.sessions) ? event.sessions : [];
  if (sessions.length > 0) {
    let hasOngoing = false;
    let hasUpcoming = false;
    let allCompleted = true;

    for (const session of sessions) {
      const sStatus = getSessionStatus(session, nowMs);
      if (sStatus === STATUS.ONGOING) {
        hasOngoing = true;
      }
      if (sStatus === STATUS.UPCOMING) {
        hasUpcoming = true;
      }
      if (sStatus !== STATUS.COMPLETED) {
        allCompleted = false;
      }
    }

    if (hasOngoing) return STATUS.ONGOING;
    if (hasUpcoming) return STATUS.UPCOMING;
    if (allCompleted) return STATUS.COMPLETED;
    return STATUS.UPCOMING;
  }

  // Fallback to event-level dates
  const startDateStr = event.start_date || event.startDate || event.date;
  if (!startDateStr) return STATUS.UPCOMING;

  const endDateStr = event.end_date || event.endDate || startDateStr;
  const startTimeStr = event.start_time || event.startTime;
  const endTimeStr = event.end_time || event.endTime;

  const startDT = parseDateTime(startDateStr, startTimeStr, false);
  const endDT = parseDateTime(endDateStr, endTimeStr, true);

  if (!startDT) return STATUS.UPCOMING;

  const startMs = startDT.getTime();
  const endMs = endDT ? endDT.getTime() : startMs + 24 * 60 * 60 * 1000 - 1;

  if (nowMs < startMs) {
    return STATUS.UPCOMING;
  } else if (nowMs >= startMs && nowMs < endMs) {
    return STATUS.ONGOING;
  } else {
    return STATUS.COMPLETED;
  }
}

/**
 * Calculates live timing status for a month in the Monthly Matrix view.
 *
 * @param {Array} eventsInMonth - List of events in that month
 * @param {Date|number} [now=new Date()]
 * @returns {"EMPTY"|"UPCOMING"|"ONGOING"|"COMPLETED"}
 */
export function getMonthStatus(eventsInMonth, now = new Date()) {
  if (!eventsInMonth || eventsInMonth.length === 0) {
    return "EMPTY";
  }

  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  let hasOngoing = false;
  let hasUpcoming = false;
  let allCompleted = true;

  for (const event of eventsInMonth) {
    const eStatus = getEventStatus(event, nowMs);
    if (eStatus === STATUS.ONGOING) {
      hasOngoing = true;
    }
    if (eStatus === STATUS.UPCOMING) {
      hasUpcoming = true;
    }
    if (eStatus !== STATUS.COMPLETED) {
      allCompleted = false;
    }
  }

  if (hasOngoing) return STATUS.ONGOING;
  if (hasUpcoming) return STATUS.UPCOMING;
  if (allCompleted) return STATUS.COMPLETED;
  return STATUS.UPCOMING;
}

/**
 * Discovers the earliest upcoming transition boundary (start or end timestamp in future)
 * across an array of events and sessions.
 *
 * @param {Array} items - List of events or sessions
 * @param {Date|number} [now=new Date()]
 * @returns {number|null} - Timestamp of next transition in ms, or null if none
 */
export function getNextTransitionBoundary(items = [], now = new Date()) {
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  let earliestFuture = null;

  function registerBoundary(dt) {
    if (!dt) return;
    const ms = dt.getTime();
    if (ms > nowMs) {
      if (earliestFuture === null || ms < earliestFuture) {
        earliestFuture = ms;
      }
    }
  }

  items.forEach((item) => {
    if (!item) return;

    // Check sessions if present
    if (Array.isArray(item.sessions) && item.sessions.length > 0) {
      item.sessions.forEach((s) => {
        const dStr = s.session_date || s.date || s.start_date;
        registerBoundary(parseDateTime(dStr, s.start_time, false));
        registerBoundary(parseDateTime(dStr, s.end_time || s.start_time, true));
      });
    }

    // Check item dates
    const dStr = item.session_date || item.date || item.start_date || item.startDate;
    const endDStr = item.end_date || item.endDate || dStr;
    registerBoundary(parseDateTime(dStr, item.start_time, false));
    registerBoundary(parseDateTime(endDStr, item.end_time, true));
  });

  return earliestFuture;
}
