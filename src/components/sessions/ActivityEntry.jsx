import React from "react";
import { formatTimeDisplay } from "../../services/sessionService";
import { Clock, MapPin, Users, ArrowUpRight } from "lucide-react";

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function parseDate(dateStr) {
  if (!dateStr) return { day: "—", month: "—", weekday: "—" };
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return { day: dateStr, month: "", weekday: "" };
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = parts[2];
  const month = MONTH_NAMES[parts[1] - 1] || "SEP";
  const weekday = d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
  return { day, month, weekday };
}

function getCategoryText(item) {
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
 * ActivityEntry — High-end horizontal programme ledger entry.
 *
 * Props:
 *  activity {Object}
 *  onSelectActivity {function}
 */
export default function ActivityEntry({ activity, onSelectActivity }) {
  const dateInfo = parseDate(activity.date || activity.dateStr);
  const categoryText = getCategoryText(activity);
  const isMonthly = activity.type === "monthly_event" || activity.eventType === "monthly";
  const startTime = activity.startTime ? formatTimeDisplay(activity.startTime) : "";
  const endTime = activity.endTime ? formatTimeDisplay(activity.endTime) : "";

  return (
    <article
      className="ledger-activity-row"
      onClick={() => onSelectActivity(activity)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectActivity(activity);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${activity.title}`}
    >
      {/* 1. Date Anchor Column */}
      <div className="ledger-date-column">
        <span className="ledger-day-num">{dateInfo.day}</span>
        <div className="ledger-date-sub">
          <span className="ledger-month-text">{dateInfo.month}</span>
          <span className="ledger-weekday-text">{dateInfo.weekday}</span>
        </div>
      </div>

      {/* 2. Main Programme Info Column */}
      <div className="ledger-info-column">
        {/* Category Pill Tag */}
        <div className="ledger-category-line">
          <span className="category-accent-bullet" aria-hidden="true" />
          <span className="category-text-label">{categoryText}</span>
        </div>

        {/* Title */}
        <h3 className="ledger-title-serif">{activity.title}</h3>

        {/* Subtitle / Parent context */}
        {activity.parentEventTitle && !isMonthly && (
          <p className="ledger-parent-context">
            Part of <strong className="text-slate-900 font-semibold">{activity.parentEventTitle}</strong>
          </p>
        )}

        {isMonthly && (
          <p className="ledger-parent-context text-amber-800 font-medium">
            Monthly NSS scheduled split-up programme
          </p>
        )}

        {activity.description && !activity.parentEventTitle && (
          <p className="ledger-desc-preview line-clamp-1">{activity.description}</p>
        )}

        {/* Metadata Specs Line */}
        <div className="ledger-meta-line">
          {activity.location && (
            <span className="ledger-meta-chip">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{activity.location}</span>
            </span>
          )}

          {startTime && (
            <span className="ledger-meta-chip">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{startTime}{endTime ? ` — ${endTime}` : ""}</span>
            </span>
          )}

          {Array.isArray(activity.units) && activity.units.length > 0 && (
            <span className="ledger-meta-chip units-chip">
              <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Units: {isMonthly && activity.units.length === 7
                  ? "All (1–7)"
                  : activity.units.join(" · ")}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Action Trigger Column */}
      <div className="ledger-action-column">
        <span className="ledger-action-label">VIEW DETAILS</span>
        <div className="ledger-arrow-badge">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
}
