import { supabase } from "../lib/supabase.js";
import { uploadMedia, getMediaPublicUrl, deleteMedia } from "./mediaService.js";

export { getMediaPublicUrl };

/**
 * Suggested categories for NSS Achievements & Recognitions
 */
export const ACHIEVEMENT_CATEGORIES = [
  "National Award",
  "State Award",
  "University Level",
  "Institutional Recognition",
  "Community Impact",
  "Special Mention",
  "Other",
];

/**
 * Maps numeric unit (1-7) to Roman numeral unit string
 */
export function formatUnitLabel(unit) {
  if (!unit && unit !== 0) return null;
  const num = parseInt(unit, 10);
  const romanMap = {
    1: "Unit I",
    2: "Unit II",
    3: "Unit III",
    4: "Unit IV",
    5: "Unit V",
    6: "Unit VI",
    7: "Unit VII",
  };
  return romanMap[num] || `Unit ${unit}`;
}

/**
 * Formats achievement date for editorial presentation (e.g. "15 Aug 2026")
 */
export function formatAchievementDate(dateStr) {
  if (!dateStr) return "—";
  try {
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
  } catch (err) {
    return dateStr;
  }
}

/**
 * Extracts year string from date (e.g. "2026")
 */
export function formatAchievementYear(dateStr) {
  if (!dateStr) return "Archived";
  try {
    const cleanDate = dateStr.split("T")[0];
    return cleanDate.split("-")[0] || "Archived";
  } catch (err) {
    return "Archived";
  }
}

/**
 * Transforms raw database row into UI presentation object
 */
export function transformAchievement(row) {
  if (!row) return null;

  const imageUrl = getMediaPublicUrl(row.media?.storage_path);
  const year = formatAchievementYear(row.achievement_date);

  return {
    id: row.id,
    title: row.title || "Untitled Recognition",
    description: row.description || "",
    achievement_date: row.achievement_date || "",
    year: year,
    formattedDate: formatAchievementDate(row.achievement_date),
    category: row.category || "Institutional Recognition",
    media_id: row.media_id || null,
    imageUrl: imageUrl,
    person_id: row.person_id || null,
    personName: row.person?.name || null,
    personDesignation: row.person?.designation || null,
    personUnit: row.person?.unit ? formatUnitLabel(row.person.unit) : null,
    unit: row.unit || null,
    unitLabel: formatUnitLabel(row.unit),
    is_published: Boolean(row.is_published),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetches all achievements for admin management
 * Ordered by achievement_date descending, then created_at descending
 */
export async function getAdminAchievements() {
  const { data, error } = await supabase
    .from("achievements")
    .select(`
      id,
      title,
      description,
      achievement_date,
      category,
      media_id,
      person_id,
      unit,
      is_published,
      created_at,
      updated_at,
      media:media_id (
        id,
        storage_path
      ),
      person:person_id (
        id,
        name,
        designation,
        unit
      )
    `)
    .order("achievement_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching achievements:", error);
    throw error;
  }

  return (data || []).map(transformAchievement);
}

/**
 * Fetches people list for optional achievement recipient linking
 */
export async function getPeopleForSelection() {
  const { data, error } = await supabase
    .from("people")
    .select("id, name, designation, unit")
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    console.warn("Could not load people list for achievement linking:", error);
    return [];
  }

  return data || [];
}

/**
 * Creates a new achievement record with optional image upload
 */
export async function createAchievement(payload, imageFile = null) {
  let mediaId = null;

  // 1. Upload photo if provided
  if (imageFile) {
    try {
      const uploadedMedia = await uploadMedia(imageFile, {
        folder: "achievements",
        caption: payload.title,
      });
      mediaId = uploadedMedia.id;
    } catch (uploadErr) {
      console.error("Failed to upload achievement image:", uploadErr);
      throw new Error(`Image upload failed: ${uploadErr.message}`);
    }
  }

  // 2. Prepare database record strictly matching real schema
  const record = {
    title: payload.title.trim(),
    description: payload.description ? payload.description.trim() : null,
    achievement_date: payload.achievement_date,
    category: payload.category ? payload.category.trim() : null,
    media_id: mediaId,
    person_id: payload.person_id || null,
    unit: payload.unit ? parseInt(payload.unit, 10) : null,
    is_published: Boolean(payload.is_published),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("achievements")
    .insert([record])
    .select(`
      id,
      title,
      description,
      achievement_date,
      category,
      media_id,
      person_id,
      unit,
      is_published,
      created_at,
      updated_at,
      media:media_id (
        id,
        storage_path
      ),
      person:person_id (
        id,
        name,
        designation,
        unit
      )
    `)
    .single();

  if (error) {
    // Rollback uploaded image if database insert fails
    if (mediaId) {
      try {
        await deleteMedia(mediaId);
      } catch (rollbackErr) {
        console.warn("Could not rollback media record after failed achievement insert:", rollbackErr);
      }
    }
    console.error("Error creating achievement:", error);
    throw error;
  }

  return transformAchievement(data);
}

/**
 * Updates an existing achievement record
 */
export async function updateAchievement(id, payload, imageFile = null, removeImage = false) {
  let mediaId = payload.media_id || null;

  // 1. If explicit remove requested
  if (removeImage && mediaId) {
    try {
      await deleteMedia(mediaId);
      mediaId = null;
    } catch (delErr) {
      console.warn("Could not remove old achievement media:", delErr);
      mediaId = null;
    }
  }

  // 2. If new image file provided, upload and replace
  if (imageFile) {
    try {
      const uploadedMedia = await uploadMedia(imageFile, {
        folder: "achievements",
        caption: payload.title,
      });
      // Delete old media if different
      if (mediaId && mediaId !== uploadedMedia.id) {
        try {
          await deleteMedia(mediaId);
        } catch (e) {
          // ignore
        }
      }
      mediaId = uploadedMedia.id;
    } catch (uploadErr) {
      console.error("Failed to upload replacement achievement image:", uploadErr);
      throw new Error(`Image upload failed: ${uploadErr.message}`);
    }
  }

  // 3. Update database record strictly matching real schema
  const record = {
    title: payload.title.trim(),
    description: payload.description ? payload.description.trim() : null,
    achievement_date: payload.achievement_date,
    category: payload.category ? payload.category.trim() : null,
    media_id: mediaId,
    person_id: payload.person_id || null,
    unit: payload.unit ? parseInt(payload.unit, 10) : null,
    is_published: Boolean(payload.is_published),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("achievements")
    .update(record)
    .eq("id", id)
    .select(`
      id,
      title,
      description,
      achievement_date,
      category,
      media_id,
      person_id,
      unit,
      is_published,
      created_at,
      updated_at,
      media:media_id (
        id,
        storage_path
      ),
      person:person_id (
        id,
        name,
        designation,
        unit
      )
    `)
    .single();

  if (error) {
    console.error("Error updating achievement:", error);
    throw error;
  }

  return transformAchievement(data);
}

/**
 * Deletes an achievement and its associated media
 */
export async function deleteAchievement(id, mediaId = null) {
  const { error } = await supabase
    .from("achievements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting achievement:", error);
    throw error;
  }

  if (mediaId) {
    try {
      await deleteMedia(mediaId);
    } catch (mediaErr) {
      console.warn("Could not delete associated media for achievement:", mediaErr);
    }
  }

  return true;
}

/**
 * Quick toggle publish status
 */
export async function toggleAchievementPublish(id, currentStatus) {
  const newStatus = !currentStatus;

  const { data, error } = await supabase
    .from("achievements")
    .update({
      is_published: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
      id,
      title,
      description,
      achievement_date,
      category,
      media_id,
      person_id,
      unit,
      is_published,
      created_at,
      updated_at,
      media:media_id (
        id,
        storage_path
      ),
      person:person_id (
        id,
        name,
        designation,
        unit
      )
    `)
    .single();

  if (error) {
    console.error("Error toggling achievement publish status:", error);
    throw error;
  }

  return transformAchievement(data);
}
