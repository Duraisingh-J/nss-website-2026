import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getReportingData,
  filterReportingData,
  computeActivityOverTime,
  computeEventTypeDistribution,
  computeUnitSessionActivity,
  exportReportToCSV,
} from "../../services/reportService.js";
import {
  FileText,
  RefreshCw,
  Download,
  Filter,
  RotateCcw,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  PieChart,
  Layers,
  ChevronRight,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import "../../styles/admin.css";

export default function ReportsManagement() {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Filters state
  const [academicYear, setAcademicYear] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");

  // Interactive Chart Tooltip state
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Drill-Down Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null); // "events" | "sessions" | "content" | "unit"
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerSubtitle, setDrawerSubtitle] = useState("");

  // Load raw data from Supabase
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorNotice(null);

    try {
      const data = await getReportingData();
      setRawData(data);
    } catch (err) {
      console.error("Failed to load reporting data:", err);
      setErrorNotice(err.message || "Unable to load reporting data. Please check connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successNotice) {
      const timer = setTimeout(() => setSuccessNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successNotice]);

  // Extract available academic years dynamically from database records
  const availableAcademicYears = useMemo(() => {
    if (!rawData) return [];
    const yearsSet = new Set();
    rawData.events.forEach((ev) => {
      if (ev.academicYear && ev.academicYear !== "Unknown") yearsSet.add(ev.academicYear);
    });
    rawData.sessions.forEach((s) => {
      if (s.academicYear && s.academicYear !== "Unknown") yearsSet.add(s.academicYear);
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [rawData]);

  // Compute filtered dataset
  const filteredData = useMemo(() => {
    if (!rawData) return { events: [], sessions: [], announcements: [], achievements: [] };
    return filterReportingData(rawData, { academicYear, eventType, unit: unitFilter });
  }, [rawData, academicYear, eventType, unitFilter]);

  // Compute Analytical Metrics & Distributions
  const activityOverTime = useMemo(() => {
    return computeActivityOverTime(filteredData);
  }, [filteredData]);

  const eventTypeDistribution = useMemo(() => {
    return computeEventTypeDistribution(filteredData);
  }, [filteredData]);

  const unitActivity = useMemo(() => {
    return computeUnitSessionActivity(filteredData);
  }, [filteredData]);

  // Summary Metrics calculations
  const totalEvents = filteredData.events.length;
  const totalSessions = filteredData.sessions.length;
  const activeUnitsCount = useMemo(() => {
    const set = new Set();
    filteredData.sessions.forEach((s) => s.units.forEach((u) => set.add(u)));
    return set.size;
  }, [filteredData]);

  const totalContentCount = useMemo(() => {
    const pubAnnouncements = filteredData.announcements.filter((a) => a.status === "published").length;
    const pubAchievements = filteredData.achievements.filter((a) => a.is_published).length;
    return pubAnnouncements + pubAchievements;
  }, [filteredData]);

  const isFiltersActive = academicYear !== "all" || eventType !== "all" || unitFilter !== "all";

  const handleClearFilters = () => {
    setAcademicYear("all");
    setEventType("all");
    setUnitFilter("all");
  };

  const handleExport = () => {
    try {
      exportReportToCSV(filteredData, { academicYear, eventType, unit: unitFilter });
      setSuccessNotice("Report exported to CSV successfully.");
    } catch (err) {
      console.error("Export error:", err);
      setErrorNotice("Failed to generate CSV export.");
    }
  };

  // Drill-down inspection drawer openers
  const openDrawer = (type, title, subtitle) => {
    setDrawerType(type);
    setDrawerTitle(title);
    setDrawerSubtitle(subtitle);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerType(null);
  };

  // Max value for Activity Over Time chart scaling
  const maxActivityVal = useMemo(() => {
    const vals = activityOverTime.map((d) => d.totalActivity);
    return Math.max(...vals, 4);
  }, [activityOverTime]);

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* 1. COMPACT PROFESSIONAL REPORTING HEADER                      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Contents / Reports
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-red-700" />
            Programme Intelligence & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Understand NSS activities, scheduled session distribution, and unit engagement across academic periods.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            title="Recalculate report data from database"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-600" : "text-slate-400"}`}
            />
            <span>{refreshing ? "Recalculating..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={loading || (totalEvents === 0 && totalSessions === 0)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NOTIFICATIONS (Success / Error Banners)                         */}
      {/* ------------------------------------------------------------- */}
      {successNotice && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-500 hover:text-emerald-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-800 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="text-red-500 hover:text-red-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. ANALYTICAL CONTROL TOOLBAR                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Reporting Scope:</span>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {academicYear === "all" ? "All Time" : `AY ${academicYear}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Academic Year Selector */}
          <div className="relative">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1 pr-6 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
            >
              <option value="all">All Academic Years</option>
              {availableAcademicYears.map((yr) => (
                <option key={yr} value={yr}>
                  Academic Year {yr}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Event Type Selector */}
          <div className="relative">
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1 pr-6 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
            >
              <option value="all">All Activity Types</option>
              <option value="camp">Camp Activities</option>
              <option value="outreach">Outreach & Drives</option>
              <option value="orphanage">Orphanage Visits</option>
              <option value="monthly">Monthly Assemblies</option>
            </select>
            <Filter className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Unit Selector */}
          <div className="relative">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1 pr-6 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
            >
              <option value="all">All Units (1–7)</option>
              {[1, 2, 3, 4, 5, 6, 7].map((u) => (
                <option key={u} value={String(u)}>
                  Unit {u}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {isFiltersActive && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. PRIMARY REPORT OVERVIEW (DRILL-DOWN CARDS)                 */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Events Conducted */}
        <div
          onClick={() =>
            openDrawer(
              "events",
              "Events Conducted",
              `Listing ${totalEvents} event records satisfying current filter criteria.`
            )
          }
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Events Conducted</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-700 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-sans tabular-nums">
              {loading ? "—" : totalEvents}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-red-700 transition-colors">
            <span>Inspect records</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Scheduled Sessions */}
        <div
          onClick={() =>
            openDrawer(
              "sessions",
              "Scheduled Sessions",
              `Listing ${totalSessions} individual session timeline entries.`
            )
          }
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Scheduled Sessions</span>
              <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-700 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-sans tabular-nums">
              {loading ? "—" : totalSessions}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-red-700 transition-colors">
            <span>Inspect sessions</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Active Units Involved */}
        <div
          onClick={() =>
            openDrawer(
              "unit",
              "Unit Session Participation",
              "Number of scheduled sessions associated with each unit (Units 1–7)."
            )
          }
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Units Active</span>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-700 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-sans tabular-nums">
              {loading ? "—" : `${activeUnitsCount} / 7`}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-red-700 transition-colors">
            <span>View unit distribution</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Content & Milestones */}
        <div
          onClick={() =>
            openDrawer(
              "content",
              "Published Content & Milestones",
              `Showing ${totalContentCount} published announcements and recognitions in this reporting scope.`
            )
          }
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Published Content</span>
              <Megaphone className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-700 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-sans tabular-nums">
              {loading ? "—" : totalContentCount}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-red-700 transition-colors">
            <span>Inspect communications</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. PRIMARY VISUALIZATION: ACTIVITY OVER TIME                   */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-700" />
              <span>NSS Activity Timeline Over Time</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Monthly distribution of scheduled events and individual activity sessions.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-700" />
              <span>Sessions</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-400" />
              <span>Events</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-48 bg-slate-50 rounded-lg animate-pulse" />
        ) : activityOverTime.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center text-xs text-slate-400">
            <Calendar className="w-6 h-6 text-slate-300 mb-1.5" />
            <span>No activity recorded within the selected reporting period.</span>
          </div>
        ) : (
          /* High-Precision Native Bar Visualization with Hover Tooltip */
          <div className="relative pt-6 pb-2">
            <div className="flex items-end space-x-6 sm:space-x-8 h-44 border-b border-slate-200 px-2 overflow-x-auto admin-custom-scrollbar">
              {activityOverTime.map((d) => {
                const sessionHeight = Math.round((d.sessionsCount / maxActivityVal) * 120);
                const eventHeight = Math.round((d.eventsCount / maxActivityVal) * 120);

                return (
                  <div
                    key={d.key}
                    onMouseEnter={() => setHoveredMonth(d)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="flex flex-col items-center group relative cursor-pointer shrink-0 pb-1"
                  >
                    {/* Floating Value Hint on Hover */}
                    <div className="text-[11px] font-mono font-semibold text-slate-700 mb-1 tabular-nums">
                      {d.totalActivity}
                    </div>

                    {/* Stacked Bar Container */}
                    <div className="w-8 sm:w-10 flex flex-col justify-end rounded-t-sm overflow-hidden bg-slate-100 hover:opacity-90 transition-all">
                      {eventHeight > 0 && (
                        <div
                          style={{ height: `${eventHeight}px` }}
                          className="w-full bg-slate-400 transition-all duration-300"
                        />
                      )}
                      {sessionHeight > 0 && (
                        <div
                          style={{ height: `${sessionHeight}px` }}
                          className="w-full bg-red-700 transition-all duration-300"
                        />
                      )}
                    </div>

                    {/* Month Label */}
                    <span className="text-[11px] font-medium text-slate-500 mt-2 whitespace-nowrap">
                      {d.monthLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredMonth && (
              <div className="mt-3 p-2.5 rounded-md bg-slate-900 text-white text-xs max-w-xs flex items-center justify-between animate-in fade-in duration-100">
                <span className="font-semibold">{hoveredMonth.monthLabel}:</span>
                <span className="text-slate-300">
                  {hoveredMonth.sessionsCount} sessions, {hoveredMonth.eventsCount} events (
                  {hoveredMonth.totalActivity} total)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. SECONDARY VISUALIZATIONS (TWO-COLUMN ANALYSIS)             */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* COLUMN 1: Event Type Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-red-700" />
              <span>Activity Distribution by Event Type</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Categorical breakdown of camps, outreach, orphanage visits, and monthly events.
            </p>
          </div>

          {loading ? (
            <div className="h-44 bg-slate-50 rounded-lg animate-pulse" />
          ) : totalEvents === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-400">
              No event records in this reporting scope.
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              {eventTypeDistribution.map((item) => (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  {/* Progress track */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: Unit Activity in Sessions */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-700" />
              <span>Unit Activity in Scheduled Sessions</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Number of scheduled sessions associated with each unit via session units.
            </p>
          </div>

          {loading ? (
            <div className="h-44 bg-slate-50 rounded-lg animate-pulse" />
          ) : totalSessions === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-400">
              No session records in this reporting scope.
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {unitActivity.map((u) => (
                <div key={u.unit} className="flex items-center space-x-3 text-xs">
                  <span className="w-14 font-semibold text-slate-700 shrink-0">
                    {u.label}
                  </span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${u.barPercentage}%` }}
                      className="h-full bg-red-700 rounded-full transition-all duration-500"
                    />
                  </div>
                  <span className="w-16 text-right font-mono text-slate-600 font-medium tabular-nums shrink-0">
                    {u.sessionCount} {u.sessionCount === 1 ? "sess" : "sessions"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. DRILL-DOWN INSPECTION DRAWER                                */}
      {/* ------------------------------------------------------------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
            onClick={closeDrawer}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {drawerTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{drawerSubtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 admin-custom-scrollbar">
                {drawerType === "events" && (
                  <div className="space-y-3">
                    {filteredData.events.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">
                        No events match current filter.
                      </p>
                    ) : (
                      filteredData.events.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white space-y-1.5 transition-colors"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                              {ev.event_type}
                            </span>
                            <span className="text-slate-400">AY {ev.academicYear}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {ev.title}
                          </h4>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {ev.start_date || "No start date"}
                            </span>
                            <span>&bull;</span>
                            <span>{ev.is_published ? "Published" : "Draft"}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {drawerType === "sessions" && (
                  <div className="space-y-3">
                    {filteredData.sessions.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">
                        No sessions match current filter.
                      </p>
                    ) : (
                      filteredData.sessions.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white space-y-1.5 transition-colors"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-500 truncate max-w-[70%]">
                              {s.eventTitle}
                            </span>
                            <span className="text-slate-400">
                              {s.session_date || "No date"}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {s.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                            {s.location && (
                              <span className="flex items-center gap-1 text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {s.location}
                              </span>
                            )}
                            {s.units.length > 0 && (
                              <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                                Units: {s.units.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {drawerType === "unit" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
                      This represents scheduled session associations recorded via the{" "}
                      <code className="text-red-700 font-mono">session_units</code> table.
                    </div>
                    {unitActivity.map((u) => (
                      <div
                        key={u.unit}
                        className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-800">{u.label}</span>
                        <span className="font-mono text-slate-600 font-medium">
                          {u.sessionCount} scheduled sessions
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {drawerType === "content" && (
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Published Announcements ({filteredData.announcements.length})
                    </h5>
                    {filteredData.announcements.slice(0, 10).map((a) => (
                      <div key={a.id} className="p-2.5 rounded-md border border-slate-200 text-xs">
                        <div className="font-semibold text-slate-900">{a.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Status: {a.status}
                        </div>
                      </div>
                    ))}

                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pt-3">
                      Archived Recognitions ({filteredData.achievements.length})
                    </h5>
                    {filteredData.achievements.slice(0, 10).map((ac) => (
                      <div key={ac.id} className="p-2.5 rounded-md border border-slate-200 text-xs">
                        <div className="font-semibold text-slate-900">{ac.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Date: {ac.achievement_date}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-4 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
