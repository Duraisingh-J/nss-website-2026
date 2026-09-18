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

  return {
    id: row.id,
    event_id: row.event_id || null,
    event_title: row.events?.title || "Standalone / Unlinked Session",
    event_start_date: row.events?.start_date || null,
    event_end_date: row.events?.end_date || null,
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
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetch all sessions from Supabase with relational events join
 */
export async function getAdminSessions() {
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
      events:event_id (
        id,
        title,
        start_date,
        end_date
      )
    `)
    .order("session_date", { ascending: false });

  if (error) {
    console.error("Error fetching admin sessions:", error.message);
    throw new Error(`Unable to fetch sessions from database: ${error.message}`);
  }

  return (data || []).map(transformSession);
}

/**
 * Fetch list of events for parent event selection dropdown
 */
export async function getEventsList() {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, start_date, end_date, is_published")
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching events list for sessions:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Create a new Session in Supabase using ONLY existing columns
 */
export async function createSession(sessionData) {
  const payload = {
    event_id: sessionData.event_id || null,
    title: sessionData.title.trim(),
    description: sessionData.description ? sessionData.description.trim() : null,
    session_date: sessionData.session_date,
    start_time: sessionData.start_time || "10:00:00",
    end_time: sessionData.end_time || "11:30:00",
    location: sessionData.location ? sessionData.location.trim() : "NSS Campus",
    is_published: Boolean(sessionData.is_published),
    display_order: parseInt(sessionData.display_order, 10) || 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("sessions")
    .insert(payload)
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
      events:event_id (
        id,
        title,
        start_date,
        end_date
      )
    `)
    .single();

  if (error) {
    console.error("Error creating session:", error.message);
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return transformSession(data);
}

/**
 * Update an existing Session in Supabase using ONLY existing columns
 */
export async function updateSession(sessionId, sessionData) {
  if (!sessionId) throw new Error("Session ID is required for update.");

  const payload = {
    event_id: sessionData.event_id || null,
    title: sessionData.title.trim(),
    description: sessionData.description ? sessionData.description.trim() : null,
    session_date: sessionData.session_date,
    start_time: sessionData.start_time || "10:00:00",
    end_time: sessionData.end_time || "11:30:00",
    location: sessionData.location ? sessionData.location.trim() : "NSS Campus",
    is_published: Boolean(sessionData.is_published),
    display_order: parseInt(sessionData.display_order, 10) || 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("sessions")
    .update(payload)
    .eq("id", sessionId)
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
      events:event_id (
        id,
        title,
        start_date,
        end_date
      )
    `)
    .single();

  if (error) {
    console.error("Error updating session:", error.message);
    throw new Error(`Failed to update session: ${error.message}`);
  }

  return transformSession(data);
}

/**
 * Toggle Session Publish Status
 */
export async function toggleSessionPublishStatus(sessionId, isPublished) {
  if (!sessionId) throw new Error("Session ID required.");

  const payload = {
    is_published: Boolean(isPublished),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("sessions")
    .update(payload)
    .eq("id", sessionId)
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
      events:event_id (
        id,
        title,
        start_date,
        end_date
      )
    `)
    .single();

  if (error) {
    console.error("Error toggling session publish status:", error.message);
    throw new Error(`Failed to update publish status: ${error.message}`);
  }

  return transformSession(data);
}

/**
 * Delete a session record from Supabase
 */
export async function deleteSession(sessionId) {
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
