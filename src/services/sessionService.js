import { supabase } from "../lib/supabase.js";

/**
 * Formats time string (e.g. "10:00:00" or "10:00" -> "10:00 AM")
 */
export function formatTimeDisplay(timeStr) {
  if (!timeStr) return "";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
    return timeStr;
  }
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Calculates readable duration between start_time and end_time
 */
export function calculateDuration(startDateStr, startTimeStr, endTimeStr) {
  if (!startDateStr || !startTimeStr || !endTimeStr) return "—";

  const startIso = `${startDateStr}T${startTimeStr.length === 5 ? startTimeStr + ":00" : startTimeStr}`;
  const endIso = `${startDateStr}T${endTimeStr.length === 5 ? endTimeStr + ":00" : endTimeStr}`;

  const startDT = new Date(startIso);
  const endDT = new Date(endIso);

  if (isNaN(startDT.getTime()) || isNaN(endDT.getTime())) return "—";

  const diffMs = endDT - startDT;
  if (diffMs <= 0) return "—";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${minutes} min`;
  }
}

/**
 * Calculates timing status (Upcoming, Ongoing, Completed)
 */
export function getSessionTimingStatus(session) {
  if (!session || !session.session_date) return "Upcoming";

  const now = new Date();
  const startDateStr = session.session_date;

  const startTimeStr = session.start_time || "00:00:00";
  const startIso = `${startDateStr}T${startTimeStr.length === 5 ? startTimeStr + ":00" : startTimeStr}`;
  const startDateTime = new Date(startIso);

  const endTimeStr = session.end_time || "23:59:59";
  const endIso = `${startDateStr}T${endTimeStr.length === 5 ? endTimeStr + ":00" : endTimeStr}`;
  const endDateTime = new Date(endIso);

  if (isNaN(startDateTime.getTime())) return "Upcoming";

  if (now < startDateTime) {
    return "Upcoming";
  } else if (now >= startDateTime && now <= endDateTime) {
    return "Ongoing";
  } else {
    return "Completed";
  }
}

/**
 * Transforms raw Supabase row into clean UI object strictly using real database schema
 */
export function transformSession(row) {
  if (!row) return null;

  const isPublished = Boolean(row.is_published);
  const startDate = row.session_date || "";
  const startTime = row.start_time || "10:00";
  const endTime = row.end_time || "11:30";

  const timingStatus = getSessionTimingStatus({
    session_date: startDate,
    start_time: startTime,
    end_time: endTime,
  });

  const durationText = calculateDuration(startDate, startTime, endTime);

  // Extract units from joined session_units array if present
  const units = Array.isArray(row.session_units)
    ? row.session_units.map((u) => u.unit).sort((a, b) => a - b)
    : [];

  return {
    id: row.id,
    event_id: row.event_id || null,
    event_title: row.events?.title || "Standalone Event",
    event_start_date: row.events?.start_date || null,
    event_end_date: row.events?.end_date || null,
    event_type: row.events?.event_type || null,
    title: row.title || "Untitled Session",
    description: row.description || "",
    session_date: startDate,
    start_time: startTime,
    end_time: endTime,
    durationText: durationText,
    location: row.location || "NSS Campus",
    is_published: isPublished,
    timingStatus: timingStatus,
    display_order: row.display_order ?? 0,
    units: units,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetch all sessions belonging to a specific Event
 */
export async function getSessionsForEvent(eventId) {
  if (!eventId) return [];

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      id,
      event_id,
      title,
      description,
      session_date,
      start_time,
      end_time,
      location,
      is_published,
      display_order,
      created_at,
      updated_at,
      session_units (
        unit
      )
    `)
    .eq("event_id", eventId)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching sessions for event:", error.message);
    return [];
  }

  return (data || []).map(transformSession);
}

/**
 * Create or Update an embedded Session inside an Event, including session_units sync
 */
export async function saveEventSession(eventId, sessionData, selectedUnits = []) {
  if (!eventId) throw new Error("Parent Event ID is required for session creation.");

  const isPublished = Boolean(sessionData.is_published);
  const sessionId = sessionData.id || null;

  const payload = {
    event_id: eventId,
    title: sessionData.title.trim(),
    description: sessionData.description ? sessionData.description.trim() : null,
    session_date: sessionData.session_date,
    start_time: sessionData.start_time || "10:00:00",
    end_time: sessionData.end_time || "11:30:00",
    location: sessionData.location ? sessionData.location.trim() : "NSS Campus",
    is_published: isPublished,
    display_order: parseInt(sessionData.display_order, 10) || 0,
    updated_at: new Date().toISOString(),
  };

  let savedSessionRow = null;

  if (sessionId) {
    // Update existing session
    const { data, error } = await supabase
      .from("sessions")
      .update(payload)
      .eq("id", sessionId)
      .select(`*`)
      .single();

    if (error) throw new Error(`Failed to update session: ${error.message}`);
    savedSessionRow = data;
  } else {
    // Insert new session
    const { data, error } = await supabase
      .from("sessions")
      .insert(payload)
      .select(`*`)
      .single();

    if (error) throw new Error(`Failed to create session: ${error.message}`);
    savedSessionRow = data;
  }

  const activeSessionId = savedSessionRow.id;

  // Synchronize session_units table
  // 1. Delete existing unit entries for this session
  await supabase
    .from("session_units")
    .delete()
    .eq("session_id", activeSessionId);

  // 2. Insert new unit entries
  if (Array.isArray(selectedUnits) && selectedUnits.length > 0) {
    const unitRows = selectedUnits.map((u) => ({
      session_id: activeSessionId,
      unit: parseInt(u, 10),
    }));

    const { error: unitsError } = await supabase
      .from("session_units")
      .insert(unitRows);

    if (unitsError) {
      console.warn("Error inserting session_units:", unitsError.message);
    }
  }

  // Refetch complete session record with session_units
  const { data: refetched } = await supabase
    .from("sessions")
    .select(`
      *,
      session_units (unit)
    `)
    .eq("id", activeSessionId)
    .single();

  return transformSession(refetched || savedSessionRow);
}

/**
 * Synchronizes sessions and session_units for a given event from local form state.
 * Deletes removed sessions, updates existing ones, and inserts new ones.
 */
export async function syncEventSessions(eventId, eventType, formSessions = []) {
  if (!eventId) throw new Error("Event ID is required to sync sessions.");

  const isMonthly =
    eventType === "monthly" ||
    eventType === "Monthly Event";

  // If Monthly Event, delete all existing DB sessions for this event
  if (isMonthly) {
    const { error: delError } = await supabase
      .from("sessions")
      .delete()
      .eq("event_id", eventId);
    if (delError) {
      console.error("Error deleting sessions for monthly event:", delError.message);
    }
    return [];
  }

  // Fetch current DB sessions for this event
  const existingDbSessions = await getSessionsForEvent(eventId);
  const formSessionIds = new Set(
    (formSessions || []).filter((s) => s.id).map((s) => s.id)
  );

  // 1. Delete DB sessions that are no longer in formSessions
  const toDelete = existingDbSessions.filter((s) => !formSessionIds.has(s.id));
  for (const sessionToDelete of toDelete) {
    await deleteEventSession(sessionToDelete.id);
  }

  // 2. Insert or Update each form session and sync its units
  const savedSessions = [];
  for (let i = 0; i < (formSessions || []).length; i++) {
    const s = formSessions[i];
    const sessionData = {
      id: s.id || null,
      title: s.title,
      description: s.description || "",
      session_date: s.session_date,
      start_time: s.start_time || "10:00:00",
      end_time: s.end_time || "11:30:00",
      location: s.location || "NSS Campus",
      is_published: s.is_published !== undefined ? s.is_published : true,
      display_order: i + 1,
    };
    const units = Array.isArray(s.units) ? s.units : [1, 2, 3, 4, 5, 6, 7];
    const saved = await saveEventSession(eventId, sessionData, units);
    savedSessions.push(saved);
  }

  return savedSessions;
}

/**
 * Delete a session record from Supabase (cascade deletes session_units automatically)
 */
export async function deleteEventSession(sessionId) {
  if (!sessionId) throw new Error("Session ID is required.");

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    console.error("Error deleting session:", error.message);
    throw new Error(`Failed to delete session: ${error.message}`);
  }

  return true;
}

/**
 * Fetch calendar data for public website:
 * 1. Published Sessions belonging to published events (with attending unit numbers).
 * 2. Published Monthly Events (which represent single scheduled activities).
 */
export async function getPublicCalendarData() {
  const [eventsRes, sessionsRes] = await Promise.all([
    supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        event_type,
        start_date,
        end_date,
        is_published,
        cover_media_id,
        media:cover_media_id (storage_path)
      `)
      .eq("is_published", true),
    supabase
      .from("sessions")
      .select(`
        id,
        event_id,
        title,
        description,
        session_date,
        start_time,
        end_time,
        location,
        is_published,
        events:event_id (
          id,
          title,
          event_type,
          is_published
        ),
        session_units (
          unit
        )
      `)
      .eq("is_published", true),
  ]);

  const publishedEventsMap = new Map();
  (eventsRes.data || []).forEach((ev) => {
    publishedEventsMap.set(ev.id, ev);
  });

  const calendarMap = {};

  // 1. Process Published Sessions
  (sessionsRes.data || []).forEach((row) => {
    // Match parent event from publishedEventsMap
    const parentEvent = row.event_id ? publishedEventsMap.get(row.event_id) : null;
    if (!parentEvent) return;

    const dateKey = row.session_date;
    if (!dateKey) return;

    const transformedSession = transformSession(row);

    if (!calendarMap[dateKey]) {
      calendarMap[dateKey] = [];
    }

    calendarMap[dateKey].push({
      id: `session-${row.id}`,
      type: "session",
      title: row.title,
      parentEventTitle: parentEvent.title,
      eventType: parentEvent.event_type || "camp",
      date: row.session_date,
      startTime: row.start_time || "10:00",
      endTime: row.end_time || "11:30",
      location: row.location || "NSS Campus",
      units: transformedSession.units,
      description: row.description || "",
      rawData: transformedSession,
    });
  });

  // 2. Process Monthly Events (or events of category 'monthly')
  (eventsRes.data || []).forEach((ev) => {
    const isMonthly =
      ev.event_type === "monthly" ||
      ev.event_type === "other" ||
      ev.event_type === "event";

    if (!isMonthly || !ev.start_date) return;

    const dateKey = ev.start_date;
    if (!calendarMap[dateKey]) {
      calendarMap[dateKey] = [];
    }

    // Check if not already added
    const exists = calendarMap[dateKey].some((item) => item.id === `monthly-${ev.id}`);
    if (!exists) {
      calendarMap[dateKey].push({
        id: `monthly-${ev.id}`,
        type: "monthly_event",
        title: ev.title,
        parentEventTitle: null,
        eventType: "monthly",
        date: ev.start_date,
        startTime: "16:30",
        endTime: "18:00",
        location: "OAT",
        units: [1, 2, 3, 4, 5, 6, 7], // All units attend monthly events
        description: ev.description || "",
        rawData: ev,
      });
    }
  });

  return calendarMap;
}
