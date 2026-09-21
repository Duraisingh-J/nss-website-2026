/**
 * Unified Events & Sessions Data Architecture for NSS MIT, Anna University
 * Follows Supabase Schema:
 *   - events (id, title, description, event_type, start_date, end_date, cover_media_id, is_published)
 *   - sessions (id, event_id, title, description, session_date, start_time, end_time, location, display_order)
 *   - session_units (session_id, unit)
 *
 * Core Hierarchy:
 *   EVENT is the PARENT, SESSION is the CHILD (EVENT -> SESSIONS)
 */

export const EVENT_TYPE_DEFINITIONS = [
  {
    id: "camp",
    slug: "camp",
    title: "Camp",
    tagline: "7-Day Intensive Rural Immersion & Village Transformation",
    excerpt: "Flagship 7-day intensive rural immersion and village transformation camps.",
    shortDesc: "Flagship residential community immersion camps where 250 volunteers live in adopted rural villages to conduct infrastructure renovation, socio-economic surveys, and health drives.",
    coverImage: `${process.env.PUBLIC_URL}/images/sessions-hero-volunteers.jpg`,
    isMonthlyType: false,
  },
  {
    id: "outreach",
    slug: "outreach",
    title: "Outreach",
    tagline: "Direct Civic Interventions & Environmental Restoration",
    excerpt: "Public health drives, coastal cleanups, and environmental conservation initiatives.",
    shortDesc: "Public health awareness campaigns, coastal cleanup drives, microplastic audits, tree plantations, and environmental conservation initiatives across the MIT community.",
    coverImage: `${process.env.PUBLIC_URL}/images/nss-tree-plantation.jpg`,
    isMonthlyType: false,
  },
  {
    id: "orphanage",
    slug: "orphanage",
    title: "Orphanage Visit",
    tagline: "Mentorship, Child Education & Compassionate Care",
    excerpt: "Educational mentoring, STEM learning labs, and compassionate care visits.",
    shortDesc: "Educational tutoring, STEM learning labs, cultural workshops, stationery distribution, and compassionate care for underprivileged children and elderly homes.",
    coverImage: `${process.env.PUBLIC_URL}/images/hero-placeholder.jpg`,
    isMonthlyType: false,
  },
  {
    id: "monthly",
    slug: "monthly",
    title: "Monthly Event",
    tagline: "Scheduled All-Unit Assemblies & Monthly Campus Service",
    excerpt: "Regular monthly assemblies, service activities & campus initiatives across all units.",
    shortDesc: "Regular monthly split-up assemblies, flag-hoisting observances, and coordinated civic service conducted across all seven NSS units throughout the academic calendar.",
    coverImage: `${process.env.PUBLIC_URL}/images/sessions-hero-volunteers.jpg`,
    isMonthlyType: true,
  }
];

export const MOCK_EVENTS = [];

export const MONTHLY_CHRONOLOGICAL_DATA = [];

export function getEventsByTypeId(typeId) {
  return [];
}

export function getEventById(eventId) {
  return null;
}

export function getSessionById(eventId, sessionId) {
  return null;
}
