import { supabase } from "../lib/supabase.js";
import { uploadMedia, getMediaPublicUrl } from "./mediaService.js";
import { getSessionStatus } from "../utils/timeStatusUtils.js";

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
 * Calculates timing status (UPCOMING, ONGOING, COMPLETED)
 */
export function getSessionTimingStatus(session, now = new Date()) {
  if (!session) return "UPCOMING";
  return getSessionStatus(session, now);
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

  // Extract photos from joined session_media array if present
  const photos = Array.isArray(row.session_media)
    ? row.session_media
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map((sm) => ({
          id: sm.id,
          mediaId: sm.media_id,
          url: getMediaPublicUrl(sm.media?.storage_path),
          caption: sm.media?.caption || sm.media?.alt_text || row.title,
          altText: sm.media?.alt_text || row.title,
        }))
    : [];

  const coverImageUrl = photos.length > 0 ? photos[0].url : getMediaPublicUrl(row.events?.media?.storage_path) || null;

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
    photos: photos,
    gallery: photos,
    coverImageUrl: coverImageUrl,
    coverImage: coverImageUrl,
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
      events:event_id (
        id,
        title,
        start_date,
        end_date,
        event_type,
        cover_media_id,
        media:cover_media_id (storage_path)
      ),
      session_units (
        unit
      ),
      session_media (
        id,
        media_id,
        display_order,
        media:media_id (
          id,
          file_name,
          storage_path,
          mime_type,
          file_size,
          width,
          height,
          alt_text,
          caption,
          created_at
        )
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
          is_published,
          cover_media_id,
          media:cover_media_id (storage_path)
        ),
        session_units (
          unit
        ),
        session_media (
          id,
          media_id,
          display_order,
          media:media_id (
            id,
            file_name,
            storage_path,
            alt_text,
            caption
          )
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

    const sessionPhotos = transformedSession.photos || [];
    const parentCoverUrl = getMediaPublicUrl(parentEvent.media?.storage_path);
    const coverImageUrl = sessionPhotos.length > 0 ? sessionPhotos[0].url : parentCoverUrl;

    calendarMap[dateKey].push({
      id: `session-${row.id}`,
      sessionId: row.id,
      eventId: parentEvent.id,
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
      coverImageUrl: coverImageUrl,
      coverImage: coverImageUrl,
      gallery: sessionPhotos,
      photos: sessionPhotos,
      rawData: transformedSession,
    });
  });

  // Monthly Events are represented by their published child sessions.

  return calendarMap;
}

/**
 * Fetch all photographs associated with a session via session_media
 */
export async function getSessionMedia(sessionId) {
  if (!sessionId) return [];

  const { data, error } = await supabase
    .from("session_media")
    .select(`
      id,
      session_id,
      media_id,
      display_order,
      media:media_id (
        id,
        file_name,
        storage_path,
        mime_type,
        file_size,
        width,
        height,
        alt_text,
        caption,
        created_at
      )
    `)
    .eq("session_id", sessionId)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching session media:", error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id, // session_media link ID
    session_id: row.session_id,
    media_id: row.media_id,
    display_order: row.display_order,
    media: row.media,
    publicUrl: getMediaPublicUrl(row.media?.storage_path),
    fileName: row.media?.file_name || "image.webp",
    altText: row.media?.alt_text || "",
    caption: row.media?.caption || "",
    width: row.media?.width,
    height: row.media?.height,
    fileSize: row.media?.file_size,
    mimeType: row.media?.mime_type,
    createdAt: row.media?.created_at,
  }));
}

/**
 * Upload and associate a photograph with a session (stored in public-media/sessions/)
 */
export async function addSessionMedia(sessionId, file, options = {}) {
  if (!sessionId || !file) {
    throw new Error("Session ID and File are required for uploading session media.");
  }

  // 1. Upload media using common image optimization pipeline (to public-media/sessions/)
  const uploadedMedia = await uploadMedia(file, {
    folder: "sessions",
    entityId: sessionId,
    altText: options.altText || file.name || "Session photograph",
    caption: options.caption || null,
    quality: 0.85,
    maxDimension: 2400,
  });

  // 2. Fetch current max display_order for this session
  const { data: currentMedia } = await supabase
    .from("session_media")
    .select("display_order")
    .eq("session_id", sessionId)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = currentMedia && currentMedia.length > 0 ? (currentMedia[0].display_order || 0) + 1 : 1;

  // 3. Create session_media association
  const { data: linkRow, error: linkError } = await supabase
    .from("session_media")
    .insert({
      session_id: sessionId,
      media_id: uploadedMedia.id,
      display_order: nextOrder,
    })
    .select(`
      id,
      session_id,
      media_id,
      display_order,
      media:media_id (
        id,
        file_name,
        storage_path,
        mime_type,
        file_size,
        width,
        height,
        alt_text,
        caption,
        created_at
      )
    `)
    .single();

  if (linkError) {
    console.error("Error linking session_media:", linkError.message);
    throw new Error(`Failed to associate media with session: ${linkError.message}`);
  }

  return {
    id: linkRow.id,
    session_id: linkRow.session_id,
    media_id: linkRow.media_id,
    display_order: linkRow.display_order,
    media: linkRow.media,
    publicUrl: getMediaPublicUrl(linkRow.media?.storage_path),
    fileName: linkRow.media?.file_name,
    altText: linkRow.media?.alt_text,
    caption: linkRow.media?.caption,
    width: linkRow.media?.width,
    height: linkRow.media?.height,
    fileSize: linkRow.media?.file_size,
    mimeType: linkRow.media?.mime_type,
    createdAt: linkRow.media?.created_at,
  };
}

/**
 * Remove a session photograph association (deletes session_media row only, preserving underlying media)
 */
export async function removeSessionMedia(sessionMediaId) {
  if (!sessionMediaId) throw new Error("Session Media ID is required.");

  const { error } = await supabase
    .from("session_media")
    .delete()
    .eq("id", sessionMediaId);

  if (error) {
    console.error("Error deleting session media association:", error.message);
    throw new Error(`Failed to remove session photo: ${error.message}`);
  }

  return true;
}
