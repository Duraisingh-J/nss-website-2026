import React, { useState, useEffect, useRef, useMemo } from "react";
import { resolveImageUrl } from "../../utils/imageUrlResolver";
import "./ProfileImage.css";

/**
 * ProfileImage
 *
 * Ultra-reliable profile image renderer with:
 * - Single-point safe URL resolution (handles Supabase storage paths, full URLs, nulls)
 * - Seamless aspect ratio preservation (no layout shifts)
 * - Single automatic retry on network/CDN failure
 * - Graceful fallback to provided fallback avatar/initials on permanent failure (no broken image icon)
 * - Controlled eager / lazy loading and async decoding
 * - Development-only diagnostic logging
 *
 * @param {Object} props
 * @param {string|null} props.src - Raw image source (URL or Supabase storage path)
 * @param {string} props.alt - Alt text for image
 * @param {string} [props.className=""] - Additional class name for img
 * @param {React.ReactNode} props.fallback - Fallback element (initials or crest)
 * @param {boolean} [props.priority=false] - When true, forces eager loading with high fetch priority
 * @param {Object} [props.personInfo] - Optional metadata for development diagnostics ({ id, name, originalSrc })
 */
export default function ProfileImage({
  src,
  alt = "Profile Photo",
  className = "",
  fallback = null,
  priority = false,
  personInfo = null,
}) {
  const resolvedUrl = useMemo(() => resolveImageUrl(src), [src]);

  // States: 'idle' | 'loading' | 'loaded' | 'error'
  const [status, setStatus] = useState(() => (resolvedUrl ? "loading" : "error"));
  const [retryCount, setRetryCount] = useState(0);
  const [imgSrc, setImgSrc] = useState(resolvedUrl);

  const prevSrcRef = useRef(resolvedUrl);

  // Sync state whenever the resolvedUrl changes
  useEffect(() => {
    if (resolvedUrl !== prevSrcRef.current) {
      prevSrcRef.current = resolvedUrl;
      setRetryCount(0);
      if (resolvedUrl) {
        setImgSrc(resolvedUrl);
        setStatus("loading");
      } else {
        setImgSrc(null);
        setStatus("error");
      }
    }
  }, [resolvedUrl]);

  const handleLoad = () => {
    setStatus("loaded");
  };

  const handleError = (e) => {
    if (retryCount < 1 && resolvedUrl) {
      // Retry once with a timestamp param to bypass cold-start / broken cache
      const separator = resolvedUrl.includes("?") ? "&" : "?";
      const retryUrl = `${resolvedUrl}${separator}_retry=${Date.now()}`;

      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[ProfileImage] Retrying image load for "${personInfo?.name || alt}" (Attempt 2/2)`,
          {
            personId: personInfo?.id,
            originalSrc: src,
            failedUrl: imgSrc,
            retryUrl,
          }
        );
      }

      setRetryCount(1);
      setImgSrc(retryUrl);
    } else {
      // Terminal failure -> render fallback
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[ProfileImage] Failed to load image for "${personInfo?.name || alt}". Displaying fallback initials/crest.`,
          {
            personId: personInfo?.id,
            name: personInfo?.name || alt,
            originalSrc: src,
            resolvedUrl,
            errorEvent: e?.type,
          }
        );
      }

      setStatus("error");
    }
  };

  // If no valid URL or permanently failed, render fallback avatar
  if (!resolvedUrl || status === "error" || !imgSrc) {
    return <>{fallback}</>;
  }

  return (
    <div className="profile-image-wrapper">
      {/* Loading Skeleton Placeholder (Visible only while image is fetching) */}
      {status === "loading" && (
        <div
          className="profile-image-skeleton"
          aria-hidden="true"
        />
      )}

      {/* Actual Profile Image */}
      <img
        src={imgSrc}
        alt={alt}
        className={`profile-image-element ${className} ${
          status === "loaded" ? "profile-image-element--loaded" : "profile-image-element--hidden"
        }`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
