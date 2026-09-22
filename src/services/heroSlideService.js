import { supabase } from "../lib/supabase.js";
import { uploadMedia, getMediaPublicUrl, deleteMedia } from "./mediaService.js";

export { getMediaPublicUrl };

/**
 * Transforms a raw Supabase hero_slides database row into a UI presentation object
 */
export function transformHeroSlide(row) {
  if (!row) return null;

  const imageUrl = row.media?.storage_path
    ? getMediaPublicUrl(row.media.storage_path)
    : null;

  return {
    id: row.id,
    title: row.title || "Untitled Slide",
    subtitle: row.subtitle || "",
    description: row.description || "",
    media_id: row.media_id,
    media: row.media || null,
    imageUrl: imageUrl,
    button_text: row.button_text || "",
    button_url: row.button_url || "",
    start_at: row.start_at || null,
    end_at: row.end_at || null,
    priority: Number(row.priority) || 0,
    is_published: Boolean(row.is_published),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetches all hero slides for the admin studio.
 * Ordered by priority descending (highest priority first), then created_at ascending.
 */
export async function getAdminHeroSlides() {
  const { data, error } = await supabase
    .from("hero_slides")
    .select(`
      id,
      title,
      subtitle,
      description,
      media_id,
      button_text,
      button_url,
      start_at,
      end_at,
      priority,
      is_published,
      created_at,
      updated_at,
      media:media_id (
        id,
        storage_path,
        file_name,
        alt_text
      )
    `)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching admin hero slides:", error);
    throw error;
  }

  return (data || []).map(transformHeroSlide);
}

/**
 * Fetches active published hero slides for the public website homepage.
 * Filters:
 * - is_published = true
 * - start_at IS NULL OR start_at <= now()
 * - end_at IS NULL OR end_at >= now()
 * Ordered by priority descending, then created_at ascending.
 */
export async function getPublicHeroSlides() {
  try {
    const nowISO = new Date().toISOString();

    const { data, error } = await supabase
      .from("hero_slides")
      .select(`
        id,
        title,
        subtitle,
        description,
        media_id,
        button_text,
        button_url,
        start_at,
        end_at,
        priority,
        is_published,
        created_at,
        media:media_id (
          id,
          storage_path,
          file_name,
          alt_text
        )
      `)
      .eq("is_published", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Error fetching public hero slides from Supabase:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Apply schedule date filters client-side to ensure complete precision
    const activeSlides = data.filter((slide) => {
      if (slide.start_at && new Date(slide.start_at) > new Date(nowISO)) {
        return false;
      }
      if (slide.end_at && new Date(slide.end_at) < new Date(nowISO)) {
        return false;
      }
      return true;
    });

    return activeSlides.map(transformHeroSlide);
  } catch (err) {
    console.warn("Failed to load public hero slides:", err);
    return [];
  }
}

/**
 * Creates a new hero slide with an uploaded image.
 *
 * @param {Object} payload - Slide fields strictly matching hero_slides table
 * @param {File} imageFile - Required image file selected by admin
 */
export async function createHeroSlide(payload, imageFile) {
  if (!imageFile) {
    throw new Error("A hero slide image is required.");
  }
  if (!payload.title || !payload.title.trim()) {
    throw new Error("A slide title is required.");
  }
  if (!payload.subtitle || !payload.subtitle.trim()) {
    throw new Error("A slide subtitle is required.");
  }

  let mediaId = null;

  // 1. Upload photo to 'heroes' folder in 'public-media' bucket
  try {
    const uploadedMedia = await uploadMedia(imageFile, {
      folder: "heroes",
      caption: payload.title.trim(),
      altText: payload.title.trim(),
    });
    mediaId = uploadedMedia.id;
  } catch (uploadErr) {
    console.error("Failed to upload hero image:", uploadErr);
    throw new Error(`Hero image upload failed: ${uploadErr.message}`);
  }

  // 2. Prepare database record strictly matching real schema
  const record = {
    title: payload.title.trim(),
    subtitle: payload.subtitle.trim(),
    description: payload.description ? payload.description.trim() : null,
    media_id: mediaId,
    button_text: payload.button_text ? payload.button_text.trim() : null,
    button_url: payload.button_url ? payload.button_url.trim() : null,
    start_at: payload.start_at ? new Date(payload.start_at).toISOString() : null,
    end_at: payload.end_at ? new Date(payload.end_at).toISOString() : null,
    priority: Number(payload.priority) || 0,
    is_published: Boolean(payload.is_published),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("hero_slides")
    .insert([record])
    .select(`
      id,
      title,
      subtitle,
      description,
      media_id,
      button_text,
      button_url,
      start_at,
      end_at,
      priority,
      is_published,
      created_at,
      updated_at,
      media:media_id (
        id,
        storage_path,
        file_name,
        alt_text
      )
    `)
    .single();

  if (error) {
    // Rollback uploaded image if database insert fails
    if (mediaId) {
      try {
        await deleteMedia(mediaId);
      } catch (rollbackErr) {
        console.warn("Could not rollback media record after failed hero slide insert:", rollbackErr);
      }
    }
    console.error("Error creating hero slide in Supabase:", error);
    throw error;
  }

  return transformHeroSlide(data);
}

/**
 * Updates an existing hero slide. Optionally uploads and replaces image.
 */
export async function updateHeroSlide(id, payload, imageFile = null) {
  if (!payload.title || !payload.title.trim()) {
    throw new Error("A slide title is required.");
  }
  if (!payload.subtitle || !payload.subtitle.trim()) {
    throw new Error("A slide subtitle is required.");
  }

  let mediaId = payload.media_id;

  // 1. If new image provided, upload and replace
  if (imageFile) {
    try {
      const uploadedMedia = await uploadMedia(imageFile, {
        folder: "heroes",
        caption: payload.title.trim(),
        altText: payload.title.trim(),
      });

      // Cleanup old media if different
      if (mediaId && mediaId !== uploadedMedia.id) {
        try {
          await deleteMedia(mediaId);
        } catch (e) {
          // ignore error
        }
      }
      mediaId = uploadedMedia.id;
    } catch (uploadErr) {
      console.error("Failed to upload replacement hero image:", uploadErr);
      throw new Error(`Replacement image upload failed: ${uploadErr.message}`);
    }
  }

  // 2. Prepare database record strictly matching real schema
  const record = {
    title: payload.title.trim(),
    subtitle: payload.subtitle.trim(),
    description: payload.description ? payload.description.trim() : null,
    media_id: mediaId,
    button_text: payload.button_text ? payload.button_text.trim() : null,
    button_url: payload.button_url ? payload.button_url.trim() : null,
    start_at: payload.start_at ? new Date(payload.start_at).toISOString() : null,
    end_at: payload.end_at ? new Date(payload.end_at).toISOString() : null,
    priority: Number(payload.priority) || 0,
    is_published: Boolean(payload.is_published),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("hero_slides")
    .update(record)
    .eq("id", id)
    .select(`
      id,
      title,
      subtitle,
      description,
      media_id,
      button_text,
      button_url,
      start_at,
      end_at,
      priority,
      is_published,
      created_at,
      updated_at,
      media:media_id (
        id,
        storage_path,
        file_name,
        alt_text
      )
    `)
    .single();

  if (error) {
    console.error("Error updating hero slide:", error);
    throw error;
  }

  return transformHeroSlide(data);
}

/**
 * Toggles the publication state of a hero slide
 */
export async function togglePublishHeroSlide(id, currentStatus) {
  const newStatus = !currentStatus;
  const { data, error } = await supabase
    .from("hero_slides")
    .update({
      is_published: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
      id,
      title,
      subtitle,
      description,
      media_id,
      button_text,
      button_url,
      start_at,
      end_at,
      priority,
      is_published,
      created_at,
      updated_at,
      media:media_id (
        id,
        storage_path,
        file_name,
        alt_text
      )
    `)
    .single();

  if (error) {
    console.error("Error toggling hero slide publication:", error);
    throw error;
  }

  return transformHeroSlide(data);
}

/**
 * Deletes a hero slide and removes its associated media file
 */
export async function deleteHeroSlide(id, mediaId = null) {
  const { error } = await supabase
    .from("hero_slides")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting hero slide:", error);
    throw error;
  }

  if (mediaId) {
    try {
      await deleteMedia(mediaId);
    } catch (medErr) {
      console.warn("Could not delete associated media record:", medErr);
    }
  }

  return true;
}

/**
 * Persists a reordered list of hero slides by updating their priority values.
 * The first item in orderedSlides gets the highest priority.
 */
export async function reorderHeroSlides(orderedSlides) {
  if (!Array.isArray(orderedSlides) || orderedSlides.length === 0) return [];

  const total = orderedSlides.length;
  const updates = orderedSlides.map((slide, index) => {
    const priority = (total - index) * 10;
    return supabase
      .from("hero_slides")
      .update({ priority, updated_at: new Date().toISOString() })
      .eq("id", slide.id);
  });

  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error);
  if (hasError) {
    console.error("Error updating slide priority during reorder");
    throw new Error("Failed to persist slide order in database");
  }

  return orderedSlides.map((s, index) => ({
    ...s,
    priority: (total - index) * 10,
  }));
}
