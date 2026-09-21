import React, { useEffect, useState } from "react";
import { formatTimeDisplay } from "../../services/sessionService";
import { getGoogleCalendarUrl, downloadIcsFile } from "../../utils/calendarUtils";
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  X,
  CheckCircle2,
  ExternalLink,
  Download,
  Share2,
  Check,
  Navigation,
  Image as ImageIcon,
} from "lucide-react";

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
 * SessionDetailModal — Glassmorphic modern detail modal with Google Calendar & Directions.
 */
export default function SessionDetailModal({ session, onClose }) {
  const [copied, setCopied] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!session) return null;

  const dateStr = session.date || session.dateStr;
  const isMonthly = session.type === "monthly_event" || session.eventType === "monthly";
  const startTime = session.startTime ? formatTimeDisplay(session.startTime) : "TBA";
  const endTime = session.endTime ? ` — ${formatTimeDisplay(session.endTime)}` : "";
  const categoryBadge = getCategoryBadge(session);
  const locationName = session.location || "NSS MIT Campus, Chromepet";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIcs = () => {
    downloadIcsFile({
      title: session.title,
      description: session.description,
      location: locationName,
      date: dateStr,
      startTime: session.startTime,
      endTime: session.endTime,
    });
  };

  const gCalUrl = getGoogleCalendarUrl({
    title: session.title,
    description: session.description,
    location: locationName,
    date: dateStr,
    startTime: session.startTime,
    endTime: session.endTime,
  });

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    locationName.toLowerCase().includes("mit") ? locationName : `${locationName} Madras Institute of Technology Chennai`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Ambient Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isMonthly
                ? "bg-amber-100 text-amber-900 border border-amber-200"
                : "bg-red-100 text-red-900 border border-red-200"
            }`}>
              {categoryBadge}
            </span>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-600" />
              {dateStr}
            </span>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            onClick={onClose}
            aria-label="Close session details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Main Title */}
          <div>
            <h3 id="session-modal-title" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {session.title}
            </h3>

            {session.parentEventTitle && !isMonthly && (
              <div className="mt-2 text-sm text-slate-600">
                <span>Associated Event: </span>
                <strong className="text-slate-900 font-bold">{session.parentEventTitle}</strong>
              </div>
            )}
          </div>

          {/* Monthly Event Context Alert */}
          {isMonthly && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 block text-sm font-bold">All-Unit Monthly NSS Assembly</strong>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Scheduled general assembly attended by all seven active NSS volunteer units for collective review, orientation, and service directives.
                </p>
              </div>
            </div>
          )}

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Timing</span>
                <span className="text-sm font-bold text-slate-900">{startTime}{endTime}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Venue / Location</span>
                  <span className="text-sm font-bold text-slate-900 truncate block">{locationName}</span>
                </div>
              </div>
              
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shrink-0"
                title="Open in Google Maps"
              >
                <Navigation className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Attending Volunteer Units */}
          {Array.isArray(session.units) && session.units.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Participating Volunteer Units</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {isMonthly && session.units.length === 7 ? (
                  <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
                    All Volunteer Units (Unit 1, 2, 3, 4, 5, 6, 7)
                  </span>
                ) : (
                  session.units.map((u) => (
                    <span
                      key={u}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
                    >
                      Unit {u}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Overview & Schedule Agenda Description */}
          {session.description && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Session Agenda & Notes
              </span>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
                {session.description}
              </p>
            </div>
          )}

          {/* Session Photographs Gallery */}
          {Array.isArray(session.photos || session.gallery) && (session.photos || session.gallery).length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                  <span>Session Photographs ({(session.photos || session.gallery).length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Click to enlarge</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {(session.photos || session.gallery).map((photo, pIdx) => {
                  const photoUrl = photo.url || photo.publicUrl;
                  const photoCaption = photo.caption || photo.altText || session.title;
                  return (
                    <div
                      key={photo.id || pIdx}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                      onClick={() => setLightboxImg(photoUrl)}
                    >
                      <img
                        src={photoUrl}
                        alt={photoCaption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] text-white font-medium truncate">
                          {photoCaption}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <a
              href={gCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Calendar</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>.ics</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-amber-600" />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>

          <button
            type="button"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

      </div>

      {/* Lightbox Preview */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img
              src={lightboxImg}
              alt="Enlarged session photograph"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
