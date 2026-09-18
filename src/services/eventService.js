import { supabase } from "../lib/supabase.js";
import { uploadMedia, getMediaPublicUrl, deleteMedia } from "./mediaService.js";

export { getMediaPublicUrl };

/**
 * Event Types supported by NSS Admin CMS
 */
export const EVENT_TYPES = [
  { value: "event", label: "Event" },
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "meeting", label: "Meeting" },
  { value: "competition", label: "Competition" },
  { value: "awareness", label: "Awareness" },
  { value: "camp", label: "Camp" },
  { value: "visit", label: "Visit" },
  { value: "drive", label: "Drive" },
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
 * Calculates timing status (Upcoming, Ongoing, Completed) from event start & end datetimes
 */
export function getEventTimingStatus(event) {
  if (!event) return "Upcoming";

  const now = new Date();

  const startDateStr = event.start_date || event.start_datetime;
  if (!startDateStr) return "Upcoming";

  const startTimeStr = event.start_time || "00:00:00";
  // Format as ISO timestamp if possible
  const startIso = startDateStr.includes("T")
    ? startDateStr
    : `${startDateStr}T${startTimeStr.length === 5 ? startTimeStr + ":00" : startTimeStr}`;
  const startDateTime = new Date(startIso);

  const endDateStr = event.end_date || event.end_datetime || startDateStr;
  const endTimeStr = event.end_time || "23:59:59";
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
 * Formats date display (e.g., "24 Sep 2026")
 */
export function formatDateDisplay(dateStr) {
  if (!dateStr) return "—";
  const cleanDate = dateStr.split("T")[0];
  const parts = cleanDate.split("-");
  if (parts.length < 3) return dateStr;

  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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
  hours = hours ? hours : 12; // hour 0 should be 12

  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Capitalizes string nicely
 */
export function formatEventTypeLabel(type) {
  if (!type) return "Event";
  const found = EVENT_TYPES.find((t) => t.value.toLowerCase() === type.toLowerCase());
  if (found) return found.label;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Transforms raw Supabase row into clean UI data object
 */
export function transformEvent(row) {
  if (!row) return null;

  const isPublished = Boolean(row.is_published || row.status === "published");
  let status = row.status || (isPublished ? "published" : "draft");
  if (row.status === "archived") status = "archived";

  const coverImageUrl = getMediaPublicUrl(row.media?.storage_path);

  const timingStatus = getEventTimingStatus(row);

  return {
    id: row.id,
    title: row.title || "Untitled Event",
    description: row.description || "",
    event_type: row.event_type || "event",
    eventTypeLabel: formatEventTypeLabel(row.event_type),
    start_date: row.start_date || (row.start_datetime ? row.start_datetime.split("T")[0] : ""),
    start_time: row.start_time || "10:00",
    end_date: row.end_date || (row.end_datetime ? row.end_datetime.split("T")[0] : ""),
    end_time: row.end_time || "13:00",
    location: row.location || "NSS Campus",
    status: status,
    is_published: isPublished,
    cover_media_id: row.cover_media_id,
    cover_image_url: coverImageUrl,
    organizer: row.organizer || "NSS Unit",
    registration_url: row.registration_url || "",
    contact_email: row.contact_email || "",
    contact_phone: row.contact_phone || "",
    max_participants: row.max_participants || "",
    additional_information: row.additional_information || "",
    timingStatus: timingStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
    rawMedia: row.media,
  };
}

/**
 * Fetch all events for Admin CMS
 */
export async function getAdminEvents() {
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      media:cover_media_id (
        id,
        storage_path,
        file_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin events:", error.message);
    throw new Error(`Unable to fetch events from Supabase: ${error.message}`);
  }

  return (data || []).map(transformEvent);
}

/**
 * Upload event cover image using mediaService pipeline
 */
export async function uploadEventImage(file, eventTitle) {
  if (!file) return null;
  return await uploadMedia(file, {
    folder: "events",
    altText: eventTitle ? `Cover image for ${eventTitle}` : "Event cover image",
    quality: 0.85,
    maxDimension: 2400,
  });
}

/**
 * Create a new Event record in Supabase
 */
export async function createEvent(eventData, coverImageFile = null) {
  let mediaId = eventData.cover_media_id || null;

  // 1. Handle image upload if a file was provided
  if (coverImageFile) {
    const uploadedMedia = await uploadEventImage(coverImageFile, eventData.title);
    mediaId = uploadedMedia.id;
  }

  const isPublished = eventData.status === "published";

  // Build payload containing primary fields matching schema and extra columns
  const payload = {
    title: eventData.title.trim(),
    description: eventData.description.trim(),
    event_type: eventData.event_type || "event",
    start_date: eventData.start_date,
    end_date: eventData.end_date,
    is_published: isPublished,
    cover_media_id: mediaId,
    updated_at: new Date().toISOString(),
  };

  // Attempt to insert with all extended fields
  const extendedPayload = {
    ...payload,
    start_time: eventData.start_time || "10:00",
    end_time: eventData.end_time || "13:00",
    location: eventData.location ? eventData.location.trim() : "NSS Campus",
    status: eventData.status || (isPublished ? "published" : "draft"),
    organizer: eventData.organizer ? eventData.organizer.trim() : null,
    registration_url: eventData.registration_url ? eventData.registration_url.trim() : null,
    contact_email: eventData.contact_email ? eventData.contact_email.trim() : null,
    contact_phone: eventData.contact_phone ? eventData.contact_phone.trim() : null,
    max_participants: eventData.max_participants ? parseInt(eventData.max_participants, 10) || null : null,
    additional_information: eventData.additional_information ? eventData.additional_information.trim() : null,
  };

  let { data, error } = await supabase
    .from("events")
    .insert(extendedPayload)
    .select(`
      *,
      media:cover_media_id (
        id,
        storage_path,
        file_name
      )
    `)
    .single();

  // If error is caused by missing extended columns on existing DB table, retry with standard core columns
  if (error && (error.code === "42703" || error.message?.includes("does not exist"))) {
    console.warn("Retrying event insert with standard database columns...", error.message);
    const retryResult = await supabase
      .from("events")
      .insert(payload)
      .select(`
        *,
        media:cover_media_id (
          id,
          storage_path,
          file_name
        )
      `)
      .single();

    data = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    console.error("Error creating event:", error.message);
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return transformEvent(data);
}

/**
 * Update an existing Event record in Supabase
 */
export async function updateEvent(eventId, eventData, coverImageFile = null) {
  if (!eventId) throw new Error("Event ID is required for update.");

  let mediaId = eventData.cover_media_id || null;

  // Upload new photo if supplied
  if (coverImageFile) {
    const uploadedMedia = await uploadEventImage(coverImageFile, eventData.title);
    mediaId = uploadedMedia.id;
  }

  const isPublished = eventData.status === "published";

  const payload = {
    title: eventData.title.trim(),
    description: eventData.description.trim(),
    event_type: eventData.event_type || "event",
    start_date: eventData.start_date,
    end_date: eventData.end_date,
    is_published: isPublished,
    cover_media_id: mediaId,
    updated_at: new Date().toISOString(),
  };

  const extendedPayload = {
    ...payload,
    start_time: eventData.start_time || "10:00",
    end_time: eventData.end_time || "13:00",
    location: eventData.location ? eventData.location.trim() : "NSS Campus",
    status: eventData.status || (isPublished ? "published" : "draft"),
    organizer: eventData.organizer ? eventData.organizer.trim() : null,
    registration_url: eventData.registration_url ? eventData.registration_url.trim() : null,
    contact_email: eventData.contact_email ? eventData.contact_email.trim() : null,
    contact_phone: eventData.contact_phone ? eventData.contact_phone.trim() : null,
    max_participants: eventData.max_participants ? parseInt(eventData.max_participants, 10) || null : null,
    additional_information: eventData.additional_information ? eventData.additional_information.trim() : null,
  };

  let { data, error } = await supabase
    .from("events")
    .update(extendedPayload)
    .eq("id", eventId)
    .select(`
      *,
      media:cover_media_id (
        id,
        storage_path,
        file_name
      )
    `)
    .single();

  if (error && (error.code === "42703" || error.message?.includes("does not exist"))) {
    console.warn("Retrying event update with standard database columns...", error.message);
    const retryResult = await supabase
      .from("events")
      .update(payload)
      .eq("id", eventId)
      .select(`
        *,
        media:cover_media_id (
          id,
          storage_path,
          file_name
        )
      `)
      .single();

    data = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    console.error("Error updating event:", error.message);
    throw new Error(`Failed to update event: ${error.message}`);
  }

  return transformEvent(data);
}

/**
 * Toggle Event Publish / Unpublish Status
 */
export async function toggleEventPublishStatus(eventId, newStatus) {
  if (!eventId) throw new Error("Event ID required.");

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
    .from("events")
    .update(extendedPayload)
    .eq("id", eventId)
    .select(`
      *,
      media:cover_media_id (
        id,
        storage_path,
        file_name
      )
    `)
    .single();

  if (error && (error.code === "42703" || error.message?.includes("does not exist"))) {
    const retryResult = await supabase
      .from("events")
      .update(payload)
      .eq("id", eventId)
      .select(`
        *,
        media:cover_media_id (
          id,
          storage_path,
          file_name
        )
      `)
      .single();

    data = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    console.error("Error toggling publish status:", error.message);
    throw new Error(`Failed to update publish status: ${error.message}`);
  }

  return transformEvent(data);
}

/**
 * Delete an event record from Supabase
 */
export async function deleteEvent(eventId, coverMediaId = null) {
  if (!eventId) throw new Error("Event ID is required.");

  // Delete event row from Supabase
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    console.error("Error deleting event:", error.message);
    throw new Error(`Failed to delete event: ${error.message}`);
  }

  // If event had a cover image media item, clean it up optionally
  if (coverMediaId) {
    try {
      await deleteMedia(coverMediaId);
    } catch (e) {
      console.warn("Cover image cleanup ignored:", e.message);
    }
  }

  return true;
}
