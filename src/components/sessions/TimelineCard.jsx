import React from "react";
import { formatTimeDisplay } from "../../services/sessionService";
import { Clock, MapPin, Users, Tag, ArrowRight } from "lucide-react";

/**
 * Format category badge label
 */
function getCategoryBadge(item) {
  if (item.type === "monthly_event" || item.eventType === "monthly") {
    return "MONTHLY EVENT";
  }
  const t = (item.eventType || "").toLowerCase();
  if (t === "camp") return "CAMP";
  if (t === "outreach") return "OUTREACH";
  if (t.includes("visit") || t.includes("orphanage")) return "ORPHANAGE VISIT";
  return (item.eventType || "ACTIVITY").toUpperCase();
}

/**
 * TimelineCard — Balanced editorial activity card (600–800px).
 *
 * Props:
 *  item {Object} Session or monthly event
 *  onSelectSession {function}
 */
export default function TimelineCard({ item, onSelectSession }) {
  const isMonthly = item.type === "monthly_event" || item.eventType === "monthly";
  const categoryBadge = getCategoryBadge(item);
  const startTime = item.startTime ? formatTimeDisplay(item.startTime) : "";
  const endTime = item.endTime ? formatTimeDisplay(item.endTime) : "";
  const hasCover = Boolean(item.coverImageUrl);

  return (
    <article
      className={`editorial-timeline-card ${isMonthly ? "timeline-card--monthly" : ""} ${hasCover ? "timeline-card--has-media" : ""}`}
      onClick={() => onSelectSession(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectSession(item);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${item.title}`}
    >
      {/* Optional Media Thumbnail */}
      {hasCover && (
        <div className="timeline-card-media">
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="timeline-card-img"
            loading="lazy"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="timeline-card-content">
        
        {/* Top Tag Row */}
        <div className="card-top-tag-row">
          <span className={`card-category-badge ${isMonthly ? "badge--monthly" : "badge--session"}`}>
            <Tag className="w-2.5 h-2.5 inline mr-1 opacity-70" />
            {categoryBadge}
          </span>

          {startTime && (
            <span className="card-time-tag">
              <Clock className="w-3 h-3 inline mr-1 text-slate-400" />
              {startTime}{endTime ? ` — ${endTime}` : ""}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="card-title-serif">{item.title}</h4>

        {/* Parent Event / Context */}
        {item.parentEventTitle && !isMonthly && (
          <p className="card-parent-line">
            Part of <strong className="text-slate-900">{item.parentEventTitle}</strong>
          </p>
        )}

        {isMonthly && (
          <p className="card-parent-line text-amber-800 font-medium">
            Monthly NSS scheduled split-up programme
          </p>
        )}

        {item.description && !item.parentEventTitle && (
          <p className="card-desc-line line-clamp-2">{item.description}</p>
        )}

        {/* Metadata Details Row */}
        <div className="card-meta-chips-row">
          {item.location && (
            <div className="meta-chip-item">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}

          {Array.isArray(item.units) && item.units.length > 0 && (
            <div className="meta-chip-item units-chip">
              <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Units: {isMonthly && item.units.length === 7
                  ? "All (1–7)"
                  : item.units.join(" · ")}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Action Line */}
        <div className="card-bottom-action-row">
          <span className="card-action-text">
            {isMonthly ? "Explore Event Details" : "Explore Session Details"}
          </span>
          <ArrowRight className="w-3.5 h-3.5 card-arrow-icon" />
        </div>

      </div>
    </article>
  );
}
