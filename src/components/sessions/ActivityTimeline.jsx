import React from "react";
import TimelineCard from "./TimelineCard";
import { Calendar, Filter, X } from "lucide-react";

/**
 * ActivityTimeline — Vertical editorial activity timeline.
 *
 * Props:
 *  dateGroups {Array} Grouped dates with items
 *  activeCategory {string}
 *  onResetFilters {function}
 *  onSelectSession {function}
 *  viewMode {string}
 */
export default function ActivityTimeline({
  dateGroups = [],
  activeCategory,
  onResetFilters,
  onSelectSession,
  viewMode = "upcoming",
}) {
  return (
    <section className="activity-timeline-section" aria-label="NSS Scheduled Activity Timeline">
      
      {/* Section Header */}
      <div className="timeline-intro-header">
        <div className="intro-header-left">
          <h3 className="intro-title">
            {viewMode === "upcoming" ? "UPCOMING ACTIVITIES" : "ALL ACTIVITIES"}
          </h3>
          <p className="intro-subtitle">
            A closer look at what's happening across NSS programmes and community units.
          </p>
        </div>

        {activeCategory !== "all" && (
          <div className="active-category-chip">
            <Filter className="w-3 h-3 text-accent" />
            <span>Category: <strong className="uppercase">{activeCategory}</strong></span>
            <button
              type="button"
              className="chip-remove-btn"
              onClick={onResetFilters}
              title="Clear category filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {dateGroups.length === 0 ? (
        <div className="timeline-empty-card">
          <div className="empty-icon-circle">
            <Calendar className="w-7 h-7 text-slate-400" />
          </div>
          <h4 className="empty-heading">NO UPCOMING ACTIVITIES</h4>
          <p className="empty-subtext">
            There are currently no sessions scheduled in this category.
          </p>
          <div className="empty-btn-wrap">
            <button
              type="button"
              className="empty-reset-btn"
              onClick={onResetFilters}
            >
              VIEW ALL ACTIVITIES
            </button>
          </div>
        </div>
      ) : (
        /* Vertical Editorial Timeline Feed */
        <div className="timeline-feed-wrap" role="feed" aria-label="Chronological Activity Timeline">
          {dateGroups.map((group, groupIdx) => (
            <div
              key={group.dateKey}
              className={`timeline-date-row ${group.isPast ? "timeline-date-row--past" : ""} ${group.isToday ? "timeline-date-row--today" : ""}`}
            >
              {/* Left: Distinctive Date Marker */}
              <div className="timeline-date-anchor-col">
                <div className="date-anchor-box">
                  <span className="date-day-num">{group.dayNum}</span>
                  <span className="date-month-abbr">{group.monthAbbr}</span>
                  <span className="date-weekday-name">{group.weekday}</span>
                  {group.isToday && <span className="date-today-badge">TODAY</span>}
                </div>
              </div>

              {/* Middle: Spine Track Line & Accent Node */}
              <div className="timeline-spine-col" aria-hidden="true">
                <div className={`timeline-spine-node ${group.isToday ? "timeline-spine-node--today" : ""}`} />
                {groupIdx < dateGroups.length - 1 && <div className="timeline-spine-line" />}
              </div>

              {/* Right: Activity Cards Flow */}
              <div className="timeline-cards-col">
                {group.items.map((item) => (
                  <TimelineCard
                    key={item.id}
                    item={item}
                    onSelectSession={onSelectSession}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
