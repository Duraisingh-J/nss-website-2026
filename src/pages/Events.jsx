import React, { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import LightboxModal from "../components/ui/LightboxModal";
import { EVENT_TYPE_DEFINITIONS } from "../data/mockEventsData";
import { getPublicEvents, getPublicEventDetail } from "../services/eventService";
import { getEventStatus, getSessionStatus, STATUS } from "../utils/timeStatusUtils";
import useLiveTime from "../hooks/useLiveTime";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock3, Images, MapPin, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "./Events.css";

const MONTHS = [
  ["01","JAN","January"],["02","FEB","February"],["03","MAR","March"],["04","APR","April"],
  ["05","MAY","May"],["06","JUN","June"],["07","JUL","July"],["08","AUG","August"],
  ["09","SEP","September"],["10","OCT","October"],["11","NOV","November"],["12","DEC","December"],
];

const typeMatches = (event, type) => {
  const value = String(event?.event_type || "").toLowerCase();
  if (type === "camp") return value === "camp";
  if (type === "outreach") return value === "outreach" || value === "drive";
  if (type === "orphanage") return value === "orphanage" || value === "orphanage visit" || value === "visit";
  if (type === "monthly") return value === "monthly" || value === "monthly event" || value === "event" || value === "other";
  return value === type;
};

const formatDate = (value) => {
  if (!value) return "Date to be announced";
  const parts = String(value).split("T")[0].split("-");
  if (parts.length !== 3) return value;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

const formatTime = (value) => {
  if (!value) return "";
  const [h,m] = String(value).split(":").map(Number);
  if (Number.isNaN(h)) return value;
  const d = new Date(2020,0,1,h,m || 0);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

const statusLabel = (status) => status === STATUS.ONGOING ? "Live now" : status === STATUS.COMPLETED ? "Completed" : "Upcoming";

function StatusPill({ status, dark = false }) {
  return <span className={`events-status events-status--${status.toLowerCase()} ${dark ? "events-status--dark" : ""}`}>
    {status === STATUS.ONGOING && <i className="events-live-dot" />}
    {statusLabel(status)}
  </span>;
}

function TypePanel({ type, count, active, onClick }) {
  return (
    <motion.button
      type="button"
      className={`event-type-panel ${active ? "event-type-panel--active" : ""}`}
      onClick={onClick}
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <img src={type.coverImage} alt="" className="event-type-panel__image" />
      <div className="event-type-panel__veil" />
      <div className="event-type-panel__index">0{EVENT_TYPE_DEFINITIONS.indexOf(type) + 1}</div>
      <div className="event-type-panel__body">
        <div className="event-type-panel__eyebrow">{type.isMonthlyType ? "CHRONOLOGICAL ARCHIVE" : "EVENT COLLECTION"}</div>
        <h2>{type.title}</h2>
        <p>{type.excerpt || type.shortDesc}</p>
        <div className="event-type-panel__footer">
          <span>{count} {count === 1 ? "event" : "events"}</span>
          <span className="event-type-panel__arrow"><ArrowRight size={17} /></span>
        </div>
      </div>
    </motion.button>
  );
}

function EventRow({ event, onOpen, now }) {
  const status = getEventStatus(event, now);
  const sessions = Array.isArray(event.sessions) ? event.sessions : [];
  const firstImage = event.coverImage || event.cover_image_url;
  return (
    <motion.button type="button" className="event-row" onClick={() => onOpen(event)} layout whileHover={{ y: -2 }}>
      <div className="event-row__date">
        <span>{formatDate(event.start_date).split(" ")[0]}</span>
        <small>{formatDate(event.start_date).split(" ").slice(1).join(" ")}</small>
      </div>
      <div className="event-row__image-wrap">
        {firstImage ? <img src={firstImage} alt="" className="event-row__image" loading="lazy" /> : <div className="event-row__image event-row__image--empty" />}
      </div>
      <div className="event-row__content">
        <div className="event-row__meta"><StatusPill status={status} /><span>{sessions.length} {sessions.length === 1 ? "session" : "sessions"}</span></div>
        <h3>{event.title}</h3>
        <p>{event.shortDesc || event.description || "NSS service activity."}</p>
      </div>
      <span className="event-row__cta"><ChevronRight size={20} /></span>
    </motion.button>
  );
}

function SessionTimeline({ sessions, now }) {
  if (!sessions?.length) return <div className="events-empty-sessions">Sessions for this event will appear here once published.</div>;
  return (
    <div className="session-timeline">
      {sessions.map((session, index) => {
        const status = getSessionStatus(session, now);
        return (
          <div className={`session-line ${status === STATUS.ONGOING ? "session-line--live" : ""}`} key={session.id || index}>
            <div className="session-line__rail"><span>{String(index + 1).padStart(2,"0")}</span><i /></div>
            <div className="session-line__body">
              <div className="session-line__top"><span>{formatDate(session.session_date)}</span><StatusPill status={status} /></div>
              <h3>{session.title}</h3>
              {session.description && <p>{session.description}</p>}
              <div className="session-line__facts">
                <span><Clock3 size={14} />{formatTime(session.start_time)}{session.end_time ? ` — ${formatTime(session.end_time)}` : ""}</span>
                {session.location && <span><MapPin size={14} />{session.location}</span>}
                {session.units?.length > 0 && <span><Users size={14} />Units {session.units.join(" · ")}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("types");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open:false, images:[], index:0 });
  const { now } = useLiveTime(events);

  useEffect(() => {
    let mounted = true;
    getPublicEvents().then((data) => mounted && setEvents(data || [])).catch((error) => console.warn("Could not load events:", error)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [view, selectedType, selectedMonth, selectedEvent]);

  const counts = useMemo(() => Object.fromEntries(EVENT_TYPE_DEFINITIONS.map(type => [type.id, events.filter(event => typeMatches(event, type.id)).length])), [events]);
  const selectedEvents = useMemo(() => selectedType ? events.filter(event => typeMatches(event, selectedType.id)) : [], [events, selectedType]);

  const months = useMemo(() => {
    if (!selectedType?.isMonthlyType) return [];
    const grouped = {};
    events.filter(event => typeMatches(event, "monthly")).forEach(event => {
      const key = String(event.start_date || "").slice(0,7);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });
    return grouped;
  }, [events, selectedType]);

  const monthEvents = selectedMonth ? (months[selectedMonth] || []) : [];

  const openEvent = async (event) => {
    setSelectedEvent(event);
    setView("event");
    if (!event?.id) return;
    try {
      const detail = await getPublicEventDetail(event.id);
      if (detail) setSelectedEvent(prev => ({ ...prev, ...detail, sessions: detail.sessions || prev.sessions || [] }));
    } catch (error) {
      console.warn("Could not load event detail:", error);
    }
  };

  const chooseType = (type) => {
    setSelectedType(type);
    setSelectedMonth(null);
    setSelectedEvent(null);
    setView(type.isMonthlyType ? "months" : "collection");
  };

  const back = () => {
    if (view === "event") {
      setSelectedEvent(null);
      setView(selectedType?.isMonthlyType && selectedMonth ? "month-events" : selectedType?.isMonthlyType ? "months" : "collection");
    } else if (view === "month-events") {
      setSelectedMonth(null);
      setView("months");
    } else {
      setSelectedType(null);
      setSelectedMonth(null);
      setView("types");
    }
  };

  const openGallery = (images) => images?.length && setLightbox({ open:true, images, index:0 });

  return (
    <div className="events-page">
      <AnimatePresence mode="wait">
        {view === "types" && (
          <motion.header className="events-hero" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <div className="events-shell">
              <div className="events-hero__eyebrow"><span /> NSS MIT / EVENTS</div>
              <h1>Service, seen<br /><em>through action.</em></h1>
              <p>Every NSS activity becomes part of a larger story — organised by what we do, when we do it, and the sessions that bring each event to life.</p>
              <div className="events-hero__rule"><span>01</span><i /><span>EXPLORE THE ARCHIVE</span></div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <main className="events-main">
        <div className="events-shell">
          {view !== "types" && (
            <div className="events-context">
              <button type="button" className="events-back" onClick={back}><ArrowLeft size={16} /> All Event Types</button>
              <div>
                <span>{view === "event" ? "EVENT" : selectedType?.isMonthlyType ? "MONTHLY ARCHIVE" : "EVENT COLLECTION"}</span>
                <h1>{view === "event" ? selectedEvent?.title : view === "month-events" ? formatMonthTitle(selectedMonth) : selectedType?.title}</h1>
              </div>
            </div>
          )}

          {view === "types" && (
            <section className="event-types" aria-label="Event Types">
              <div className="events-section-heading"><span>01 / COLLECTIONS</span><h2>Choose how you want to explore.</h2><p>Four ways to read the NSS archive. Select a collection to move from the overview into its events.</p></div>
              <div className="event-types-grid">
                {EVENT_TYPE_DEFINITIONS.map(type => <TypePanel key={type.id} type={type} count={counts[type.id] || 0} onClick={() => chooseType(type)} />)}
              </div>
            </section>
          )}

          {view === "collection" && (
            <section className="events-collection">
              <div className="events-collection__intro"><div><span>COLLECTION / {String(selectedType?.id || "").toUpperCase()}</span><h2>{selectedType?.tagline || selectedType?.shortDesc}</h2></div><strong>{selectedEvents.length}<small>EVENTS</small></strong></div>
              <div className="events-list">
                {loading ? <LoadingRows /> : selectedEvents.length ? selectedEvents.map(event => <EventRow key={event.id} event={event} onOpen={openEvent} now={now} />) : <EmptyState text="No published events in this collection yet." />}
              </div>
            </section>
          )}

          {view === "months" && (
            <section className="months-view">
              <div className="events-section-heading"><span>MONTHLY / CHRONOLOGY</span><h2>Find the month. Then the event.</h2><p>The month is a navigation layer — each event inside it still contains its own sessions.</p></div>
              <div className="months-grid">
                {MONTHS.map(([key,short,name]) => {
                  const monthKey = `${new Date().getFullYear()}-${key}`;
                  const list = months[monthKey] || [];
                  return <button key={key} type="button" className={`month-tile ${list.length ? "month-tile--filled" : ""}`} onClick={() => list.length && (setSelectedMonth(monthKey), setView("month-events"))}>
                    <span>{key}</span><b>{short}</b><small>{name}</small><em>{list.length ? `${list.length} ${list.length === 1 ? "event" : "events"}` : "No published events"}</em>
                  </button>;
                })}
              </div>
            </section>
          )}

          {view === "month-events" && (
            <section className="events-collection">
              <div className="events-collection__intro"><div><span>MONTH / {formatMonthTitle(selectedMonth)}</span><h2>Events recorded this month.</h2></div><strong>{monthEvents.length}<small>EVENTS</small></strong></div>
              <div className="events-list">{monthEvents.length ? monthEvents.map(event => <EventRow key={event.id} event={event} onOpen={openEvent} now={now} />) : <EmptyState text="No published events for this month." />}</div>
            </section>
          )}

          {view === "event" && selectedEvent && (
            <EventDetail event={selectedEvent} now={now} onBack={back} onGallery={openGallery} />
          )}
        </div>
      </main>

      <Footer />
      <LightboxModal
        isOpen={lightbox.open}
        images={lightbox.images}
        currentIndex={lightbox.index}
        onClose={() => setLightbox(v => ({ ...v, open:false }))}
        onNext={() => setLightbox(v => ({ ...v, index:(v.index + 1) % v.images.length }))}
        onPrev={() => setLightbox(v => ({ ...v, index:(v.index - 1 + v.images.length) % v.images.length }))}
      />
    </div>
  );
}

function EventDetail({ event, now, onBack, onGallery }) {
  const status = getEventStatus(event, now);
  const sessions = event.sessions || [];
  const gallery = event.gallery || event.photos || [];
  return (
    <motion.article className="event-detail" initial={{ opacity:0 }} animate={{ opacity:1 }}>
      <div className="event-detail__hero">
        {event.coverImage && <img src={event.coverImage} alt="" />}
        <div className="event-detail__hero-shade" />
        <div className="event-detail__hero-copy">
          <StatusPill status={status} dark />
          <span>{event.categoryLabel || "NSS EVENT"}</span>
          <h2>{event.title}</h2>
          <p>{event.description || event.shortDesc}</p>
        </div>
      </div>
      <div className="event-detail__facts">
        <Fact icon={<CalendarDays size={17}/>} label="DATE" value={event.dateDisplay || formatDate(event.start_date)} />
        <Fact icon={<Clock3 size={17}/>} label="STATUS" value={statusLabel(status)} />
        <Fact icon={<MapPin size={17}/>} label="LOCATION" value={event.location || sessions[0]?.location || "NSS MIT Campus"} />
        <Fact icon={<Users size={17}/>} label="SESSIONS" value={String(sessions.length)} />
      </div>
      <div className="event-detail__body">
        <div className="event-detail__heading"><span>EVENT ITINERARY</span><h2>One event.<br /><em>Multiple moments.</em></h2></div>
        <SessionTimeline sessions={sessions} now={now} />
        {gallery.length > 0 && (
          <section className="event-gallery">
            <div className="event-gallery__heading"><span>DOCUMENTATION</span><h2>From the archive</h2></div>
            <div className="event-gallery__grid">{gallery.slice(0,8).map((image,index) => <button type="button" key={image.id || index} onClick={() => onGallery(gallery)}><img src={image.url} alt={image.alt || image.caption || event.title} loading="lazy" /></button>)}</div>
          </section>
        )}
      </div>
      <button type="button" className="events-detail-back" onClick={onBack}><ArrowLeft size={16}/> Back to events</button>
    </motion.article>
  );
}

function Fact({ icon, label, value }) {
  return <div className="event-fact"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>;
}
function LoadingRows() { return <div className="events-loading">{[1,2,3].map(i => <div key={i} />)}</div>; }
function EmptyState({ text }) { return <div className="events-empty">{text}</div>; }
function formatMonthTitle(value) {
  if (!value) return "Month";
  const [year,month] = value.split("-");
  const found = MONTHS.find(item => item[0] === month);
  return found ? `${found[2]} ${year}` : value;
}
