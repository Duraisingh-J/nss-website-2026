import { supabase } from "../lib/supabase.js";

/**
 * Session Types supported by NSS Admin CMS
 */
export const SESSION_TYPES = [
  { value: "lecture", label: "Lecture" },
  { value: "workshop", label: "Workshop" },
  { value: "training", label: "Training" },
  { value: "activity", label: "Activity" },
  { value: "discussion", label: "Discussion" },
  { value: "ceremony", label: "Ceremony" },
  { value: "break", label: "Break" },
  { value: "other", label: "Other" },
];

/**
 * CMS Status Options
 */
export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

/**
 * Calculates readable duration between start and end dates/times
 */
export function calculateDuration(startDateStr, startTimeStr, endDateStr, endTimeStr) {
  if (!startDateStr || !startTimeStr || !endTimeStr) return "—";

  const sDate = startDateStr;
  const eDate = endDateStr || startDateStr;

  const startIso = `${sDate}T${startTimeStr.length === 5 ? startTimeStr + ":00" : startTimeStr}`;
  const endIso = `${eDate}T${endTimeStr.length === 5 ? endTimeStr + ":00" : endTimeStr}`;

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
  if (!session) return "Upcoming";

  const now = new Date();

  const startDateStr = session.session_date || session.start_date;
  if (!startDateStr) return "Upcoming";

  const startTimeStr = session.start_time || "00:00:00";
  const startIso = startDateStr.includes("T")
    ? startDateStr
    : `${startDateStr}T${startTimeStr.length === 5 ? startTimeStr + ":00" : startTimeStr}`;
  const startDateTime = new Date(startIso);

  const endDateStr = session.end_date || startDateStr;
  const endTimeStr = session.end_time || "23:59:59";
  const endIso = endDateStr.includes("T")
    ? endDateStr
    : `${endDateStr}T${endTimeStr.length === 5 ? endTimeStr + ":00" : endTimeStr}`;
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
 * Formats session type label nicely
 */
export function formatSessionTypeLabel(type) {
  if (!type) return "Activity";
  const found = SESSION_TYPES.find((t) => t.value.toLowerCase() === type.toLowerCase());
  if (found) return found.label;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Transforms raw Supabase row into clean UI object
 */
export function transformSession(row) {
  if (!row) return null;

  const isPublished = Boolean(row.is_published || row.status === "published");
  let status = row.status || (isPublished ? "published" : "draft");
  if (row.status === "archived") status = "archived";

  const startDate = row.session_date || (row.start_datetime ? row.start_datetime.split("T")[0] : "");
  const endDate = row.end_date || startDate;
  const startTime = row.start_time || "10:00";
  const endTime = row.end_time || "11:30";

  const timingStatus = getSessionTimingStatus({
    session_date: startDate,
    start_time: startTime,
    end_date: endDate,
    end_time: endTime,
  });

  const durationText = calculateDuration(startDate, startTime, endDate, endTime);

  return {
    id: row.id,
    event_id: row.event_id || null,
    event_title: row.events?.title || "Standalone / Unlinked Session",
    event_start_date: row.events?.start_date || null,
    event_end_date: row.events?.end_date || null,
    title: row.title || "Untitled Session",
    description: row.description || "",
    session_type: row.session_type || "activity",
    sessionTypeLabel: formatSessionTypeLabel(row.session_type || "activity"),
    session_date: startDate,
    start_date: startDate,
    start_time: startTime,
    end_date: endDate,
    end_time: endTime,
    durationText: durationText,
    location: row.location || "NSS Campus",
    session_lead: row.session_lead || "",
    speaker: row.speaker || "",
    registration_url: row.registration_url || "",
    max_participants: row.max_participants || "",
    additional_information: row.additional_information || "",
    status: status,
    is_published: isPublished,
    timingStatus: timingStatus,
    display_order: row.display_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    rawEvent: row.events,
  };
}

/**
 * Fetch all sessions for Admin CMS
 */
export async function getAdminSessions() {
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
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
    throw new Error(`Unable to fetch sessions from Supabase: ${error.message}`);
  }

  return (data || []).map(transformSession);
}

/**
 * Fetch lightweight list of all events for dropdown selection
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
 * Create a new Session in Supabase
 */
export async function createSession(sessionData) {
  const isPublished = sessionData.status === "published";

  const payload = {
    event_id: sessionData.event_id || null,
    title: sessionData.title.trim(),
    description: sessionData.description ? sessionData.description.trim() : null,
    session_date: sessionData.start_date || sessionData.session_date,
    start_time: sessionData.start_time || "10:00:00",
    end_time: sessionData.end_time || "11:30:00",
    location: sessionData.location ? sessionData.location.trim() : "NSS Campus",
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  };

  const extendedPayload = {
    ...payload,
    session_type: sessionData.session_type || "activity",
    status: sessionData.status || (isPublished ? "published" : "draft"),
    session_lead: sessionData.session_lead ? sessionData.session_lead.trim() : null,
    speaker: sessionData.speaker ? sessionData.speaker.trim() : null,
    registration_url: sessionData.registration_url ? sessionData.registration_url.trim() : null,
    max_participants: sessionData.max_participants ? parseInt(sessionData.max_participants, 10) || null : null,
    additional_information: sessionData.additional_information ? sessionData.additional_information.trim() : null,
  };

  let { data, error } = await supabase
    .from("sessions")
    .insert(extendedPayload)
    .select(`
      *,
      events:event_id (
        id,
        title,
        start_date,
        end_date
      )
    `)
    .single();

  if (error && (error.code === "42703" || error.message?.includes("does not exist"))) {
    console.warn("Retrying session insert with standard database columns...", error.message);
    const retryResult = await supabase
      .from("sessions")
      .insert(payload)
      .select(`
        *,
        events:event_id (
          id,
          title,
          start_date,
          end_date
        )
      `)
      .single();

    data = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    console.error("Error creating session:", error.message);
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return transformSession(data);
}

/**
 * Update an existing Session in Supabase
 */
export async function updateSession(sessionId, sessionData) {
  if (!sessionId) throw new Error("Session ID is required for update.");

  const isPublished = sessionData.status === "published";

  const payload = {
    event_id: sessionData.event_id || null,
    title: sessionData.title.trim(),
    description: sessionData.description ? sessionData.description.trim() : null,
    session_date: sessionData.start_date || sessionData.session_date,
    start_time: sessionData.start_time || "10:00:00",
    end_time: sessionData.end_time || "11:30:00",
    location: sessionData.location ? sessionData.location.trim() : "NSS Campus",
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  };

  const extendedPayload = {
    ...payload,
    session_type: sessionData.session_type || "activity",
    status: sessionData.status || (isPublished ? "published" : "draft"),
    session_lead: sessionData.session_lead ? sessionData.session_lead.trim() : null,
    speaker: sessionData.speaker ? sessionData.speaker.trim() : null,
    registration_url: sessionData.registration_url ? sessionData.registration_url.trim() : null,
    max_participants: sessionData.max_participants ? parseInt(sessionData.max_participants, 10) || null : null,
    additional_information: sessionData.additional_information ? sessionData.additional_information.trim() : null,
  };

  let { data, error } = await supabase
    .from("sessions")
    .update(extendedPayload)
    .eq("id", sessionId)
    .select(`
      *,
      events:event_id (
        id,
        title,
        start_date,
        end_date
      )
    `)
    .single();

  if (error && (error.code === "42703" || error.message?.includes("does not exist"))) {
    console.warn("Retrying session update with standard database columns...", error.message);
    const retryResult = await supabase
      .from("sessions")
      .update(payload)
      .eq("id", sessionId)
      .select(`
        *,
        events:event_id (
          id,
          title,
          start_date,
          end_date
        )
      `)
      .single();

    data = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    console.error("Error updating session:", error.message);
    throw new Error(`Failed to update session: ${error.message}`);
  }

  return transformSession(data);
}

/**
 * Toggle Session Publish Status
 */
export async function toggleSessionPublishStatus(sessionId, newStatus) {
  if (!sessionId) throw new Error("Session ID required.");

  const isPublished = newStatus === "published";

  const payload = {
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  };

  const extendedPayload = {
    ...payload,
    status: newStatus,
  };

  let { data, error } = await supabase
    .from("sessions")
    .update(extendedPayload)
    .eq("id", sessionId)
    .select(`
      *,
      events:event_id (
        id,
        title,
        start_date,
        end_date
      )
    `)
    .single();

  if (error && (error.code === "42703" || error.message?.includes("does not exist"))) {
    const retryResult = await supabase
      .from("sessions")
      .update(payload)
      .eq("id", sessionId)
      .select(`
        *,
        events:event_id (
          id,
          title,
          start_date,
          end_date
        )
      `)
      .single();

    data = retryResult.data;
    error = retryResult.error;
  }

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
