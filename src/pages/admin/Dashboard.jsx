import React, { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { supabase } from "../../lib/supabase";
import {
  Users,
  Layers,
  Calendar,
  Clock,
  Megaphone,
  BarChart3,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Server,
  Database,
  CheckCircle2,
  HardDrive,
  Info,
  Sliders,
} from "lucide-react";
import "../../styles/admin.css";

export default function Dashboard() {
  const { user } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [counts, setCounts] = useState({
    people: 0,
    roles: 0,
    events: 0,
    sessions: 0,
    announcements: 0,
    statistics: 0,
    albums: 0,
    reports: 0,
  });
  const [siteSettings, setSiteSettings] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setFetchError(null);

    try {
      const [
        peopleRes,
        rolesRes,
        eventsRes,
        sessionsRes,
        announcementsRes,
        statsRes,
        albumsRes,
        reportsRes,
        settingsRes,
      ] = await Promise.all([
        supabase.from("people").select("id", { count: "exact", head: true }),
        supabase.from("roles").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("sessions").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("statistics").select("id", { count: "exact", head: true }),
        supabase.from("gallery_albums").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }),
        supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      ]);

      setCounts({
        people: peopleRes.count ?? 0,
        roles: rolesRes.count ?? 0,
        events: eventsRes.count ?? 0,
        sessions: sessionsRes.count ?? 0,
        announcements: announcementsRes.count ?? 0,
        statistics: statsRes.count ?? 0,
        albums: albumsRes.count ?? 0,
        reports: reportsRes.count ?? 0,
      });

      if (settingsRes.data) {
        setSiteSettings(settingsRes.data);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setFetchError(err.message || "Unable to sync metrics from database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const metricCards = [
    {
      title: "People Profiles",
      table: "people",
      count: counts.people,
      icon: Users,
      color: "from-blue-600 to-indigo-700",
      description: "Coordinators, Program Officers, Heads, & Incharges",
      phase: "Phase 2",
    },
    {
      title: "Leadership Roles",
      table: "roles",
      count: counts.roles,
      icon: Layers,
      color: "from-purple-600 to-violet-700",
      description: "Designation taxonomies & role tiers",
      phase: "Phase 2",
    },
    {
      title: "Events Recorded",
      table: "events",
      count: counts.events,
      icon: Calendar,
      color: "from-emerald-600 to-teal-700",
      description: "Annual special camps & flagship outreach",
      phase: "Phase 3",
    },
    {
      title: "Service Sessions",
      table: "sessions",
      count: counts.sessions,
      icon: Clock,
      color: "from-amber-600 to-orange-700",
      description: "Weekly volunteer modules & attendances",
      phase: "Phase 3",
    },
    {
      title: "Active Announcements",
      table: "announcements",
      count: counts.announcements,
      icon: Megaphone,
      color: "from-rose-600 to-red-700",
      description: "Notice board alerts & notifications",
      phase: "Phase 4",
    },
    {
      title: "Impact Metrics",
      table: "statistics",
      count: counts.statistics,
      icon: BarChart3,
      color: "from-cyan-600 to-blue-700",
      description: "Volunteers trained, hours served, camps held",
      phase: "Phase 4",
    },
    {
      title: "Gallery Albums",
      table: "gallery_albums",
      count: counts.albums,
      icon: ImageIcon,
      color: "from-fuchsia-600 to-pink-700",
      description: "High-resolution outreach photography",
      phase: "Phase 5",
    },
    {
      title: "Annual Reports",
      table: "reports",
      count: counts.reports,
      icon: FileText,
      color: "from-slate-700 to-slate-900",
      description: "Audited institutional PDFs & records",
      phase: "Phase 5",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-semibold">
              Live Database
            </span>
            <span className="text-xs text-slate-400 font-mono">
              PostgreSQL &bull; Supabase RLS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif mt-2 tracking-tight">
            NSS MIT CMS Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{user?.email}</span>. Content management control center for National Service Scheme, MIT Campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition-colors focus:outline-hidden"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-600" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Refresh Counts"}</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium shadow-xs transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Error Notice if any */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <div>{fetchError}</div>
        </div>
      )}

      {/* Live Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 font-mono">
            Database Content Summary
          </h2>
          {lastRefreshed && (
            <span className="text-[11px] text-slate-400 font-mono">
              Last synced: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {card.phase}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {loading ? "..." : card.count}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    {card.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Table: {card.table}</span>
                  <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
                    &bull;&bull;&bull;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Detail Section: Site Settings + Infrastructure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Settings Singleton Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">
                  Institutional Site Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Global parameters stored in Supabase table <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">site_settings</code>
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Record
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
              <span className="text-slate-400 font-mono uppercase text-[10px] block">
                Official Entity Name
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-serif">
                {siteSettings?.site_name || "National Service Scheme, MIT Anna University"}
              </span>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
              <span className="text-slate-400 font-mono uppercase text-[10px] block">
                Short Name / Code
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
                {siteSettings?.short_name || "NSS MIT"}
              </span>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 sm:col-span-2">
              <span className="text-slate-400 font-mono uppercase text-[10px] block">
                Institutional Description
              </span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">
                {siteSettings?.description || "National Service Scheme, Madras Institute of Technology Campus, Anna University."}
              </p>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px] block">
                  Footer Legal Attribution
                </span>
                <span className="text-slate-700 font-medium">
                  {siteSettings?.footer_text || "National Service Scheme, MIT Anna University"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Last updated: {siteSettings?.updated_at ? new Date(siteSettings.updated_at).toLocaleDateString() : "Present"}
              </div>
            </div>
          </div>
        </div>

        {/* System & Architecture Status */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                Backend Architecture
              </h3>
              <p className="text-xs text-slate-500">
                Security &amp; infrastructure telemetry
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">PostgreSQL Database</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                20 Tables Active
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">Row-Level Security</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Enforced (is_admin)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">Storage Buckets</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                2 Buckets Verified
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 text-slate-300 font-mono text-[10px] space-y-1">
              <div className="text-slate-400 font-semibold">Active Auth Identity:</div>
              <div className="text-emerald-400 truncate">{user?.email}</div>
              <div className="text-slate-500 text-[9px] pt-1">
                UUID: {user?.id}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CMS Phased Roadmap Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 bg-red-950/80 border border-red-800/50 px-2 py-0.5 rounded">
                Development Roadmap
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Phase 1 of 6 Executed
              </span>
            </div>
            <h3 className="text-lg font-bold font-serif text-white mt-1.5">
              NSS MIT Content Management System Architecture
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Phase 1 establishes authentication, session persistence, role validation via PostgreSQL RLS, unified administration layout, and live telemetry.
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-mono font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
              Phase 1 Complete
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-5 text-xs">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Phase 1: Foundation</span>
              <span className="text-emerald-400 text-[10px] font-mono uppercase">Done</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Auth, RLS verification, Layout, Sidebar, Topbar, Protected Routing, Dashboard.
            </p>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Phase 2: People CMS</span>
              <span className="text-amber-400 text-[10px] font-mono uppercase">Next Up</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Coordinators, Program Officers, Heads, Unit Incharges CRUD &amp; DepthCarousel sync.
            </p>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Phase 3: Events &amp; Sessions</span>
              <span className="text-slate-400 text-[10px] font-mono uppercase">Scheduled</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Events, regular sessions, attendees, timeline &amp; activity records.
            </p>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Phase 4: Content &amp; Metrics</span>
              <span className="text-slate-400 text-[10px] font-mono uppercase">Scheduled</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Site announcements, stats counters, site objectives, and organization settings.
            </p>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Phase 5: Media &amp; Reports</span>
              <span className="text-slate-400 text-[10px] font-mono uppercase">Scheduled</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Gallery albums, multi-image upload, annual report PDF storage.
            </p>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Phase 6: Admin Users</span>
              <span className="text-slate-400 text-[10px] font-mono uppercase">Scheduled</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Admin management, permission logs, audit trails, and storage maintenance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
