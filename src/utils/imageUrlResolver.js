import { supabase } from "../lib/supabase.js";

/**
 * Validates and safely resolves an image URL or Supabase Storage path into a reliable,
 * production-ready public image URL.
 *
 * Handles:
 * - Full HTTPS / HTTP URLs
 * - Relative paths (/images/...)
 * - Supabase Storage paths (e.g., 'people/abc.webp')
 * - Null, undefined, empty strings, whitespace, or invalid types
 *
 * @param {string|null|undefined} input - Raw image string or storage path
 * @param {string} [bucket="public-media"] - Supabase storage bucket name
 * @returns {string|null} Resolved public URL or null if invalid
 */
export function resolveImageUrl(input, bucket = "public-media") {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") {
    return null;
  }

  // Handle data URIs or object blob URLs
  if (trimmed.startsWith("data:image/") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // Handle full HTTP / HTTPS URLs
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      // Basic validation of URL structure
      const parsed = new URL(trimmed);
      return parsed.href;
    } catch {
      return null;
    }
  }

  // Handle local root-relative paths like /images/hero.jpg
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Handle Supabase Storage path (e.g., "people/123-456.webp" or "general/hero.jpg")
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(trimmed);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[imageUrlResolver] Failed to resolve Supabase storage path:", trimmed, err);
    }
  }

  return null;
}
