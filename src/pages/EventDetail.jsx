import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../components/Footer";
import LightboxModal from "../components/ui/LightboxModal";
import EventTimelineSessionCard from "../components/events/EventTimelineSessionCard";
import { getPublicEventDetail } from "../services/eventService";
import {
  Clock,
  Users,
  Layers,
  ArrowLeft,
  Share2,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import "./EventDetail.css";

export default function EventDetail() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
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
        if (dbEvent) {
          setEvent(dbEvent);
          return;
        }
      } catch (err) {
        console.warn("Event fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId]);

  if (loading) {
    return (
      <div className="page-wrapper nss-event-detail-page">
        <div className="event-loading-container">
          <div className="event-loading-spinner" />
          <p>Loading NSS Event details…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-wrapper nss-event-detail-page">
        <div className="py-24 px-4 text-center max-w-lg mx-auto space-y-4">
          <h2 className="text-2xl font-bold font-editorial text-slate-900">Event Not Found</h2>
          <p className="text-sm text-slate-600">The requested NSS event could not be found or has not been published yet.</p>
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

  const sessions = event.sessions || [];
  const gallery = event.gallery || [];

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
    <div className="page-wrapper nss-event-detail-page">
      {/* 1. Contextual Top Breadcrumb Bar */}
      <nav className="event-detail-breadcrumbs" aria-label="Breadcrumb">
        <div className="event-detail-container">
          <div className="breadcrumb-nav-row">
            <Link to="/events" className="breadcrumb-link breadcrumb-back">
              <ArrowLeft className="w-4 h-4" />
              <span>Events</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 breadcrumb-sep" />
            <span className="breadcrumb-current" aria-current="page">
              {event.title}
            </span>
          </div>
        </div>
      </nav>

      {/* 2. Large Editorial Event Hero */}
      <header className="event-detail-hero" aria-label="Event overview">
        <div className="event-detail-container">
          {/* Eyebrow & Actions */}
          <div className="event-hero-eyebrow-row">
            <div className="hero-kicker-group">
              <span className="hero-eyebrow-dash" />
              <span className="hero-kicker-text">NSS MIT · {event.categoryLabel.toUpperCase()}</span>
            </div>
            <button
              type="button"
              className="event-share-btn"
              onClick={handleShare}
              title="Copy event link"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? "Link Copied!" : "Share Event"}</span>
            </button>
          </div>

          {/* Main Title */}
          <h1 className="event-detail-title font-editorial">
            {event.title}
          </h1>

          {/* Tagline / Subtitle */}
          {event.tagline && (
            <p className="event-detail-tagline">
              {event.tagline}
            </p>
          )}

          {/* Key Stat Ribbon */}
          <div className="event-hero-stats-ribbon">
            <span className="stat-pill">
              <Clock className="w-4 h-4 text-red-500" />
              <strong>{event.durationDays || "1 Day"}</strong>
            </span>
            <span className="stat-sep">·</span>
            <span className="stat-pill">
              <Layers className="w-4 h-4 text-slate-400" />
              <strong>{event.totalSessions || sessions.length} Sessions</strong>
            </span>
            <span className="stat-sep">·</span>
            <span className="stat-pill">
              <Users className="w-4 h-4 text-slate-400" />
              <strong>{event.volunteersCount} Volunteers</strong>
            </span>
          </div>

          {/* Large Hero Visual Anchor */}
          {event.coverImage && (
            <div className="event-hero-cover-wrap">
              <img
                src={event.coverImage}
                alt={event.title}
                className="event-hero-cover-img"
              />
              <div className="event-hero-cover-caption">
                <span>NSS MIT Campus · Community Fieldwork Archive</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 3. Event Information Bar (Clean Scannable Data Grid) */}
      <section className="event-info-bar-section" aria-label="Event Quick Information">
        <div className="event-detail-container">
          <div className="event-info-grid">
            <div className="info-grid-card">
              <span className="info-card-label">DATE</span>
              <p className="info-card-value">{event.dateDisplay}</p>
            </div>

            <div className="info-grid-card">
              <span className="info-card-label">DURATION</span>
              <p className="info-card-value">{event.durationDays || "7 Days"}</p>
            </div>

            <div className="info-grid-card">
              <span className="info-card-label">SESSIONS</span>
              <p className="info-card-value">{event.totalSessions || sessions.length} Activities</p>
            </div>

            <div className="info-grid-card">
              <span className="info-card-label">VOLUNTEERS</span>
              <p className="info-card-value">{event.volunteersCount} Enrolled</p>
            </div>

            <div className="info-grid-card info-grid-card--wide">
              <span className="info-card-label">LOCATION</span>
              <p className="info-card-value">{event.location}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About the Event Narrative Section */}
      <section className="event-about-section" aria-label="About the event">
        <div className="event-detail-container">
          <div className="event-about-layout">
            {/* Left Narrative Column */}
            <div className="event-about-narrative">
              <div className="section-kicker">
                <span className="kicker-dash" />
                <span className="kicker-label">OVERVIEW</span>
              </div>
              <h2 className="event-about-heading font-editorial">
                About This Event
              </h2>

              <div className="event-about-prose">
                {Array.isArray(event.about) ? (
                  event.about.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))
                ) : (
                  <p>{event.shortDesc}</p>
                )}
              </div>
            </div>

            {/* Right Highlights & Objectives Card */}
            {event.highlights && event.highlights.length > 0 && (
              <aside className="event-about-highlights-card" aria-label="Key Outcomes">
                <div className="highlights-header">
                  <Sparkles className="w-5 h-5 text-red-500" />
                  <h3 className="highlights-title font-editorial">Key Highlights</h3>
                </div>
                <ul className="highlights-list">
                  {event.highlights.map((hl, hlIdx) => (
                    <li key={hlIdx} className="highlight-item">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* 5. SESSIONS & ACTIVITIES (Centerpiece Timeline / Structured Cards) */}
      <section className="event-sessions-section" id="sessions-timeline" aria-label="Sessions and Activities">
        <div className="event-detail-container">
          <div className="sessions-section-header">
            <div className="section-kicker">
              <span className="kicker-dash" />
              <span className="kicker-label">PROGRAMME TIMELINE</span>
            </div>
            <h2 className="sessions-section-title font-editorial">
              Sessions & Activities
            </h2>
            <p className="sessions-section-subtitle">
              Explore the activities and sessions conducted as part of this event.
            </p>
          </div>

          {/* Timeline List of Session Cards */}
          <div className="sessions-timeline-container">
            {sessions.map((session, sIdx) => (
              <div key={session.id || sIdx} className="timeline-step-wrap">
                {/* Timeline Axis Marker */}
                <div className="timeline-axis">
                  <div className="timeline-node" />
                  {sIdx < sessions.length - 1 && <div className="timeline-line" />}
                </div>

                {/* Session Card */}
                <div className="timeline-content-card">
                  <EventTimelineSessionCard
                    session={session}
                    eventId={event.id}
                    eventSlug={event.slug}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Event Overall Gallery */}
      {gallery.length > 0 && (
        <section className="event-gallery-section" aria-label="Event Photography Gallery">
          <div className="event-detail-container">
            <div className="gallery-section-header">
              <div className="section-kicker">
                <span className="kicker-dash" />
                <span className="kicker-label">PHOTO ARCHIVE</span>
              </div>
              <h2 className="gallery-section-title font-editorial">
                Event Gallery
              </h2>
              <p className="gallery-section-subtitle">
                Photographs capturing key moments and volunteer fellowship across {event.title}.
              </p>
            </div>

            <div className="event-masonry-gallery">
              {gallery.map((imgItem, gIdx) => (
                <div
                  key={gIdx}
                  className={`gallery-item-card ${imgItem.aspect === "wide" ? "aspect-wide" : imgItem.aspect === "tall" ? "aspect-tall" : ""}`}
                  onClick={() => openLightbox(gIdx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openLightbox(gIdx);
                    }
                  }}
                  aria-label={`View photo ${gIdx + 1}: ${imgItem.caption}`}
                >
                  <img
                    src={imgItem.url}
                    alt={imgItem.caption || `Event photo ${gIdx + 1}`}
                    className="gallery-item-img"
                    loading="lazy"
                  />
                  <div className="gallery-item-overlay">
                    <span className="gallery-overlay-caption">{imgItem.caption}</span>
                    <span className="gallery-zoom-icon">
                      <ImageIcon className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Bottom Return Navigation */}
      <div className="event-bottom-nav">
        <div className="event-detail-container">
          <Link to="/events" className="event-back-btn">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <LightboxModal
          images={gallery}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}

      <Footer />
    </div>
  );
}
