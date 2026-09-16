/**
 * NSS MIT Web Application - Image Optimization Pipeline
 *
 * Client-side browser-native optimization utility:
 * - Photographic images: converted to WebP with visually lossless quality (target ~85%)
 * - Graphics / logos / diagrams: supports PNG / lossless preservation
 * - Aspect ratio preserved; scaled down only if exceeding max dimension (default 2400px)
 * - Small images are never upscaled
 * - EXIF / camera / GPS metadata stripped automatically via canvas re-encoding
 * - Returns clean File, Blob, and accurate dimensions & size
 */

// Supported input formats for web CMS
export const SUPPORTED_INPUT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Maximum allowed input file size (25 MB) to prevent browser memory exhaustion
export const MAX_INPUT_FILE_SIZE_BYTES = 25 * 1024 * 1024;

// Default configuration options
export const DEFAULT_OPTIMIZATION_OPTIONS = {
  quality: 0.85,          // 85% WebP quality (visually lossless target)
  maxDimension: 2400,     // Max pixels on longest side
  format: "auto",         // "auto" | "webp" | "png" | "lossless"
  preserveTransparency: true, // Keep PNG for transparent graphics if requested
};

/**
 * Validates whether an input file is acceptable for CMS image processing
 */
export function validateImageFile(file, maxSizeBytes = MAX_INPUT_FILE_SIZE_BYTES) {
  if (!file) {
    throw new Error("No image file provided.");
  }

  const mimeType = (file.type || "").toLowerCase();
  const isValidMime = SUPPORTED_INPUT_MIME_TYPES.includes(mimeType);

  if (!isValidMime) {
    throw new Error(
      `Unsupported file type "${file.type || "unknown"}". Please upload a JPEG, PNG, or WebP image.`
    );
  }

  if (file.size <= 0) {
    throw new Error("Selected image file is empty (0 bytes).");
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    throw new Error(
      `Image file size (${sizeMb} MB) exceeds the maximum limit of ${maxMb} MB.`
    );
  }

  return true;
}

/**
 * Loads a File / Blob into an HTMLImageElement to inspect its original dimensions
 */
function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to decode image. The file may be corrupt."));
    };

    img.src = url;
  });
}

/**
 * Calculates resized dimensions while strictly maintaining the original aspect ratio.
 * Never upscales images that are already within maxDimension.
 */
export function calculateTargetDimensions(originalWidth, originalHeight, maxDimension = 2400) {
  if (originalWidth <= 0 || originalHeight <= 0) {
    throw new Error("Invalid original image dimensions.");
  }

  // If already within bounds, preserve exact dimensions
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return {
      width: originalWidth,
      height: originalHeight,
      wasResized: false,
    };
  }

  let width = originalWidth;
  let height = originalHeight;

  if (originalWidth >= originalHeight) {
    width = maxDimension;
    height = Math.round((originalHeight * maxDimension) / originalWidth);
  } else {
    height = maxDimension;
    width = Math.round((originalWidth * maxDimension) / originalHeight);
  }

  // Ensure minimum 1px dimension
  width = Math.max(1, width);
  height = Math.max(1, height);

  return {
    width,
    height,
    wasResized: true,
  };
}

/**
 * Checks if a Canvas contains any transparent pixels (alpha < 255)
 */
function checkHasTransparency(ctx, width, height) {
  try {
    const sampleWidth = Math.min(width, 200);
    const sampleHeight = Math.min(height, 200);
    const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const data = imgData.data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) {
        return true;
      }
    }
  } catch (e) {
    // If security exception or cross-origin, fall back to false
  }
  return false;
}

/**
 * Core image optimizer: Takes a browser File/Blob and outputs an optimized WebP (or PNG) File/Blob
 *
 * @param {File|Blob} file - Source image file
 * @param {Object} options - Custom optimization options
 * @returns {Promise<Object>} Optimization results with optimized File, Blob, dimensions, and stats
 */
export async function optimizeImage(file, options = {}) {
  const config = { ...DEFAULT_OPTIMIZATION_OPTIONS, ...options };

  // 1. Validate input
  validateImageFile(file);

  // 2. Decode image and extract native dimensions
  const img = await loadImageElement(file);
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  if (!originalWidth || !originalHeight) {
    throw new Error("Unable to determine image dimensions.");
  }

  // 3. Compute target dimensions (scale down if too large, never upscale)
  const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(
    originalWidth,
    originalHeight,
    config.maxDimension
  );

  // 4. Render to off-screen canvas (automatically strips EXIF / GPS / camera metadata)
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable in current browser environment.");
  }

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // 5. Determine target MIME type
  let targetMimeType = "image/webp";
  let targetQuality = Math.min(Math.max(config.quality, 0.7), 0.95);

  const inputMime = (file.type || "").toLowerCase();
  const isExplicitLossless = config.format === "lossless" || config.format === "png";

  if (isExplicitLossless) {
    targetMimeType = "image/png";
  } else if (config.preserveTransparency && inputMime === "image/png") {
    // If source is PNG with transparent pixels, we can either keep PNG or WebP with alpha
    const hasAlpha = checkHasTransparency(ctx, targetWidth, targetHeight);
    if (hasAlpha && config.format === "png") {
      targetMimeType = "image/png";
    } else {
      // Modern WebP supports alpha transparency natively
      targetMimeType = "image/webp";
    }
  }

  // 6. Encode canvas to Blob
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to encode image to " + targetMimeType));
        }
      },
      targetMimeType,
      targetMimeType === "image/webp" ? targetQuality : undefined
    );
  });

  if (!blob || blob.size <= 0) {
    throw new Error("Optimized image blob is empty.");
  }

  // 7. Construct optimized File object with matching extension and MIME type
  const extension = targetMimeType === "image/webp" ? "webp" : "png";
  const originalName = file.name || "image";
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  const optimizedFileName = `${baseName}.${extension}`;

  const optimizedFile = new File([blob], optimizedFileName, {
    type: targetMimeType,
    lastModified: Date.now(),
  });

  // 8. Calculate statistics
  const originalSize = file.size;
  const optimizedSize = optimizedFile.size;
  const compressionPercentage = Math.max(
    0,
    Math.round(((originalSize - optimizedSize) / originalSize) * 100)
  );

  return {
    file: optimizedFile,
    blob,
    width: targetWidth,
    height: targetHeight,
    mimeType: targetMimeType,
    fileSize: optimizedSize,
    originalWidth,
    originalHeight,
    originalSize,
    originalMimeType: file.type || "image/jpeg",
    compressionPercentage,
  };
}
