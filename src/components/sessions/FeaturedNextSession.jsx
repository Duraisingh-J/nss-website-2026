import React from "react";
import { formatTimeDisplay } from "../../services/sessionService";
import { ArrowRight, Clock, MapPin, Users } from "lucide-react";

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function parseDateDetails(dateStr) {
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

function getCategoryLabel(item) {
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
 * FeaturedNextSession — Editorial Deep Navy Centerpiece Showcase
 *
 * Displays the single next imminent session with strong date typography,
 * serif title, concise metadata, and typographic poster fallback (no logo placeholder).
 */
export default function FeaturedNextSession({ session, onSelectSession }) {
  if (!session) return null;

  const dateInfo = parseDateDetails(session.date || session.session_date);
  const categoryLabel = getCategoryLabel(session);
  const startTime = session.startTime ? formatTimeDisplay(session.startTime) : "10:00 AM";
  const endTime = session.endTime ? formatTimeDisplay(session.endTime) : "11:30 AM";
  const timeDisplay = `${startTime}${endTime ? ` — ${endTime}` : ""}`;
  const location = session.location || "NSS Auditorium";
  const unitsDisplay = Array.isArray(session.units) && session.units.length > 0
    ? `Units ${session.units.join(" · ")}`
    : "All Units";

  // Check if real session image exists
  const hasRealImage = Boolean(
    session.coverImageUrl ||
    session.coverImage ||
    session.image_url ||
    (session.rawData && session.rawData.cover_image_url) ||
    (Array.isArray(session.photos) && session.photos.length > 0 && session.photos[0]?.publicUrl) ||
    (Array.isArray(session.gallery) && session.gallery.length > 0 && session.gallery[0]?.url)
  );
  const imageUrl =
    session.coverImageUrl ||
    session.coverImage ||
    session.image_url ||
    session.rawData?.cover_image_url ||
    (Array.isArray(session.photos) && session.photos.length > 0 ? session.photos[0]?.publicUrl : null) ||
    (Array.isArray(session.gallery) && session.gallery.length > 0 ? session.gallery[0]?.url : null);

  return (
    <section className="featured-session-wrapper" aria-label="Next Featured Session">
      <div className="featured-session-card" onClick={() => onSelectSession && onSelectSession(session)}>
        
        {/* Visual / Typographic Column */}
        <div className="featured-session-visual">
          {hasRealImage ? (
            <div className="featured-session-image-wrap">
              <img
                src={imageUrl}
                alt={session.title}
                className="featured-session-img"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="featured-typographic-poster" aria-hidden="true">
              <span className="poster-category">{categoryLabel}</span>
              <h3 className="poster-title font-editorial">{session.title}</h3>
              <p className="poster-date">
                {dateInfo.day} {dateInfo.month} {dateInfo.year}
              </p>
            </div>
          )}
        </div>

        {/* Content & Metadata Column */}
        <div className="featured-session-content">
          <div className="featured-kicker">NEXT SESSION</div>

          <div className="featured-date-row">
            <div className="featured-date-block">
              <span className="featured-date-num font-editorial">{dateInfo.day}</span>
              <div className="featured-date-sub">
                <span className="featured-date-month">{dateInfo.month}</span>
                <span className="featured-date-weekday">{dateInfo.weekday}</span>
              </div>
            </div>
          </div>

          <h2 className="featured-session-title font-editorial">
            {session.title}
          </h2>

          {session.parentEventTitle ? (
            <p className="featured-session-parent">
              Part of {session.parentEventTitle}
            </p>
          ) : session.type === "monthly_event" ? (
            <p className="featured-session-parent">
              Monthly All-Unit Assembly
            </p>
          ) : null}

          {/* Clean Metadata Line */}
          <div className="featured-meta-list">
            <span className="featured-meta-item">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeDisplay}</span>
            </span>
            <span className="featured-meta-dot">·</span>
            <span className="featured-meta-item">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{location}</span>
            </span>
            <span className="featured-meta-dot">·</span>
            <span className="featured-meta-item">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{unitsDisplay}</span>
            </span>
          </div>

          {/* Subtle Action Link */}
          <div className="featured-action-row">
            <button
              type="button"
              className="featured-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSession && onSelectSession(session);
              }}
            >
              <span>Explore Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
