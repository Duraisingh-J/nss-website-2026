import { supabase } from "../lib/supabase.js";
import { uploadMedia, getMediaPublicUrl, deleteMedia } from "./mediaService.js";

export { getMediaPublicUrl };

/**
 * Event Types matching database constraints
 */
export const EVENT_TYPES = [
  { value: "event", label: "Event" },
  { value: "workshop", label: "Workshop" },
  { value: "awareness", label: "Awareness" },
  { value: "camp", label: "Camp" },
  { value: "visit", label: "Visit" },
  { value: "drive", label: "Drive" },
  { value: "other", label: "Other" },
];

/**
 * Calculates timing status (Upcoming, Ongoing, Completed) strictly from start_date & end_date
 */
export function getEventTimingStatus(event) {
  if (!event || !event.start_date) return "Upcoming";

  const todayStr = new Date().toISOString().split("T")[0];
  const startDateStr = event.start_date;
  const endDateStr = event.end_date || startDateStr;

  if (todayStr < startDateStr) {
    return "Upcoming";
  } else if (todayStr >= startDateStr && todayStr <= endDateStr) {
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
 * Capitalizes event type label
 */
export function formatEventTypeLabel(type) {
  if (!type) return "Event";
  const found = EVENT_TYPES.find((t) => t.value.toLowerCase() === type.toLowerCase());
  if (found) return found.label;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Transforms raw Supabase row into clean UI data object strictly using real schema
 */
export function transformEvent(row) {
  if (!row) return null;

  const isPublished = Boolean(row.is_published);
  const coverImageUrl = getMediaPublicUrl(row.media?.storage_path);
  const timingStatus = getEventTimingStatus(row);

  return {
    id: row.id,
    title: row.title || "Untitled Event",
    description: row.description || "",
    event_type: row.event_type || "event",
    eventTypeLabel: formatEventTypeLabel(row.event_type),
    start_date: row.start_date || "",
    end_date: row.end_date || row.start_date || "",
    is_published: isPublished,
    cover_media_id: row.cover_media_id || null,
    cover_image_url: coverImageUrl,
    timingStatus: timingStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetch all events from Supabase
 */
export async function getAdminEvents() {
  const { data, error } = await supabase
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
      created_at,
      updated_at,
      media:cover_media_id (
        id,
        storage_path,
        file_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin events:", error.message);
    throw new Error(`Unable to fetch events from database: ${error.message}`);
  }

  return (data || []).map(transformEvent);
}

/**
 * Upload event cover image using existing mediaService
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
 * Create a new Event record in Supabase using ONLY existing columns
 */
export async function createEvent(eventData, coverImageFile = null) {
  let mediaId = eventData.cover_media_id || null;

  if (coverImageFile) {
    const uploadedMedia = await uploadEventImage(coverImageFile, eventData.title);
    mediaId = uploadedMedia.id;
  }

  const payload = {
    title: eventData.title.trim(),
    description: eventData.description ? eventData.description.trim() : null,
    event_type: eventData.event_type || "event",
    start_date: eventData.start_date,
    end_date: eventData.end_date || eventData.start_date,
    is_published: Boolean(eventData.is_published),
    cover_media_id: mediaId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select(`
      id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      is_published,
      cover_media_id,
      created_at,
      updated_at,
      media:cover_media_id (
        id,
        storage_path,
        file_name
      )
    `)
    .single();

  if (error) {
    console.error("Error creating event:", error.message);
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return transformEvent(data);
}

/**
 * Update an existing Event record in Supabase using ONLY existing columns
 */
export async function updateEvent(eventId, eventData, coverImageFile = null) {
  if (!eventId) throw new Error("Event ID is required for update.");

  let mediaId = eventData.cover_media_id || null;

  if (coverImageFile) {
    const uploadedMedia = await uploadEventImage(coverImageFile, eventData.title);
    mediaId = uploadedMedia.id;
  }

  const payload = {
    title: eventData.title.trim(),
    description: eventData.description ? eventData.description.trim() : null,
    event_type: eventData.event_type || "event",
    start_date: eventData.start_date,
    end_date: eventData.end_date || eventData.start_date,
    is_published: Boolean(eventData.is_published),
    cover_media_id: mediaId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId)
    .select(`
      id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      is_published,
      cover_media_id,
      created_at,
      updated_at,
      media:cover_media_id (
        id,
        storage_path,
        file_name
      )
    `)
    .single();

  if (error) {
    console.error("Error updating event:", error.message);
    throw new Error(`Failed to update event: ${error.message}`);
  }

  return transformEvent(data);
}

/**
 * Toggle Event Publish / Unpublish Status
 */
export async function toggleEventPublishStatus(eventId, isPublished) {
  if (!eventId) throw new Error("Event ID required.");

  const payload = {
    is_published: Boolean(isPublished),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId)
    .select(`
      id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      is_published,
      cover_media_id,
      created_at,
      updated_at,
      media:cover_media_id (
        id,
        storage_path,
        file_name
      )
    `)
    .single();

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

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    console.error("Error deleting event:", error.message);
    throw new Error(`Failed to delete event: ${error.message}`);
  }

  if (coverMediaId) {
    try {
      await deleteMedia(coverMediaId);
    } catch (e) {
      console.warn("Cover image cleanup ignored:", e.message);
    }
  }

  return true;
}
