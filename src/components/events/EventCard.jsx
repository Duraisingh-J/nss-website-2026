import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Layers, MapPin } from "lucide-react";
import { getEventStatus, STATUS } from "../../utils/timeStatusUtils";
import useLiveTime from "../../hooks/useLiveTime";

export default function EventCard({ event, currentTime }) {
  const { now } = useLiveTime(event ? [event] : []);

  if (!event) return null;

  const effectiveNow = currentTime || now;
  const sessionCount = Array.isArray(event.sessions)
    ? event.sessions.length
    : event.totalSessions || 0;
  const statusLabel = getEventStatus(event, effectiveNow);
  const isCompleted = statusLabel === STATUS.COMPLETED;
  const isOngoing = statusLabel === STATUS.ONGOING;
  const eventLink = `/events/${event.slug || event.id}`;

  return (
    <article className="nss-event-card" aria-label={event.title}>
      <div className="nss-event-card-border" />

      <div className="nss-event-card-background">
        {event.coverImage || event.cover_image_url ? (
          <img
            src={event.coverImage || event.cover_image_url}
            alt=""
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="nss-event-card-overlay" />

      <div className="nss-event-card-number">
        {String(event.order || "").padStart(2, "0")}
      </div>

      <div className="nss-event-card-status">
        <span
          className={
            isCompleted
              ? "status-completed"
              : isOngoing
                ? "status-ongoing"
                : "status-upcoming"
          }
        >
          {isOngoing && <span className="nss-status-dot" />}
          {statusLabel}
        </span>
      </div>

      <div className="nss-event-card-content">
        <div className="nss-event-logo" aria-hidden="true">
          <span className="nss-event-logo-main">NSS</span>
          <span className="nss-event-logo-sub">NOT ME BUT YOU</span>
        </div>

        <span className="nss-event-category">
          {event.categoryLabel || "NSS EVENT"}
        </span>

        <h3 className="nss-event-title">{event.title}</h3>

        <p className="nss-event-description">
          {event.shortDesc ||
            event.desc ||
            event.description ||
            "NSS student volunteers initiative."}
        </p>

        <div className="nss-event-info">
          {event.dateDisplay || event.date ? (
            <span>
              <Calendar size={14} />
              {event.dateDisplay || event.date}
            </span>
          ) : null}
          {event.location ? (
            <span>
              <MapPin size={14} />
              {event.location}
            </span>
          ) : null}
          {sessionCount > 0 ? (
            <span>
              <Layers size={14} />
              {sessionCount} {sessionCount === 1 ? "Session" : "Sessions"}
            </span>
          ) : null}
        </div>

        <div className="nss-event-card-footer">
          <span className="nss-event-footer-text">EXPLORE EVENT</span>
          <Link
            to={eventLink}
            className="nss-event-arrow"
            aria-label={`Explore ${event.title}`}
          >
            <ArrowRight size={19} />
          </Link>
        </div>
      </div>

      <div className="nss-event-bottom-text">NATIONAL SERVICE SCHEME</div>
    </article>
  );
}
