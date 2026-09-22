import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Layers, ArrowRight } from "lucide-react";
import { getEventStatus, STATUS } from "../../utils/timeStatusUtils";
import useLiveTime from "../../hooks/useLiveTime";

/**
 * EventCard — Clean Institutional Event Card
 * Answers "What is this event?" with Live Automatic Status Updates
 */
export default function EventCard({ event, currentTime }) {
  const { now } = useLiveTime(event ? [event] : []);
  if (!event) return null;

  const effectiveNow = currentTime || now;
  const sessionCount = Array.isArray(event.sessions) ? event.sessions.length : (event.totalSessions || 0);
  const statusLabel = getEventStatus(event, effectiveNow);
  const isCompleted = statusLabel === STATUS.COMPLETED;
  const isOngoing = statusLabel === STATUS.ONGOING;

  const eventLink = `/events/${event.slug || event.id}`;

  return (
    <article className="nss-event-card" aria-label={event.title}>
      {/* 1. Cover Image Wrap */}
      <div className="nss-event-card-media">
        {event.coverImage || event.cover_image_url ? (
          <img
            src={event.coverImage || event.cover_image_url}
            alt={event.title}
            className="nss-event-card-img"
            loading="lazy"
          />
        ) : (
          <div className="nss-event-card-placeholder">
            <span className="placeholder-cat">{event.categoryLabel || "NSS EVENT"}</span>
            <span className="placeholder-title font-editorial">{event.title}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="nss-event-card-badges">
          <span className={`nss-status-badge ${isCompleted ? "status--completed" : isOngoing ? "status--ongoing" : "status--upcoming"}`}>
            {isOngoing && <span className="status-live-dot" />}
            <span>{statusLabel}</span>
          </span>
        </div>
      </div>

      {/* 2. Card Body */}
      <div className="nss-event-card-body">
        {/* Category & Session count chip */}
        <div className="nss-event-meta-top">
          <span className="nss-event-category">{event.categoryLabel || "Event"}</span>
          {sessionCount > 0 && (
            <span className="nss-event-session-pill">
              <Layers className="w-3.5 h-3.5" />
              <span>{sessionCount} {sessionCount === 1 ? "Session" : "Sessions"}</span>
            </span>
          )}
        </div>

        {/* Event Title */}
        <h3 className="nss-event-card-title font-editorial">
          <Link to={eventLink} className="event-title-link">
            {event.title}
          </Link>
        </h3>

        {/* Meta Line: Date & Location */}
        <div className="nss-event-card-meta">
          <div className="meta-item">
            <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>{event.dateDisplay || event.date || "September 2026"}</span>
          </div>
          {event.location && (
            <div className="meta-item">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        <p className="nss-event-card-desc">
          {event.shortDesc || event.desc || event.description || "NSS student volunteers initiative."}
        </p>

        {/* Card Footer CTA */}
        <div className="nss-event-card-footer">
          <Link to={eventLink} className="nss-event-cta-btn">
            <span>Explore Event</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
