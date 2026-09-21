import React from "react";
import ActivityEntry from "./ActivityEntry";
import { Calendar, ArrowRight } from "lucide-react";

/**
 * ActivityStream — Editorial programme schedule stream.
 *
 * Props:
 *  activities {Array} Activity items (excluding the featured one)
 *  viewMode {string} "upcoming" | "all"
 *  onSelectActivity {function}
 *  onResetFilters {function}
 */
export default function ActivityStream({
  activities = [],
  viewMode = "upcoming",
  onSelectActivity,
  onResetFilters,
}) {
  return (
    <section className="journal-stream-section" aria-label="NSS Programme Stream">
      
      {/* Stream Section Header */}
      <div className="stream-section-header">
        <div className="stream-header-text">
          <div className="stream-kicker-line">
            <span className="stream-kicker-dot" aria-hidden="true" />
            <span className="stream-kicker-text">ACTIVITY TIMELINE</span>
          </div>
          <h3 className="stream-section-title">
            {viewMode === "upcoming" ? "Upcoming Programmes" : "All Scheduled Activities"}
          </h3>
          <p className="stream-section-lead">
            A comprehensive schedule of NSS camps, social outreach drives, and student initiatives.
          </p>
        </div>

        <div className="stream-count-tag">
          <span>{activities.length} {activities.length === 1 ? "activity" : "activities"}</span>
        </div>
      </div>

      {/* Activities Ledger List or Empty State */}
      {activities.length === 0 ? (
        <div className="stream-empty-card">
          <div className="empty-icon-circle">
            <Calendar className="w-7 h-7 text-slate-400" />
          </div>
          <h4 className="empty-heading">No Activities Scheduled</h4>
          <p className="empty-description">
            There are currently no additional sessions listed in this category.
          </p>
          <div className="empty-action-wrap">
            <button
              type="button"
              className="empty-reset-link"
              onClick={onResetFilters}
            >
              <span>Explore All Activities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="journal-ledger-container" role="feed" aria-label="Activity schedule ledger">
          {activities.map((activity) => (
            <ActivityEntry
              key={activity.id}
              activity={activity}
              onSelectActivity={onSelectActivity}
            />
          ))}
        </div>
      )}

    </section>
  );
}
