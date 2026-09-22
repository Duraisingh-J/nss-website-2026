import { supabase } from "../lib/supabase.js";

/**
 * Calculates academic year in standard Anna University / Indian academic format:
 * June of Year N to May of Year N+1 (e.g. June 2026 -> "2026–27", March 2026 -> "2025–26")
 */
export function getAcademicYear(dateStr) {
  if (!dateStr) return "Unknown";
  try {
    const cleanDate = String(dateStr).split("T")[0];
    const parts = cleanDate.split("-");
    if (parts.length < 2) return "Unknown";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (isNaN(year) || isNaN(month)) return "Unknown";

    if (month >= 6) {
      const nextYearShort = String((year + 1) % 100).padStart(2, "0");
      return `${year}–${nextYearShort}`;
    } else {
      const yearShort = String(year % 100).padStart(2, "0");
      return `${year - 1}–${yearShort}`;
    }
  } catch (err) {
    return "Unknown";
  }
}

/**
 * Formats a short month-year string (e.g. "Jun 2026")
 */
export function formatMonthYear(yearMonthKey) {
  if (!yearMonthKey) return "";
  try {
    const [year, month] = yearMonthKey.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch (e) {
    return yearMonthKey;
  }
}

/**
 * Fetches all necessary operational records for reports in parallel
 */
export async function getReportingData() {
  const [eventsRes, sessionsRes, announcementsRes, achievementsRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, description, event_type, start_date, end_date, is_published, created_at")
      .order("start_date", { ascending: false }),

    supabase
      .from("sessions")
      .select(`
        id,
        event_id,
        title,
        session_date,
        start_time,
        end_time,
        location,
        is_published,
        created_at,
        session_units (
          unit
        ),
        event:event_id (
          id,
          title,
          event_type
        )
      `)
      .order("session_date", { ascending: false }),

    supabase
      .from("announcements")
      .select("id, title, status, category, published_at, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("achievements")
      .select("id, title, achievement_date, category, unit, is_published, created_at")
      .order("achievement_date", { ascending: false }),
  ]);

  if (eventsRes.error) {
    console.error("Error fetching events for reports:", eventsRes.error);
    throw eventsRes.error;
  }
  if (sessionsRes.error) {
    console.error("Error fetching sessions for reports:", sessionsRes.error);
    throw sessionsRes.error;
  }

  const events = (eventsRes.data || []).map((ev) => ({
    ...ev,
    academicYear: getAcademicYear(ev.start_date || ev.created_at),
  }));

  const sessions = (sessionsRes.data || []).map((s) => {
    const units = (s.session_units || []).map((u) => u.unit).filter(Boolean);
    return {
      ...s,
      units,
      eventTitle: s.event?.title || "Independent Activity",
      eventType: s.event?.event_type || "monthly",
      academicYear: getAcademicYear(s.session_date || s.created_at),
    };
  });

  const announcements = announcementsRes.data || [];
  const achievements = (achievementsRes.data || []).map((ac) => ({
    ...ac,
    academicYear: getAcademicYear(ac.achievement_date || ac.created_at),
  }));

  return {
    events,
    sessions,
    announcements,
    achievements,
  };
}

/**
 * Filters datasets based on user-selected criteria
 */
export function filterReportingData(rawData, filters = {}) {
  const { academicYear = "all", eventType = "all", unit = "all" } = filters;

  // Filter Events
  const filteredEvents = rawData.events.filter((ev) => {
    if (academicYear !== "all" && ev.academicYear !== academicYear) return false;
    if (eventType !== "all" && ev.event_type !== eventType) return false;
    return true;
  });

  // Filter Sessions
  const filteredSessions = rawData.sessions.filter((s) => {
    if (academicYear !== "all" && s.academicYear !== academicYear) return false;
    if (eventType !== "all" && s.eventType !== eventType) return false;
    if (unit !== "all" && !s.units.includes(Number(unit))) return false;
    return true;
  });

  // Filter Announcements & Achievements (by academic year if selected)
  const filteredAnnouncements = rawData.announcements.filter((a) => {
    if (academicYear === "all") return true;
    const aYear = getAcademicYear(a.published_at || a.created_at);
    return aYear === academicYear;
  });

  const filteredAchievements = rawData.achievements.filter((ac) => {
    if (academicYear !== "all" && ac.academicYear !== academicYear) return false;
    if (unit !== "all" && ac.unit !== Number(unit)) return false;
    return true;
  });

  return {
    events: filteredEvents,
    sessions: filteredSessions,
    announcements: filteredAnnouncements,
    achievements: filteredAchievements,
  };
}

/**
 * Computes Activity Over Time (grouped chronologically by month-year)
 */
export function computeActivityOverTime(filteredData) {
  const monthMap = {};

  // Aggregate sessions by month
  filteredData.sessions.forEach((s) => {
    if (!s.session_date) return;
    const key = s.session_date.substring(0, 7); // "YYYY-MM"
    if (!monthMap[key]) {
      monthMap[key] = { key, monthLabel: formatMonthYear(key), sessionsCount: 0, eventsCount: 0 };
    }
    monthMap[key].sessionsCount += 1;
  });

  // Aggregate events by month
  filteredData.events.forEach((ev) => {
    if (!ev.start_date) return;
    const key = ev.start_date.substring(0, 7);
    if (!monthMap[key]) {
      monthMap[key] = { key, monthLabel: formatMonthYear(key), sessionsCount: 0, eventsCount: 0 };
    }
    monthMap[key].eventsCount += 1;
  });

  const sorted = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
  return sorted.map((item) => ({
    ...item,
    totalActivity: item.sessionsCount + item.eventsCount,
  }));
}

/**
 * Computes Event Type Distribution
 */
export function computeEventTypeDistribution(filteredData) {
  const counts = {
    camp: 0,
    outreach: 0,
    orphanage: 0,
    monthly: 0,
  };

  filteredData.events.forEach((ev) => {
    const t = ev.event_type?.toLowerCase();
    if (t === "camp") counts.camp += 1;
    else if (t === "outreach" || t === "drive") counts.outreach += 1;
    else if (t === "orphanage" || t === "visit") counts.orphanage += 1;
    else counts.monthly += 1;
  });

  const total = Object.values(counts).reduce((acc, v) => acc + v, 0);

  return [
    { type: "camp", label: "Camp Activities", count: counts.camp, percentage: total ? Math.round((counts.camp / total) * 100) : 0, color: "#b91c1c" },
    { type: "outreach", label: "Outreach & Drives", count: counts.outreach, percentage: total ? Math.round((counts.outreach / total) * 100) : 0, color: "#0369a1" },
    { type: "orphanage", label: "Orphanage Visits", count: counts.orphanage, percentage: total ? Math.round((counts.orphanage / total) * 100) : 0, color: "#7e22ce" },
    { type: "monthly", label: "Monthly Assemblies & Observances", count: counts.monthly, percentage: total ? Math.round((counts.monthly / total) * 100) : 0, color: "#047857" },
  ];
}

/**
 * Computes Unit Participation across scheduled sessions (Units 1 - 7)
 */
export function computeUnitSessionActivity(filteredData) {
  const unitCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

  filteredData.sessions.forEach((s) => {
    s.units.forEach((u) => {
      if (unitCounts[u] !== undefined) {
        unitCounts[u] += 1;
      }
    });
  });

  const maxVal = Math.max(...Object.values(unitCounts), 1);

  return [1, 2, 3, 4, 5, 6, 7].map((u) => ({
    unit: u,
    label: `Unit ${u}`,
    sessionCount: unitCounts[u],
    barPercentage: Math.round((unitCounts[u] / maxVal) * 100),
  }));
}

/**
 * Exports current filtered dataset as a structured CSV report
 */
export function exportReportToCSV(filteredData, filters = {}) {
  const lines = [];

  // Header & Metadata
  lines.push(["NSS MIT ADMINISTRATIVE ACTIVITY REPORT"]);
  lines.push([`Generated On`, new Date().toLocaleString("en-IN")]);
  lines.push([`Filter - Academic Year`, filters.academicYear || "All Time"]);
  lines.push([`Filter - Event Type`, filters.eventType || "All Types"]);
  lines.push([`Filter - Unit`, filters.unit === "all" ? "All Units" : `Unit ${filters.unit}`]);
  lines.push([]);

  // Summary Metrics Section
  lines.push(["SUMMARY METRICS"]);
  lines.push(["Total Events", filteredData.events.length]);
  lines.push(["Total Sessions", filteredData.sessions.length]);
  lines.push(["Published Announcements", filteredData.announcements.filter((a) => a.status === "published").length]);
  lines.push(["Archived Achievements", filteredData.achievements.filter((a) => a.is_published).length]);
  lines.push([]);

  // Events Table
  lines.push(["EVENTS LIST"]);
  lines.push(["ID", "Title", "Event Type", "Start Date", "End Date", "Published Status", "Academic Year"]);
  filteredData.events.forEach((ev) => {
    lines.push([
      `"${ev.id}"`,
      `"${(ev.title || "").replace(/"/g, '""')}"`,
      `"${ev.event_type || ""}"`,
      `"${ev.start_date || ""}"`,
      `"${ev.end_date || ""}"`,
      ev.is_published ? "Published" : "Draft",
      `"${ev.academicYear || ""}"`,
    ]);
  });
  lines.push([]);

  // Sessions Table
  lines.push(["SESSIONS LIST"]);
  lines.push(["ID", "Title", "Parent Event", "Date", "Location", "Participating Units", "Academic Year"]);
  filteredData.sessions.forEach((s) => {
    lines.push([
      `"${s.id}"`,
      `"${(s.title || "").replace(/"/g, '""')}"`,
      `"${(s.eventTitle || "").replace(/"/g, '""')}"`,
      `"${s.session_date || ""}"`,
      `"${(s.location || "").replace(/"/g, '""')}"`,
      `"${s.units.join(", ")}"`,
      `"${s.academicYear || ""}"`,
    ]);
  });

  const csvContent = lines.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `NSS_MIT_Activity_Report_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
