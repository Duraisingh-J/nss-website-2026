import { supabase } from "../lib/supabase.js";
import { getMediaPublicUrl } from "./mediaService.js";
import { formatDateDisplay } from "./eventService.js";

/**
 * Normalizes event/session category to clean editorial label
 */
function normalizeCategory(type) {
  if (!type) return "Field Initiative";
  const lower = type.toLowerCase();
  if (lower === "camp") return "Special Camp";
  if (lower === "outreach" || lower === "drive") return "Outreach Drive";
  if (lower === "orphanage" || lower === "visit") return "Community Visit";
  if (lower === "monthly" || lower === "event") return "Campus Session";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Fetches all authentic photographs recorded in Supabase,
 * classifying them by group (events, sessions, team, posters, achievements)
 * and associating them with specific event IDs for granular filtering.
 *
 * @returns {Promise<Array<{
 *   id: string,
 *   url: string,
 *   title: string,
 *   caption?: string,
 *   date?: string,
 *   category: string,
 *   group: "events" | "sessions" | "team" | "posters" | "achievements",
 *   eventId?: string,
 *   eventTitle?: string,
 *   sessionId?: string,
 *   sessionTitle?: string,
 * }>>}
 */
export async function getGalleryImages() {
  try {
    // 1. Fetch base media records ordered by creation date
    const { data: mediaRows, error: mediaError } = await supabase
      .from("media")
      .select("id, file_name, storage_path, alt_text, caption, created_at, mime_type")
      .order("created_at", { ascending: false });

    if (mediaError) {
      console.error("Error fetching media table:", mediaError.message);
      throw mediaError;
    }

    if (!mediaRows || mediaRows.length === 0) {
      return [];
    }

    // 2. Fetch associations across events, sessions, and people
    const [eventMediaRes, sessionMediaRes, peopleRes] = await Promise.allSettled([
      supabase
        .from("event_media")
        .select(`
          media_id,
          event_id,
          events (
            id,
            title,
            start_date,
            event_type
          )
        `),
      supabase
        .from("session_media")
        .select(`
          media_id,
          session_id,
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
          )
        `),
      supabase
        .from("people")
        .select(`
          photo_media_id,
          name,
          designation,
          roles (
            name
          )
        `),
    ]);

    // Build lookup maps
    const eventMap = new Map();
    if (eventMediaRes.status === "fulfilled" && Array.isArray(eventMediaRes.value.data)) {
      eventMediaRes.value.data.forEach((row) => {
        if (row.media_id && row.events) {
          eventMap.set(row.media_id, {
            eventId: row.event_id || row.events.id,
            ...row.events,
          });
        }
      });
    }

    const sessionMap = new Map();
    if (sessionMediaRes.status === "fulfilled" && Array.isArray(sessionMediaRes.value.data)) {
      sessionMediaRes.value.data.forEach((row) => {
        if (row.media_id && row.sessions) {
          sessionMap.set(row.media_id, {
            sessionId: row.session_id || row.sessions.id,
            sessionTitle: row.sessions.title,
            sessionDate: row.sessions.session_date,
            eventId: row.sessions.event_id || row.sessions.events?.id || null,
            eventTitle: row.sessions.events?.title || null,
            eventType: row.sessions.events?.event_type || null,
          });
        }
      });
    }

    const peopleMap = new Map();
    if (peopleRes.status === "fulfilled" && Array.isArray(peopleRes.value.data)) {
      peopleRes.value.data.forEach((p) => {
        if (p.photo_media_id) {
          peopleMap.set(p.photo_media_id, p);
        }
      });
    }

    // 3. Map & classify into presentation items
    const galleryItems = [];
    const seenUrls = new Set();

    mediaRows.forEach((row) => {
      if (!row.storage_path) return;

      const publicUrl = getMediaPublicUrl(row.storage_path);
      if (!publicUrl || seenUrls.has(publicUrl)) return;
      seenUrls.add(publicUrl);

      const associatedEvent = eventMap.get(row.id);
      const associatedSession = sessionMap.get(row.id);
      const associatedPerson = peopleMap.get(row.id);

      const pathPrefix = (row.storage_path.split("/")[0] || "").toLowerCase();

      // Determine classification group
      let group = "events";
      let category = "Field Initiative";
      let title = row.caption || row.alt_text || null;
      let date = null;
      let eventId = null;
      let eventTitle = null;

      if (associatedPerson || pathPrefix === "people") {
        group = "team";
        category = "Team & Volunteers";
        title = associatedPerson
          ? `${associatedPerson.name} · ${associatedPerson.roles?.name || associatedPerson.designation || "Volunteer"}`
          : row.caption || "NSS Team Member";
        date = formatDateDisplay(row.created_at);
      } else if (pathPrefix === "heroes" || pathPrefix === "hero" || pathPrefix === "banners") {
        group = "posters";
        category = "Posters & Banners";
        title = row.caption || row.alt_text || "NSS Event Poster";
        date = formatDateDisplay(row.created_at);
      } else if (pathPrefix === "achievements") {
        group = "achievements";
        category = "Achievements";
        title = row.caption || row.alt_text || "NSS MIT Recognition";
        date = formatDateDisplay(row.created_at);
      } else if (associatedSession || pathPrefix === "sessions") {
        group = "sessions";
        category = normalizeCategory(associatedSession?.eventType || "Campus Session");
        title = associatedSession?.sessionTitle || row.caption || "Campus Session";
        date = associatedSession?.sessionDate
          ? formatDateDisplay(associatedSession.sessionDate)
          : formatDateDisplay(row.created_at);
        eventId = associatedSession?.eventId || null;
        eventTitle = associatedSession?.eventTitle || null;
      } else {
        group = "events";
        if (associatedEvent) {
          category = normalizeCategory(associatedEvent.event_type);
          title = associatedEvent.title || row.caption || "Field Documentation";
          date = formatDateDisplay(associatedEvent.start_date);
          eventId = associatedEvent.eventId || associatedEvent.id;
          eventTitle = associatedEvent.title;
        } else {
          category = "Field Documentation";
          title = row.caption || row.alt_text || "Field Initiative";
          date = formatDateDisplay(row.created_at);
        }
      }

      galleryItems.push({
        id: row.id,
        url: publicUrl,
        title: title || "NSS MIT Initiative",
        caption: row.caption || "",
        date: date || "",
        category,
        group,
        eventId,
        eventTitle,
        storagePath: row.storage_path,
        createdAt: row.created_at,
      });
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
