import { supabase } from "../lib/supabase.js";
import { uploadMedia, getMediaPublicUrl, deleteMedia } from "./mediaService.js";
import { getEventStatus } from "../utils/timeStatusUtils.js";

export { getMediaPublicUrl };

/**
 * Core Event Categories for NSS Admin CMS & Website
 */
export const EVENT_CATEGORIES = [
  { value: "camp", label: "Camp" },
  { value: "outreach", label: "Outreach" },
  { value: "orphanage", label: "Orphanage Visit" },
  { value: "monthly", label: "Monthly Event" },
];

/**
 * Normalizes event type to UI Category label
 */
export function formatEventCategoryLabel(type) {
  if (!type) return "Monthly Event";
  const lower = type.toLowerCase();
  if (lower === "camp") return "Camp";
  if (lower === "outreach" || lower === "drive") return "Outreach";
  if (lower === "orphanage" || lower === "orphanage visit" || lower === "visit") return "Orphanage Visit";
  if (lower === "monthly" || lower === "monthly event" || lower === "event" || lower === "other") return "Monthly Event";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Calculates timing status (UPCOMING, ONGOING, COMPLETED) from sessions or dates
 */
export function getEventTimingStatus(event, now = new Date()) {
  if (!event) return "UPCOMING";
  return getEventStatus(event, now);
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
 * Transforms raw Supabase row into clean UI data object strictly using real schema
 */
export function transformEvent(row) {
  if (!row) return null;

  const isPublished = Boolean(row.is_published);
  const coverImageUrl = getMediaPublicUrl(row.media?.storage_path);
  const categoryLabel = formatEventCategoryLabel(row.event_type);

  const sessions = Array.isArray(row.sessions)
    ? row.sessions
        .filter((s) => s.is_published !== false)
        .map((s) => ({
          id: s.id,
          event_id: s.event_id,
          title: s.title,
          session_date: s.session_date,
          date: s.session_date,
          start_time: s.start_time,
          end_time: s.end_time,
          location: s.location || "NSS Campus",
        }))
    : [];

  const rawEvent = {
    ...row,
    sessions,
  };
  const timingStatus = getEventTimingStatus(rawEvent);

  return {
    id: row.id,
    title: row.title || "Untitled Event",
    description: row.description || "",
    shortDesc: row.description || "",
    event_type: row.event_type || "camp",
    categoryLabel: categoryLabel,
    start_date: row.start_date || "",
    end_date: row.end_date || row.start_date || "",
    is_published: isPublished,
    cover_media_id: row.cover_media_id || null,
    cover_image_url: coverImageUrl,
    coverImage: coverImageUrl,
    timingStatus: timingStatus,
    status: timingStatus,
    sessions: sessions,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetch all events from Supabase for Admin CMS
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
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching admin events:", error.message);
    throw new Error(`Unable to fetch events from database: ${error.message}`);
  }

  return (data || []).map(transformEvent);
}

/**
 * Fetch published events for public website with published sessions
 */
export async function getPublicEvents() {
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
      ),
      sessions (
        id,
        event_id,
        title,
        session_date,
        start_time,
        end_time,
        location,
        is_published
      )
    `)
    .eq("is_published", true)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching public events:", error.message);
    return [];
  }

  return (data || []).map(transformEvent);
}

/**
 * Fetch a single published event with all its media and sessions for public website
 */
export async function getPublicEventDetail(eventId) {
  if (!eventId) return null;

  try {
    const { data: eventRow, error } = await supabase
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
      .eq("id", eventId)
      .eq("is_published", true)
      .single();

    if (error || !eventRow) return null;

    const [eventMediaList, sessionsList] = await Promise.all([
      getEventMedia(eventId),
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
          display_order,
          created_at,
          updated_at,
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
        .eq("event_id", eventId)
        .eq("is_published", true)
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true }),
    ]);

    const transformedEvent = transformEvent(eventRow);
    const gallery = (eventMediaList || []).map((m) => ({
      id: m.id,
      mediaId: m.media_id,
      url: m.publicUrl,
      caption: m.caption || m.altText || transformedEvent.title,
      alt: m.altText || transformedEvent.title,
    }));

    const sessions = (sessionsList.data || []).map((sRow) => {
      const sPhotos = Array.isArray(sRow.session_media)
        ? sRow.session_media
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map((sm) => ({
              id: sm.id,
              mediaId: sm.media_id,
              url: getMediaPublicUrl(sm.media?.storage_path),
              caption: sm.media?.caption || sm.media?.alt_text || sRow.title,
              altText: sm.media?.alt_text || sRow.title,
            }))
        : [];
      const sUnits = Array.isArray(sRow.session_units)
        ? sRow.session_units.map((u) => u.unit).sort((a, b) => a - b)
        : [];

      return {
        id: sRow.id,
        title: sRow.title,
        description: sRow.description || "",
        shortDesc: sRow.description || "",
        session_date: sRow.session_date,
        date: sRow.session_date,
        dateDisplay: formatDateDisplay(sRow.session_date),
        start_time: sRow.start_time,
        end_time: sRow.end_time,
        timeDisplay: `${sRow.start_time || "10:00"} — ${sRow.end_time || "11:30"}`,
        location: sRow.location || "NSS Campus",
        units: sUnits,
        unitsDisplay: sUnits.length > 0 ? `Units ${sUnits.join(" · ")}` : "All Units",
        coverImage: sPhotos.length > 0 ? sPhotos[0].url : transformedEvent.cover_image_url,
        coverImageUrl: sPhotos.length > 0 ? sPhotos[0].url : transformedEvent.cover_image_url,
        gallery: sPhotos,
        photos: sPhotos,
      };
    });

    return {
      ...transformedEvent,
      coverImage: transformedEvent.cover_image_url,
      dateDisplay:
        formatDateDisplay(transformedEvent.start_date) +
        (transformedEvent.end_date && transformedEvent.end_date !== transformedEvent.start_date
          ? ` — ${formatDateDisplay(transformedEvent.end_date)}`
          : ""),
      volunteersCount: "All Units",
      location: sessions.length > 0 ? sessions[0].location : "NSS MIT Campus",
      shortDesc: transformedEvent.description,
      about: transformedEvent.description ? [transformedEvent.description] : [],
      gallery: gallery,
      photos: gallery,
      sessions: sessions,
    };
  } catch (err) {
    console.error("Error in getPublicEventDetail:", err);
    return null;
  }
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
 * Create a new Event record in Supabase
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
    event_type: eventData.event_type || "camp",
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
 * Update an existing Event record in Supabase
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
    event_type: eventData.event_type || "camp",
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

/**
 * Fetch all photographs associated with an event via event_media
 */
export async function getEventMedia(eventId) {
  if (!eventId) return [];

  const { data, error } = await supabase
    .from("event_media")
    .select(`
      id,
      event_id,
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
    .eq("event_id", eventId)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching event media:", error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id, // event_media link ID
    event_id: row.event_id,
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
 * Upload and associate a photograph with an event (stores in public-media/events/)
 */
export async function addEventMedia(eventId, file, options = {}) {
  if (!eventId || !file) {
    throw new Error("Event ID and File are required for uploading event media.");
  }

  // 1. Upload media using common image optimization pipeline
  const uploadedMedia = await uploadMedia(file, {
    folder: "events",
    entityId: eventId,
    altText: options.altText || file.name || "Event photograph",
    caption: options.caption || null,
    quality: 0.85,
    maxDimension: 2400,
  });

  // 2. Fetch current max display_order for this event
  const { data: currentMedia } = await supabase
    .from("event_media")
    .select("display_order")
    .eq("event_id", eventId)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = currentMedia && currentMedia.length > 0 ? (currentMedia[0].display_order || 0) + 1 : 1;

  // 3. Create event_media association
  const { data: linkRow, error: linkError } = await supabase
    .from("event_media")
    .insert({
      event_id: eventId,
      media_id: uploadedMedia.id,
      display_order: nextOrder,
    })
    .select(`
      id,
      event_id,
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
    console.error("Error linking event_media:", linkError.message);
    throw new Error(`Failed to associate media with event: ${linkError.message}`);
  }

  return {
    id: linkRow.id,
    event_id: linkRow.event_id,
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
 * Remove an event photograph association (deletes event_media row only, preserving underlying media)
 */
export async function removeEventMedia(eventMediaId) {
  if (!eventMediaId) throw new Error("Event Media ID is required.");

  const { error } = await supabase
    .from("event_media")
    .delete()
    .eq("id", eventMediaId);

  if (error) {
    console.error("Error deleting event media association:", error.message);
    throw new Error(`Failed to remove event photo: ${error.message}`);
  }

  return true;
}

