import { supabase } from "../lib/supabase.js";
import { getMediaPublicUrl } from "./mediaService.js";
import { formatDateDisplay } from "./eventService.js";

/**
 * Normalizes event/session category to clean editorial label
 */
/**
 * Normalizes event/session category to clean editorial label
 */
function normalizeCategory(type) {
  if (!type) return "Campus Session";
  const lower = String(type).toLowerCase();
  if (lower === "camp") return "Special Camp";
  if (lower === "outreach" || lower === "drive") return "Outreach Drive";
  if (lower === "orphanage" || lower === "visit") return "Community Visit";
  if (lower === "monthly" || lower === "event") return "Campus Session";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Normalizes event/session type to filter group identifier
 */
function normalizeGroup(type) {
  if (!type) return "monthly";
  const lower = String(type).toLowerCase();
  if (lower === "camp") return "camp";
  if (lower === "outreach" || lower === "drive") return "outreach";
  if (lower === "orphanage" || lower === "visit") return "orphanage";
  return "monthly";
}

/**
 * Fetches verified activity photographs from Supabase:
 * Includes photographs from event_media, session_media, events (covers), and gallery_album_media.
 * Strictly excludes media belonging to people (volunteers, incharge) and achievements.
 *
 * @returns {Promise<Array<{
 *   id: string,
 *   url: string,
 *   title: string,
 *   caption?: string,
 *   date?: string,
 *   rawDate?: string,
 *   category: string,
 *   group: "camp" | "monthly" | "orphanage" | "outreach",
 *   eventId?: string,
 *   eventTitle?: string,
 *   sessionId?: string,
 *   sessionTitle?: string,
 * }>>}
 */
export async function getGalleryImages() {
  try {
    const [eventMediaRes, sessionMediaRes, eventsRes, albumMediaRes] = await Promise.allSettled([
      // 1. Photos associated with events
      supabase
        .from("event_media")
        .select(`
          id,
          event_id,
          media_id,
          display_order,
          events (
            id,
            title,
            start_date,
            event_type
          ),
          media (
            id,
            storage_path,
            caption,
            alt_text,
            created_at
          )
        `)
        .order("display_order", { ascending: true }),

      // 2. Photos associated with individual event sessions
      supabase
        .from("session_media")
        .select(`
          id,
          session_id,
          media_id,
          display_order,
          sessions (
            id,
            title,
            session_date,
            event_id,
            events (
              id,
              title,
              event_type
            )
          ),
          media (
            id,
            storage_path,
            caption,
            alt_text,
            created_at
          )
        `)
        .order("display_order", { ascending: true }),

      // 3. Official event cover photographs
      supabase
        .from("events")
        .select(`
          id,
          title,
          start_date,
          event_type,
          cover_media:cover_media_id (
            id,
            storage_path,
            caption,
            alt_text,
            created_at
          )
        `)
        .not("cover_media_id", "is", null),

      // 4. Photos from dedicated gallery albums (if any)
      supabase
        .from("gallery_album_media")
        .select(`
          id,
          album_id,
          media_id,
          gallery_albums (
            id,
            title,
            event_id
          ),
          media (
            id,
            storage_path,
            caption,
            alt_text,
            created_at
          )
        `),
    ]);

    const seenMediaIds = new Set();
    const seenUrls = new Set();
    const galleryItems = [];

    const addPhoto = ({ media, eventId, eventTitle, eventType, date, title, caption, sessionId, sessionTitle }) => {
      if (!media || !media.storage_path) return;
      if (seenMediaIds.has(media.id)) return;

      const path = (media.storage_path || "").toLowerCase();
      // Strictly exclude any media stored in people/ or achievements/ folders
      if (path.startsWith("people/") || path.startsWith("achievements/")) return;

      const publicUrl = getMediaPublicUrl(media.storage_path);
      if (!publicUrl || seenUrls.has(publicUrl)) return;

      seenMediaIds.add(media.id);
      seenUrls.add(publicUrl);

      const group = normalizeGroup(eventType);
      const category = normalizeCategory(eventType);

      galleryItems.push({
        id: media.id,
        url: publicUrl,
        title: title || caption || media.caption || media.alt_text || eventTitle || "NSS MIT Initiative",
        caption: caption || media.caption || media.alt_text || "",
        date: date ? formatDateDisplay(date) : formatDateDisplay(media.created_at),
        rawDate: date || media.created_at,
        category,
        group,
        eventId: eventId || null,
        eventTitle: eventTitle || null,
        sessionId: sessionId || null,
        sessionTitle: sessionTitle || null,
        storagePath: media.storage_path,
        createdAt: media.created_at,
      });
    };

    // Process event_media
    if (eventMediaRes.status === "fulfilled" && Array.isArray(eventMediaRes.value.data)) {
      eventMediaRes.value.data.forEach((row) => {
        if (row.media) {
          addPhoto({
            media: row.media,
            eventId: row.event_id || row.events?.id,
            eventTitle: row.events?.title,
            eventType: row.events?.event_type,
            date: row.events?.start_date,
            title: row.events?.title,
            caption: row.media.caption || row.media.alt_text,
          });
        }
      });
    }

    // Process session_media
    if (sessionMediaRes.status === "fulfilled" && Array.isArray(sessionMediaRes.value.data)) {
      sessionMediaRes.value.data.forEach((row) => {
        if (row.media) {
          const ev = row.sessions?.events;
          addPhoto({
            media: row.media,
            eventId: ev?.id || row.sessions?.event_id,
            eventTitle: ev?.title || row.sessions?.title,
            eventType: ev?.event_type || "monthly",
            date: row.sessions?.session_date || ev?.start_date,
            title: row.sessions?.title || ev?.title,
            caption: row.media.caption || row.media.alt_text,
            sessionId: row.sessions?.id,
            sessionTitle: row.sessions?.title,
          });
        }
      });
    }

    // Process event covers
    if (eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value.data)) {
      eventsRes.value.data.forEach((ev) => {
        if (ev.cover_media) {
          addPhoto({
            media: ev.cover_media,
            eventId: ev.id,
            eventTitle: ev.title,
            eventType: ev.event_type,
            date: ev.start_date,
            title: ev.title,
            caption: ev.cover_media.caption || ev.cover_media.alt_text,
          });
        }
      });
    }

    // Process gallery_album_media
    if (albumMediaRes.status === "fulfilled" && Array.isArray(albumMediaRes.value.data)) {
      albumMediaRes.value.data.forEach((row) => {
        if (row.media) {
          addPhoto({
            media: row.media,
            eventId: row.gallery_albums?.event_id,
            eventTitle: row.gallery_albums?.title,
            eventType: "monthly",
            date: row.media.created_at,
            title: row.gallery_albums?.title,
            caption: row.media.caption || row.media.alt_text,
          });
        }
      });
    }

    // Chronological order: newest activities first
    galleryItems.sort((a, b) => {
      const dateA = new Date(a.rawDate || a.createdAt).getTime();
      const dateB = new Date(b.rawDate || b.createdAt).getTime();
      return dateB - dateA;
    });

    return galleryItems;
  } catch (err) {
    console.error("Failed to load gallery images from Supabase:", err);
    throw err;
  }
}

/**
 * Extracts a list of unique events that have photographs in the gallery
 * @param {Array} images - gallery images array
 * @returns {Array<{ id: string, title: string, count: number }>}
 */
export function getGalleryEventsList(images = []) {
  const map = new Map();

  images.forEach((img) => {
    if (img.eventId && img.eventTitle) {
      if (!map.has(img.eventId)) {
        map.set(img.eventId, {
          id: img.eventId,
          title: img.eventTitle,
          count: 0,
        });
      }
      map.get(img.eventId).count += 1;
    }
  });

  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Distributes an array of images across EXACTLY TWO rows without any duplicate copying.
 *
 * @param {Array} images - Array of gallery image objects
 * @returns {{ row1: Array, row2: Array }}
 */
export function distributeGalleryRows(images) {
  if (!images || images.length === 0) {
    return { row1: [], row2: [] };
  }

  const row1 = [];
  const row2 = [];

  images.forEach((item, index) => {
    if (index % 2 === 0) {
      row1.push(item);
    } else {
      row2.push(item);
    }
  });

  return { row1, row2 };
}
