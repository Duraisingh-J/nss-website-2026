import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Plus,
  ArrowRight,
  RefreshCw,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [metrics, setMetrics] = useState({
    people: 0,
    events: 0,
    sessions: 0,
    announcements: 0,
    gallery: 0,
  });

  const [recentUpdates, setRecentUpdates] = useState([]);

  // Relative timestamp formatter
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setFetchError(null);

    try {
      // 1. Fetch exact real counts from Supabase
      const [
        peopleCountRes,
        eventsCountRes,
        sessionsCountRes,
        announcementsCountRes,
        galleryCountRes,
      ] = await Promise.all([
        supabase.from("people").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("sessions").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("gallery_albums").select("id", { count: "exact", head: true }),
      ]);

      setMetrics({
        people: peopleCountRes.count ?? 0,
        events: eventsCountRes.count ?? 0,
        sessions: sessionsCountRes.count ?? 0,
        announcements: announcementsCountRes.count ?? 0,
        gallery: galleryCountRes.count ?? 0,
      });

      // 2. Fetch recently updated records across tables from database
      const [peopleRes, eventsRes, sessionsRes, announcementsRes, reportsRes] =
        await Promise.all([
          supabase
            .from("people")
            .select("id, name, updated_at, created_at")
            .order("updated_at", { ascending: false })
            .limit(5),
          supabase
            .from("events")
            .select("id, title, updated_at, created_at")
            .order("updated_at", { ascending: false })
            .limit(5),
          supabase
            .from("sessions")
            .select("id, title, updated_at, created_at")
            .order("updated_at", { ascending: false })
            .limit(5),
          supabase
            .from("announcements")
            .select("id, title, updated_at, created_at")
            .order("updated_at", { ascending: false })
            .limit(5),
          supabase
            .from("reports")
            .select("id, title, updated_at, created_at")
            .order("updated_at", { ascending: false })
            .limit(5),
        ]);

      const mergedUpdates = [
        ...(peopleRes.data || []).map((item) => ({
          id: `person-${item.id}`,
          type: "Person",
          title: item.name,
          updated_at: item.updated_at || item.created_at,
          link: "/admin/people",
        })),
        ...(eventsRes.data || []).map((item) => ({
          id: `event-${item.id}`,
          type: "Event",
          title: item.title,
          updated_at: item.updated_at || item.created_at,
          link: "/admin/events",
        })),
        ...(sessionsRes.data || []).map((item) => ({
          id: `session-${item.id}`,
          type: "Session",
          title: item.title,
          updated_at: item.updated_at || item.created_at,
          link: "/admin/sessions",
        })),
        ...(announcementsRes.data || []).map((item) => ({
          id: `announcement-${item.id}`,
          type: "Announcement",
          title: item.title,
          updated_at: item.updated_at || item.created_at,
          link: "/admin/announcements",
        })),
        ...(reportsRes.data || []).map((item) => ({
          id: `report-${item.id}`,
          type: "Report",
          title: item.title,
          updated_at: item.updated_at || item.created_at,
          link: "/admin/reports",
        })),
      ]
        .filter((item) => Boolean(item.title))
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 6);

      setRecentUpdates(mergedUpdates);
    } catch (err) {
      console.error("Dashboard data error:", err);
      setFetchError("Unable to load live dashboard statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const overviewMetrics = [
    { label: "People", count: metrics.people, path: "/admin/people" },
    { label: "Events", count: metrics.events, path: "/admin/events" },
    { label: "Sessions", count: metrics.sessions, path: "/admin/sessions" },
    { label: "Announcements", count: metrics.announcements, path: "/admin/announcements" },
    { label: "Gallery", count: metrics.gallery, path: "/admin/gallery" },
  ];

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            NSS MIT CMS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the content and activities published on the NSS MIT website.
          </p>
        </div>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing || loading}
            title="Refresh statistics"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-600" : "text-slate-400"}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ERROR BANNER IF ANY */}
      {fetchError && (
        <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* SECTION 1 — CONTENT OVERVIEW */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Content Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {overviewMetrics.map((metric) => (
            <Link
              key={metric.label}
              to={metric.path}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-4 transition-colors shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-medium text-slate-500">
                  {metric.label}
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-2 font-sans tabular-nums">
                  {loading ? "—" : metric.count}
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors">
                <span>Manage</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 2 & 3 — RECENTLY UPDATED & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* SECTION 2 — RECENTLY UPDATED */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recently Updated
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading recent activity...
              </div>
            ) : recentUpdates.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentUpdates.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 shrink-0">
                        {item.type}
                      </span>
                      <Link
                        to={item.link}
                        className="text-sm font-medium text-slate-800 hover:text-red-700 truncate transition-colors"
                      >
                        {item.title}
                      </Link>
                    </div>
                    <div className="text-xs text-slate-400 shrink-0 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      <span>{formatRelativeTime(item.updated_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-xs text-slate-500">
                  No recently modified records found.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Updates to people, events, sessions, and announcements will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3 — QUICK ACTIONS */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Quick Actions
          </h2>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-2">
            <Link
              to="/admin/people"
              className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>Add Person</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </Link>

            <Link
              to="/admin/events"
              className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>Create Event</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </Link>

            <Link
              to="/admin/sessions"
              className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>Create Session</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </Link>

            <Link
              to="/admin/announcements"
              className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>Add Announcement</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
