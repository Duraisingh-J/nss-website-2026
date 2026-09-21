import React, { useState } from "react";
import { formatTimeDisplay } from "../../services/sessionService";
import { Calendar, ArrowUpRight, MapPin, Clock, ArrowRight } from "lucide-react";

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function formatArchiveDate(dateStr) {
  if (!dateStr) return { formatted: "—", day: "—", month: "—", year: "—" };
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return { formatted: dateStr, day: "", month: "", year: "" };
  const month = MONTH_NAMES[parts[1] - 1] || "SEP";
  return {
    formatted: `${parts[2]} ${month} ${parts[0]}`,
    day: parts[2],
    month: month,
    year: parts[0],
  };
}

function getCategoryName(item) {
  if (item.type === "monthly_event" || item.eventType === "monthly") {
    return "MONTHLY";
  }
  const t = (item.eventType || "").toLowerCase();
  if (t === "camp") return "CAMP";
  if (t === "outreach") return "OUTREACH";
  if (t.includes("visit") || t.includes("orphanage")) return "ORPHANAGE";
  return (item.eventType || "ACTIVITY").toUpperCase();
}

/**
 * CompactArchive — Refined 3-column historical grid.
 *
 * Props:
 *  archiveItems {Array}
 *  onSelectActivity {function}
 */
export default function CompactArchive({ archiveItems = [], onSelectActivity }) {
  const [displayCount, setDisplayCount] = useState(6);

  if (archiveItems.length === 0) return null;

  const visibleItems = archiveItems.slice(0, displayCount);
  const hasMore = archiveItems.length > displayCount;

  return (
    <section className="compact-archive-section" aria-label="NSS Historical Archive">
      
      {/* Archive Header */}
      <div className="compact-archive-header">
        <div>
          <div className="archive-kicker-line">
            <span className="archive-kicker-dot" aria-hidden="true" />
            <span className="archive-kicker-text">HISTORICAL ARCHIVE</span>
          </div>
          <h3 className="compact-archive-title">Completed Activities</h3>
          <p className="compact-archive-lead">
            A chronological record of past NSS camps, social service drives, and community outreach.
          </p>
        </div>
      </div>

      {/* Grid: 3-column on desktop */}
      <div className="compact-archive-grid">
        {visibleItems.map((item) => {
          const dateObj = formatArchiveDate(item.date || item.dateStr);
          const categoryName = getCategoryName(item);

          return (
            <article
              key={item.id}
              className="archive-card-box"
              onClick={() => onSelectActivity(item)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectActivity(item);
                }
              }}
              aria-label={`View archive details for ${item.title}`}
            >
              {/* Subtle Background Watermark Day */}
              <div className="archive-box-watermark" aria-hidden="true">
                {dateObj.day}
              </div>

              <div className="archive-box-header">
                <div className="archive-date-tag">
                  <Calendar className="w-3.5 h-3.5 text-accent inline mr-1" />
                  <span>{dateObj.formatted}</span>
                </div>
                <span className="archive-box-category">{categoryName}</span>
              </div>

              <div className="archive-box-body">
                <h4 className="archive-box-title">{item.title}</h4>
                {item.parentEventTitle && (
                  <p className="archive-box-parent">Part of {item.parentEventTitle}</p>
                )}
              </div>

              <div className="archive-box-footer">
                <div className="archive-box-meta">
                  {item.location && (
                    <span className="box-meta-point">
                      <MapPin className="w-3 h-3 text-slate-400 inline mr-1" />
                      <span className="truncate max-w-[120px]">{item.location}</span>
                    </span>
                  )}
                  {item.startTime && (
                    <span className="box-meta-point">
                      <Clock className="w-3 h-3 text-slate-400 inline mr-1" />
                      <span>{formatTimeDisplay(item.startTime)}</span>
                    </span>
                  )}
                </div>
                <div className="archive-box-action">
                  <span className="action-text">Details</span>
                  <div className="archive-arrow-icon">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Show More */}
      {hasMore && (
        <div className="archive-more-bar">
          <button
            type="button"
            className="archive-more-btn"
            onClick={() => setDisplayCount((prev) => prev + 6)}
          >
            <span>View More Archived Activities ({archiveItems.length - displayCount} remaining)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </section>
  );
}
