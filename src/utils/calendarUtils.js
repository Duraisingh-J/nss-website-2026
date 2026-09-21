/**
 * Calendar and Event Utilities for NSS Sessions & Events
 */

/**
 * Creates a Google Calendar Add Event URL
 */
export function getGoogleCalendarUrl({ title, description, location, date, startTime, endTime }) {
  if (!date) return "#";

  const cleanDate = date.replace(/-/g, "");
  const sTime = (startTime || "10:00").replace(/:/g, "").slice(0, 4) + "00";
  const eTime = (endTime || "11:30").replace(/:/g, "").slice(0, 4) + "00";

  const startUtc = `${cleanDate}T${sTime}`;
  const endUtc = `${cleanDate}T${eTime}`;

  const details = encodeURIComponent(description || `${title} - Organized by National Service Scheme (NSS), MIT Campus.`);
  const loc = encodeURIComponent(location || "Anna University MIT Campus, Chromepet, Chennai");
  const text = encodeURIComponent(title || "NSS Session");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startUtc}/${endUtc}&details=${details}&location=${loc}`;
}

/**
 * Generates and triggers download of an .ics iCalendar file
 */
export function downloadIcsFile({ title, description, location, date, startTime, endTime }) {
  if (!date) return;

  const cleanDate = date.replace(/-/g, "");
  const sTime = (startTime || "10:00").replace(/:/g, "").slice(0, 4) + "00";
  const eTime = (endTime || "11:30").replace(/:/g, "").slice(0, 4) + "00";

  const dtStart = `${cleanDate}T${sTime}`;
  const dtEnd = `${cleanDate}T${eTime}`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NSS MIT Campus//NSS Website Sessions//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:nss-session-${Date.now()}@nssmit.org`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title || "NSS Session"}`,
    `DESCRIPTION:${(description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${location || "NSS MIT Campus"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${(title || "nss-session").toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Returns human-readable relative time distance
 */
export function getRelativeTimeLabel(dateStr) {
  if (!dateStr) return null;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (dateStr === todayStr) {
    return { label: "TODAY", isToday: true, isUpcoming: true, daysAway: 0 };
  }

  const target = new Date(dateStr);
  const diffTime = target.getTime() - new Date(todayStr).getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { label: "TOMORROW", isToday: false, isUpcoming: true, daysAway: 1 };
  } else if (diffDays > 1 && diffDays <= 30) {
    return { label: `IN ${diffDays} DAYS`, isToday: false, isUpcoming: true, daysAway: diffDays };
  } else if (diffDays < 0) {
    return { label: "COMPLETED", isToday: false, isUpcoming: false, daysAway: diffDays };
  }

  return { label: "UPCOMING", isToday: false, isUpcoming: true, daysAway: diffDays };
}
