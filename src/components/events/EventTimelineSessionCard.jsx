import React from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Users, ArrowRight, Image as ImageIcon } from "lucide-react";

/**
 * EventTimelineSessionCard — High-fidelity session card for Event Detail Page timeline
 * Supports sessions with cover images and graceful text-first layouts when no image is present.
 */
export default function EventTimelineSessionCard({ session, eventId, eventSlug }) {
  if (!session) return null;

  const parentSlug = eventSlug || eventId;
  const sessionSlug = session.slug || session.id;
  const sessionUrl = `/events/${parentSlug}/sessions/${sessionSlug}`;

  const galleryCount = Array.isArray(session.gallery)
    ? session.gallery.length
    : Array.isArray(session.photos)
    ? session.photos.length
    : 0;

  const imageUrl =
    session.coverImage ||
    session.coverImageUrl ||
    session.image_url ||
    (Array.isArray(session.photos) && session.photos.length > 0 ? session.photos[0]?.publicUrl : null) ||
    (Array.isArray(session.gallery) && session.gallery.length > 0 ? session.gallery[0]?.url : null);

  const hasImage = Boolean(imageUrl);

  return (
    <article className={`nss-timeline-session-card ${hasImage ? "card--has-media" : "card--text-first"}`}>
      {/* Visual / Media Column (when available) */}
      {hasImage && (
        <div className="session-card-media-col">
          <Link to={sessionUrl} className="session-media-link" tabIndex={-1} aria-hidden="true">
            <img
              src={imageUrl}
              alt={session.title}
              className="session-card-thumb"
              loading="lazy"
            />
            {galleryCount > 0 && (
              <span className="session-gallery-badge">
                <ImageIcon className="w-3 h-3" />
                <span>{galleryCount} photos</span>
              </span>
            )}
          </Link>
        </div>
      )}

      {/* Content Column */}
      <div className="session-card-content-col">
        {/* Top Kicker / Day / Category */}
        <div className="session-card-kicker-row">
          <div className="session-day-pill">
            {session.dayLabel || (session.day ? `Day ${session.day}` : "Activity")}
          </div>
          <span className="session-category-tag">
            {session.categoryLabel || "Session"}
          </span>
        </div>

        {/* Title */}
        <h4 className="session-card-title font-editorial">
          <Link to={sessionUrl} className="session-title-anchor">
            {session.title}
          </Link>
        </h4>

        {/* Schedule & Location Details */}
        <div className="session-card-meta-row">
          <div className="session-meta-chip">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{session.timeDisplay || session.time || "10:00 AM — 01:00 PM"}</span>
          </div>
          {session.location && (
            <div className="session-meta-chip">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{session.location}</span>
            </div>
          )}
          {session.participants && (
            <div className="session-meta-chip">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{session.participants} Volunteers</span>
            </div>
          )}
        </div>

        {/* Narrative Description */}
        <p className="session-card-description">
          {session.shortDesc || session.desc || session.description}
        </p>

        {/* Card CTA */}
        <div className="session-card-action-row">
          <Link to={sessionUrl} className="session-view-link">
            <span>View Session Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
