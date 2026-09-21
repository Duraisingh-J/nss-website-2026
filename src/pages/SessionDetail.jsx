import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../components/Footer";
import LightboxModal from "../components/ui/LightboxModal";
import { getPublicEventDetail } from "../services/eventService";
import {
  Calendar,
  Clock,
  MapPin,
  Layers,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Share2,
  CheckCircle2,
  Image as ImageIcon,
  UserCheck
} from "lucide-react";
import "./SessionDetail.css";

export default function SessionDetail() {
  const { eventId, sessionId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    async function loadData() {
      setLoading(true);
      try {
        const dbEvent = await getPublicEventDetail(eventId);
        if (dbEvent && Array.isArray(dbEvent.sessions)) {
          const matchedSession =
            dbEvent.sessions.find(
              (s) => s.id === (sessionId || eventId) || s.slug === (sessionId || eventId)
            ) || dbEvent.sessions[0];
          if (matchedSession) {
            setData({ event: dbEvent, session: matchedSession });
            return;
          }
        }
      } catch (err) {
        console.warn("DB session lookup error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, sessionId]);

  if (loading) {
    return (
      <div className="page-wrapper nss-session-detail-page">
        <div className="session-loading-box">
          <div className="session-spinner" />
          <p>Loading session information…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data || !data.session) {
    return (
      <div className="page-wrapper nss-session-detail-page">
        <div className="py-24 px-4 text-center max-w-lg mx-auto space-y-4">
          <h2 className="text-2xl font-bold font-editorial text-slate-900">Session Not Found</h2>
          <p className="text-sm text-slate-600">The requested session could not be found or has not been scheduled yet.</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Events Directory</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { event, session } = data;
  const sessionsList = event.sessions || [];
  const currentIdx = sessionsList.findIndex((s) => s.id === session.id || s.slug === session.slug);
  const prevSession = currentIdx > 0 ? sessionsList[currentIdx - 1] : null;
  const nextSession = currentIdx >= 0 && currentIdx < sessionsList.length - 1 ? sessionsList[currentIdx + 1] : null;

  const gallery =
    session.gallery && session.gallery.length > 0
      ? session.gallery
      : Array.isArray(session.photos) && session.photos.length > 0
      ? session.photos.map((p) => ({
          url: p.publicUrl || p.url,
          caption: p.caption || p.alt_text || session.title,
        }))
      : [];

  const coverUrl =
    session.coverImage ||
    session.coverImageUrl ||
    session.image_url ||
    (gallery.length > 0 ? gallery[0].url : null);

  const hasCover = Boolean(coverUrl);

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function openLightbox(idx) {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }

  return (
    <div className="page-wrapper nss-session-detail-page">
      {/* 1. Subtle Contextual Breadcrumbs */}
      <nav className="session-breadcrumbs" aria-label="Breadcrumb">
        <div className="session-container">
          <div className="session-breadcrumb-row">
            <Link to="/events" className="breadcrumb-nav-item">
              Events
            </Link>
            <ChevronRight className="w-3.5 h-3.5 breadcrumb-caret" />
            <Link to={`/events/${event.slug || event.id}`} className="breadcrumb-nav-item">
              {event.title}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 breadcrumb-caret" />
            <span className="breadcrumb-nav-active" aria-current="page">
              {session.title}
            </span>
          </div>
        </div>
      </nav>

      {/* 2. Session Hero */}
      <header className="session-hero" aria-label="Session Heading">
        <div className="session-container">
          {/* Top Parent Tag & Share Action */}
          <div className="session-hero-kicker-row">
            <Link to={`/events/${event.slug || event.id}`} className="parent-event-badge">
              <span className="badge-dash" />
              <span>Part of {event.title}</span>
            </Link>

            <button
              type="button"
              className="session-share-btn"
              onClick={handleShare}
              title="Copy session link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>
          </div>

          {/* Main Dominant Title */}
          <h1 className="session-hero-title font-editorial">
            {session.title}
          </h1>

          {/* Primary Quick Info Line */}
          <div className="session-hero-meta-line">
            <span className="session-meta-tag">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>{session.dateDisplay || session.date}</span>
            </span>
            <span className="session-meta-sep">·</span>
            <span className="session-meta-tag">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{session.timeDisplay}</span>
            </span>
            <span className="session-meta-sep">·</span>
            <span className="session-meta-tag">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{session.location}</span>
            </span>
          </div>

          {/* Large Visual Cover (when available) */}
          {hasCover && (
            <div className="session-cover-wrap">
              <img
                src={coverUrl}
                alt={session.title}
                className="session-cover-img"
              />
              <div className="session-cover-badge">
                <span>{session.dayLabel || "Activity Session"}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 3. Session Structured Information Grid */}
      <section className="session-specs-section" aria-label="Session Specifications">
        <div className="session-container">
          <div className="session-specs-grid">
            <div className="spec-item-box">
              <span className="spec-label">DATE & DAY</span>
              <p className="spec-value">{session.dateDisplay || session.date}</p>
              <span className="spec-sub">{session.dayLabel || "Session"}</span>
            </div>

            <div className="spec-item-box">
              <span className="spec-label">TIME & DURATION</span>
              <p className="spec-value">{session.timeDisplay}</p>
              <span className="spec-sub">Active Duty</span>
            </div>

            <div className="spec-item-box">
              <span className="spec-label">PARTICIPATING UNITS</span>
              <p className="spec-value">
                {Array.isArray(session.units) ? `Units ${session.units.join(" · ")}` : "All Units"}
              </p>
              <span className="spec-sub">{session.participants || 100} Volunteers</span>
            </div>

            <div className="spec-item-box spec-item-box--wide">
              <span className="spec-label">LOCATION & VENUE</span>
              <p className="spec-value">{session.location}</p>
              <span className="spec-sub">Fieldwork Site</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About the Session & Key Outcomes */}
      <section className="session-about-section" aria-label="Session Narrative">
        <div className="session-container">
          <div className="session-about-layout">
            {/* Left Narrative Column */}
            <div className="session-prose-column">
              <div className="section-kicker">
                <span className="kicker-dash" />
                <span className="kicker-label">ACTIVITY BRIEF</span>
              </div>
              <h2 className="session-section-heading font-editorial">
                About The Session
              </h2>

              <div className="session-prose-body">
                {Array.isArray(session.about) ? (
                  session.about.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <p>{session.shortDesc}</p>
                )}
              </div>
            </div>

            {/* Right Outcomes Card */}
            {session.outcomes && session.outcomes.length > 0 && (
              <aside className="session-outcomes-card" aria-label="Key Outcomes and Achievements">
                <div className="outcomes-header">
                  <UserCheck className="w-5 h-5 text-red-500" />
                  <h3 className="outcomes-title font-editorial">Session Outcomes</h3>
                </div>
                <ul className="outcomes-list">
                  {session.outcomes.map((item, idx) => (
                    <li key={idx} className="outcome-item">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* 5. Session Photography Gallery ("Moments from the Session") */}
      {gallery.length > 0 && (
        <section className="session-gallery-section" aria-label="Session Moments Gallery">
          <div className="session-container">
            <div className="gallery-header-block">
              <div className="section-kicker">
                <span className="kicker-dash" />
                <span className="kicker-label">PHOTOGRAPHY</span>
              </div>
              <h2 className="gallery-main-title font-editorial">
                Moments from the Session
              </h2>
              <p className="gallery-main-subtitle">
                Photographs recorded during the execution of {session.title}.
              </p>
            </div>

            <div className="session-photos-grid">
              {gallery.map((photo, pIdx) => (
                <div
                  key={pIdx}
                  className="session-photo-card"
                  onClick={() => openLightbox(pIdx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openLightbox(pIdx);
                    }
                  }}
                  aria-label={`View photo: ${photo.caption}`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || `Session photo ${pIdx + 1}`}
                    className="session-photo-img"
                    loading="lazy"
                  />
                  <div className="session-photo-overlay">
                    <p className="photo-caption-text">{photo.caption}</p>
                    <span className="photo-zoom-pill">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Contextual Navigation between Sessions & Parent Event */}
      <section className="session-carousel-nav-section" aria-label="Contextual session navigation">
        <div className="session-container">
          <div className="session-nav-card">
            {/* Previous Session */}
            <div className="session-nav-col prev-col">
              {prevSession ? (
                <Link
                  to={`/events/${event.slug || event.id}/sessions/${prevSession.slug || prevSession.id}`}
                  className="session-direction-link"
                >
                  <span className="direction-label">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>PREVIOUS SESSION</span>
                  </span>
                  <span className="direction-title font-editorial">{prevSession.title}</span>
                </Link>
              ) : (
                <div className="direction-disabled">
                  <span className="direction-label">FIRST ACTIVITY</span>
                  <span className="direction-title">Camp Inaugural</span>
                </div>
              )}
            </div>

            {/* Central Return to Event Hub */}
            <div className="session-nav-col center-col">
              <Link to={`/events/${event.slug || event.id}`} className="hub-back-btn">
                <Layers className="w-4 h-4" />
                <span>All Event Sessions ({sessionsList.length})</span>
              </Link>
            </div>

            {/* Next Session */}
            <div className="session-nav-col next-col">
              {nextSession ? (
                <Link
                  to={`/events/${event.slug || event.id}/sessions/${nextSession.slug || nextSession.id}`}
                  className="session-direction-link text-right"
                >
                  <span className="direction-label justify-end">
                    <span>NEXT SESSION</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="direction-title font-editorial">{nextSession.title}</span>
                </Link>
              ) : (
                <div className="direction-disabled text-right">
                  <span className="direction-label justify-end">FINAL ACTIVITY</span>
                  <span className="direction-title">Valedictory</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <LightboxModal
          images={gallery}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}

      <Footer />
    </div>
  );
}
