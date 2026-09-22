import { supabase } from "../lib/supabase.js";

/**
 * Valid categories according to PostgreSQL CHECK constraint:
 * category IN ('general', 'event', 'registration', 'opportunity', 'notice', 'achievement', 'other')
 */
export const ANNOUNCEMENT_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "event", label: "Event" },
  { value: "registration", label: "Registration" },
  { value: "opportunity", label: "Opportunity" },
  { value: "notice", label: "Notice" },
  { value: "achievement", label: "Achievement" },
  { value: "other", label: "Other" },
];

/**
 * Valid statuses according to PostgreSQL CHECK constraint:
 * status IN ('draft', 'published', 'archived')
 */
export const ANNOUNCEMENT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

/**
 * Priority levels supported
 */
export const PRIORITY_OPTIONS = [
  { value: 0, label: "Normal (0)", badge: "Normal" },
  { value: 1, label: "High (1)", badge: "High Priority" },
  { value: 2, label: "Urgent (2)", badge: "Urgent" },
];

/**
 * Category label helper
 */
export function formatCategoryLabel(cat) {
  if (!cat) return "General";
  const found = ANNOUNCEMENT_CATEGORIES.find((c) => c.value === cat.toLowerCase());
  return found ? found.label : cat.charAt(0).toUpperCase() + cat.slice(1);
}

/**
 * Institutional date/time formatting helper
 */
export function formatDateTimeDisplay(dateStr) {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    return dateStr;
  }
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (err) {
    return dateStr;
  }
}

/**
 * Fetch all announcements for admin management
 * Ordered by priority descending, then created_at descending
 */
export async function getAdminAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      content,
      category,
      priority,
      status,
      published_at,
      expires_at,
      event_id,
      created_at,
      updated_at,
      event:event_id (
        id,
        title
      )
    `)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }

  return (data || []).map((row) => ({
    ...row,
    eventTitle: row.event?.title || null,
  }));
}

/**
 * Fetch published events for optional event_id picker
 */
export async function getEventsForSelection() {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, start_date")
    .order("start_date", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("Could not load events list for announcement linking:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(payload) {
  const record = {
    title: payload.title.trim(),
    content: payload.content.trim(),
    category: payload.category || "general",
    priority: Number(payload.priority) || 0,
    status: payload.status || "draft",
    event_id: payload.event_id || null,
    published_at: payload.published_at || (payload.status === "published" ? new Date().toISOString() : null),
    expires_at: payload.expires_at || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("announcements")
    .insert([record])
    .select(`
      id,
      title,
      content,
      category,
      priority,
      status,
      published_at,
      expires_at,
      event_id,
      created_at,
      updated_at,
      event:event_id (
        id,
        title
      )
    `)
    .single();

  if (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }

  return {
    ...data,
    eventTitle: data.event?.title || null,
  };
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(id, payload) {
  const record = {
    title: payload.title.trim(),
    content: payload.content.trim(),
    category: payload.category || "general",
    priority: Number(payload.priority) || 0,
    status: payload.status || "draft",
    event_id: payload.event_id || null,
    published_at: payload.published_at || (payload.status === "published" ? new Date().toISOString() : null),
    expires_at: payload.expires_at || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("announcements")
    .update(record)
    .eq("id", id)
    .select(`
      id,
      title,
      content,
      category,
      priority,
      status,
      published_at,
      expires_at,
      event_id,
      created_at,
      updated_at,
      event:event_id (
        id,
        title
      )
    `)
    .single();

  if (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }

  return {
    ...data,
    eventTitle: data.event?.title || null,
  };
}

/**
 * Delete an announcement by ID
 */
export async function deleteAnnouncement(id) {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }

  return true;
}

/**
 * Quick toggle status (Draft <-> Published)
 */
export async function toggleAnnouncementStatus(id, currentStatus) {
  const newStatus = currentStatus === "published" ? "draft" : "published";
  const updatePayload = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "published") {
    updatePayload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("announcements")
    .update(updatePayload)
    .eq("id", id)
    .select(`
      id,
      title,
      content,
      category,
      priority,
      status,
      published_at,
      expires_at,
      event_id,
      created_at,
      updated_at,
      event:event_id (
        id,
        title
      )
    `)
    .single();

  if (error) {
    console.error("Error toggling announcement status:", error);
    throw error;
  }

  return {
    ...data,
    eventTitle: data.event?.title || null,
  };
}
