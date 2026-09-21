import React from "react";
import { formatTimeDisplay } from "../../services/sessionService";
import { Clock, MapPin, Users, ArrowUpRight, Flame, Sparkles } from "lucide-react";

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function parseDateComponents(dateStr) {
  if (!dateStr) return { day: "—", month: "—", weekday: "—", year: "—" };
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return { day: dateStr, month: "", weekday: "", year: "" };
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = parts[2];
  const month = MONTH_NAMES[parts[1] - 1] || "SEP";
  const year = parts[0];
  const weekday = d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
  return { day, month, weekday, year };
}

/**
 * FeaturedActivity — Luxury magazine split centerpiece showcase.
 *
 * Props:
 *  activity {Object} Next/featured activity item
 *  isFuture {boolean} Whether this activity is upcoming
 *  onSelectActivity {function}
 */
export default function FeaturedActivity({ activity, isFuture = true, onSelectActivity }) {
  if (!activity) return null;

  const dateInfo = parseDateComponents(activity.dateStr || activity.date);
  const isMonthly = activity.type === "monthly_event" || activity.eventType === "monthly";
  const startTime = activity.startTime ? formatTimeDisplay(activity.startTime) : "10:00 AM";
  const endTime = activity.endTime ? formatTimeDisplay(activity.endTime) : "11:30 AM";
  const categoryLabel = (activity.eventType || (isMonthly ? "MONTHLY EVENT" : "SPECIAL CAMP")).toUpperCase();
  const hasImage = Boolean(activity.coverImageUrl);

  return (
    <section className="featured-showcase-section" aria-label="Featured NSS Activity">
      <div className="featured-showcase-card" onClick={() => onSelectActivity(activity)}>
        
        {/* Left Column: Visual Artwork / Typographic Editorial Composition */}
        <div className="featured-artwork-col">
          {hasImage ? (
            <div className="featured-cinematic-crop">
              <img
                src={activity.coverImageUrl}
                alt={activity.title}
                className="featured-photo"
                loading="lazy"
              />
              <div className="featured-photo-vignette" />
              {/* Floating Glass Date Stamp */}
              <div className="featured-glass-date">
                <span className="glass-date-num">{dateInfo.day}</span>
                <div className="glass-date-sub">
                  <span className="glass-date-month">{dateInfo.month}</span>
                  <span className="glass-date-weekday">{dateInfo.weekday}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="featured-editorial-poster" aria-hidden="true">
              <div className="poster-watermark-num">{dateInfo.day}</div>
              <div className="poster-content-stack">
                <span className="poster-kicker">{categoryLabel}</span>
                <h3 className="poster-display-heading">{activity.title}</h3>
                <div className="poster-footer-rule">
                  <span className="poster-date-text">{dateInfo.day} {dateInfo.month} {dateInfo.year}</span>
                  <span className="poster-red-bar" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Activity Details & Specs */}
        <div className="featured-details-col">
          
          {/* Top Line: Status Tag & Date Stamp */}
          <div className="featured-header-row">
            <div className="featured-status-pill">
              {isFuture ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-accent animate-pulse" />
                  <span>NEXT INITIATIVE</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>FEATURED ACTIVITY</span>
                </>
              )}
            </div>

            <div className="featured-date-badge">
              <span className="date-badge-day">{dateInfo.day}</span>
              <span className="date-badge-month">{dateInfo.month}</span>
              <span className="date-badge-dot">·</span>
              <span className="date-badge-dayname">{dateInfo.weekday}</span>
            </div>
          </div>

          {/* Heading & Attribution */}
          <div className="featured-title-group">
            <span className="featured-category-kicker">{categoryLabel}</span>
            <h2 className="featured-showcase-title">{activity.title}</h2>
            
            {activity.parentEventTitle ? (
              <p className="featured-attribution">
                Part of <strong className="text-white font-semibold">{activity.parentEventTitle}</strong>
              </p>
            ) : isMonthly ? (
              <p className="featured-attribution text-amber-300 font-medium">
                Monthly NSS scheduled split-up programme
              </p>
            ) : activity.description ? (
              <p className="featured-attribution line-clamp-2">
                {activity.description}
              </p>
            ) : null}
          </div>

          {/* Metadata Specs Cards */}
          <div className="featured-specs-matrix">
            <div className="spec-card-box">
              <div className="spec-icon-circle">
                <Clock className="w-3.5 h-3.5 text-accent" />
              </div>
              <div className="spec-content">
                <span className="spec-caption">TIME</span>
                <span className="spec-val">{startTime} — {endTime}</span>
              </div>
            </div>

            <div className="spec-card-box">
              <div className="spec-icon-circle">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="spec-content">
                <span className="spec-caption">LOCATION</span>
                <span className="spec-val">{activity.location || "NSS Auditorium"}</span>
              </div>
            </div>

            {Array.isArray(activity.units) && activity.units.length > 0 && (
              <div className="spec-card-box">
                <div className="spec-icon-circle">
                  <Users className="w-3.5 h-3.5 text-slate-300" />
                </div>
                <div className="spec-content">
                  <span className="spec-caption">UNITS</span>
                  <span className="spec-val">
                    {isMonthly && activity.units.length === 7
                      ? "All Units (1–7)"
                      : activity.units.join(" · ")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="featured-action-row">
            <button
              type="button"
              className="featured-magnetic-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelectActivity(activity);
              }}
            >
              <span>Explore Session Details</span>
              <div className="btn-arrow-circle">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
