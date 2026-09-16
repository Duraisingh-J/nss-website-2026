import { supabase } from "../lib/supabase.js";
import { optimizeImage } from "../utils/imageOptimizer.js";

/**
 * Generates a standard RFC4122 v4 UUID
 */
function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Resolves a public URL for a given storage path within 'public-media' bucket
 */
export function getMediaPublicUrl(storagePath) {
  if (!storagePath) return null;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  const { data } = supabase.storage
    .from("public-media")
    .getPublicUrl(storagePath);
  return data?.publicUrl || null;
}

/**
 * Uploads an image to Supabase Storage and records its metadata in the 'media' table.
 *
 * Lifecycle:
 * 1. Client-side visually lossless WebP optimization (canvas re-encoding & EXIF stripping)
 * 2. Upload optimized object to 'public-media' bucket using UUID-based storage path
 * 3. Insert metadata row into 'media' table with accurate optimized dimensions and size
 * 4. Automatic Rollback: If media table insert fails, the storage object is immediately removed.
 *
 * @param {File|Blob} file - Original image file selected by administrator
 * @param {Object} options - Upload options
 * @param {string} options.folder - Destination folder ('people', 'events', 'sessions', etc.)
 * @param {string} [options.entityId] - Optional associated entity ID for subfolder paths
 * @param {string} [options.altText] - Accessible alt text
 * @param {string} [options.caption] - Image caption
 * @param {boolean} [options.optimize=true] - Whether to optimize image before upload
 * @param {number} [options.quality=0.85] - WebP quality target (0.82-0.88)
 * @param {number} [options.maxDimension=2400] - Max dimension on longest side
 * @param {string} [options.format="auto"] - Format override ("auto", "webp", "png")
 * @returns {Promise<Object>} Created media record and public URL
 */
export async function uploadMedia(file, options = {}) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const folder = (options.folder || "general").replace(/\/+$/, "");
  const shouldOptimize = options.optimize !== false;

  let uploadFile = file;
  let finalWidth = null;
  let finalHeight = null;
  let finalMimeType = file.type || "image/jpeg";
  let finalSize = file.size;
  let optimizationStats = null;

  // 1. Client-Side Optimization (before network transfer)
  if (shouldOptimize) {
    const optimizationResult = await optimizeImage(file, {
      quality: options.quality ?? 0.85,
      maxDimension: options.maxDimension ?? 2400,
      format: options.format ?? "auto",
      preserveTransparency: options.preserveTransparency ?? true,
    });

    uploadFile = optimizationResult.file;
    finalWidth = optimizationResult.width;
    finalHeight = optimizationResult.height;
    finalMimeType = optimizationResult.mimeType;
    finalSize = optimizationResult.fileSize;
    optimizationStats = {
      originalSize: optimizationResult.originalSize,
      optimizedSize: optimizationResult.fileSize,
      originalWidth: optimizationResult.originalWidth,
      originalHeight: optimizationResult.originalHeight,
      finalWidth: optimizationResult.width,
      finalHeight: optimizationResult.height,
      compressionPercentage: optimizationResult.compressionPercentage,
      format: optimizationResult.mimeType,
    };
  }

  // 2. Generate UUID and construct UUID-based Storage Path
  const mediaId = generateUUID();
  const fileExt = finalMimeType === "image/webp" ? "webp" : finalMimeType === "image/png" ? "png" : "jpg";

  let storagePath;
  if (options.entityId) {
    storagePath = `${folder}/${options.entityId}/${mediaId}.${fileExt}`;
  } else {
    storagePath = `${folder}/${mediaId}.${fileExt}`;
  }

  // 3. Upload optimized object to Supabase Storage 'public-media' bucket
  const { error: uploadError } = await supabase.storage
    .from("public-media")
    .upload(storagePath, uploadFile, {
      contentType: finalMimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image to storage: ${uploadError.message}`);
  }

  // 4. Insert metadata row into 'media' table
  const originalFileName = file.name || `image.${fileExt}`;
  let mediaRow = null;

  try {
    // Attempt 1: Insert using original file name
    let insertResult = await supabase
      .from("media")
      .insert({
        id: mediaId,
        file_name: originalFileName,
        storage_path: storagePath,
        mime_type: finalMimeType,
        file_size: finalSize,
        width: finalWidth,
        height: finalHeight,
        alt_text: options.altText || originalFileName,
        caption: options.caption || null,
      })
      .select("id, file_name, storage_path, mime_type, file_size, width, height, alt_text, caption, created_at")
      .single();

    // If duplicate key on file_name occurs, disambiguate with short UUID
    if (insertResult.error && insertResult.error.code === "23505") {
      const extIndex = originalFileName.lastIndexOf(".");
      const namePart = extIndex > 0 ? originalFileName.substring(0, extIndex) : originalFileName;
      const extPart = extIndex > 0 ? originalFileName.substring(extIndex) : "";
      const disambiguatedName = `${namePart}-${mediaId.substring(0, 8)}${extPart}`;

      insertResult = await supabase
        .from("media")
        .insert({
          id: mediaId,
          file_name: disambiguatedName,
          storage_path: storagePath,
          mime_type: finalMimeType,
          file_size: finalSize,
          width: finalWidth,
          height: finalHeight,
          alt_text: options.altText || originalFileName,
          caption: options.caption || null,
        })
        .select("id, file_name, storage_path, mime_type, file_size, width, height, alt_text, caption, created_at")
        .single();
    }

    if (insertResult.error) {
      throw insertResult.error;
    }

    mediaRow = insertResult.data;
  } catch (dbError) {
    // ROLLBACK: Delete the uploaded storage object to prevent orphan files
    console.error("Media table INSERT failed. Rolling back uploaded storage object...", dbError);
    await supabase.storage.from("public-media").remove([storagePath]);
    throw new Error(`Failed to save image record: ${dbError.message}`);
  }

  // 5. Resolve public URL
  const publicUrl = getMediaPublicUrl(storagePath);

  return {
    id: mediaRow.id,
    fileName: mediaRow.file_name,
    storagePath: mediaRow.storage_path,
    mimeType: mediaRow.mime_type,
    fileSize: mediaRow.file_size,
    width: mediaRow.width,
    height: mediaRow.height,
    altText: mediaRow.alt_text,
    caption: mediaRow.caption,
    publicUrl,
    optimization: optimizationStats,
  };
}

/**
 * Deletes a media item from both Supabase Storage and the 'media' table
 */
export async function deleteMedia(mediaId) {
  if (!mediaId) return false;

  // 1. Fetch storage_path from media table
  const { data: mediaRow, error: fetchError } = await supabase
    .from("media")
    .select("id, storage_path")
    .eq("id", mediaId)
    .single();

  if (fetchError || !mediaRow) {
    return false;
  }

  // 2. Delete from media table first
  const { error: dbDeleteError } = await supabase
    .from("media")
    .delete()
    .eq("id", mediaId);

  if (dbDeleteError) {
    throw new Error(`Failed to delete media record: ${dbDeleteError.message}`);
  }

  // 3. Remove from storage
  if (mediaRow.storage_path) {
    await supabase.storage
      .from("public-media")
      .remove([mediaRow.storage_path]);
  }

  return true;
}
