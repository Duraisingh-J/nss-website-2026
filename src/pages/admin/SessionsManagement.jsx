import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getAdminSessions,
  getEventsList,
  createSession,
  updateSession,
  deleteSession,
  toggleSessionPublishStatus,
  SESSION_TYPES,
  STATUS_OPTIONS,
  calculateDuration,
} from "../../services/sessionService.js";
import { formatDateDisplay, formatTimeDisplay } from "../../services/eventService.js";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  MapPin,
  Eye,
  MoreVertical,
  ExternalLink,
  Filter,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import "../../styles/admin.css";

const TIMING_FILTER_OPTIONS = [
  { value: "all", label: "All Timing" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
];

const INITIAL_FORM_STATE = {
  event_id: "",
  title: "",
  description: "",
  session_type: "activity",
  start_date: new Date().toISOString().split("T")[0],
  start_time: "10:00",
  end_date: new Date().toISOString().split("T")[0],
  end_time: "11:30",
  location: "NSS Auditorium",
  status: "draft",
  session_lead: "",
  speaker: "",
  registration_url: "",
  max_participants: "",
  additional_information: "",
};

export default function SessionsManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedEventId = searchParams.get("event_id") || "";

  const [sessions, setSessions] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState(preselectedEventId || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Keep event filter synced if URL changes
  useEffect(() => {
    if (preselectedEventId) {
      setEventFilter(preselectedEventId);
    }
  }, [preselectedEventId]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState({});
  const [rangeWarning, setRangeWarning] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState(null);

  // Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Load sessions & events list from Supabase
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorNotice(null);

    try {
      const [fetchedSessions, fetchedEvents] = await Promise.all([
        getAdminSessions(),
        getEventsList(),
      ]);
      setSessions(fetchedSessions);
      setEventsList(fetchedEvents);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setErrorNotice("Unable to load sessions from database. Please check your connection and try again.");
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

  // Close row action menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".row-action-menu")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Summary Statistics
  const summaryStats = useMemo(() => {
    const total = sessions.length;
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;

    sessions.forEach((s) => {
      if (s.timingStatus === "Upcoming") upcoming++;
      else if (s.timingStatus === "Ongoing") ongoing++;
      else if (s.timingStatus === "Completed") completed++;
    });

    return { total, upcoming, ongoing, completed };
  }, [sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = session.title?.toLowerCase().includes(q);
        const matchesDesc = session.description?.toLowerCase().includes(q);
        const matchesLoc = session.location?.toLowerCase().includes(q);
        const matchesLead = session.session_lead?.toLowerCase().includes(q);
        const matchesSpeaker = session.speaker?.toLowerCase().includes(q);
        const matchesEvent = session.event_title?.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesLead && !matchesSpeaker && !matchesEvent) {
          return false;
        }
      }

      // Event filter
      if (eventFilter !== "all" && session.event_id !== eventFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "published" && !session.is_published && session.status !== "published") return false;
        if (statusFilter === "draft" && session.status !== "draft" && session.is_published) return false;
        if (statusFilter === "archived" && session.status !== "archived") return false;
      }

      // Session Type filter
      if (typeFilter !== "all" && session.session_type !== typeFilter) {
        return false;
      }

      // Date / Timing filter
      if (dateFilter !== "all" && session.timingStatus !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [sessions, searchQuery, eventFilter, statusFilter, typeFilter, dateFilter]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, eventFilter, statusFilter, typeFilter, dateFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, currentPage]);

  const isFiltersActive =
    searchQuery.trim() !== "" ||
    eventFilter !== "all" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    dateFilter !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setEventFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
    if (searchParams.has("event_id")) {
      setSearchParams({});
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingSession(null);
    const defaultEvId = preselectedEventId || (eventsList.length > 0 ? eventsList[0].id : "");
    setFormData({
      ...INITIAL_FORM_STATE,
      event_id: defaultEvId,
    });
    setFieldErrors({});
    setRangeWarning(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (session) => {
    setEditingSession(session);
    setFormData({
      event_id: session.event_id || "",
      title: session.title || "",
      description: session.description || "",
      session_type: session.session_type || "activity",
      start_date: session.start_date || new Date().toISOString().split("T")[0],
      start_time: session.start_time || "10:00",
      end_date: session.end_date || session.start_date || new Date().toISOString().split("T")[0],
      end_time: session.end_time || "11:30",
      location: session.location || "",
      status: session.status || (session.is_published ? "published" : "draft"),
      session_lead: session.session_lead || "",
      speaker: session.speaker || "",
      registration_url: session.registration_url || "",
      max_participants: session.max_participants ? String(session.max_participants) : "",
      additional_information: session.additional_information || "",
    });
    setFieldErrors({});
    setRangeWarning(null);
    setIsFormModalOpen(true);
  };

  // Check event date range warning when event or dates change
  useEffect(() => {
    if (!formData.event_id || !formData.start_date) {
      setRangeWarning(null);
      return;
    }

    const selectedEv = eventsList.find((e) => e.id === formData.event_id);
    if (!selectedEv || !selectedEv.start_date) {
      setRangeWarning(null);
      return;
    }

    const sSession = formData.start_date;
    const eSession = formData.end_date || sSession;
    const sEvent = selectedEv.start_date;
    const eEvent = selectedEv.end_date || sEvent;

    if (sSession < sEvent || eSession > eEvent) {
      setRangeWarning(
        `Note: Session schedule (${sSession}${sSession !== eSession ? " to " + eSession : ""}) falls outside selected event's schedule (${sEvent}${sEvent !== eEvent ? " to " + eEvent : ""}).`
      );
    } else {
      setRangeWarning(null);
    }
  }, [formData.event_id, formData.start_date, formData.end_date, eventsList]);

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.event_id) {
      errors.event_id = "Please select a parent Event.";
    }

    if (!formData.title.trim()) {
      errors.title = "Session title is required.";
    } else if (formData.title.trim().length > 150) {
      errors.title = "Title cannot exceed 150 characters.";
    }

    if (!formData.start_date) {
      errors.start_date = "Start date is required.";
    }

    if (!formData.start_time) {
      errors.start_time = "Start time is required.";
    }

    if (!formData.end_date) {
      errors.end_date = "End date is required.";
    }

    if (!formData.end_time) {
      errors.end_time = "End time is required.";
    }

    // Start vs End time comparison
    if (formData.start_date && formData.end_date) {
      const startDateTimeStr = `${formData.start_date}T${formData.start_time || "00:00"}`;
      const endDateTimeStr = `${formData.end_date}T${formData.end_time || "23:59"}`;
      const startDT = new Date(startDateTimeStr);
      const endDT = new Date(endDateTimeStr);

      if (endDT <= startDT) {
        errors.end_time = "End date & time must be after start date & time.";
      }
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required.";
    }

    if (!formData.session_type) {
      errors.session_type = "Session type is required.";
    }

    if (!formData.status) {
      errors.status = "Status is required.";
    }

    if (formData.registration_url.trim()) {
      try {
        const urlStr = formData.registration_url.trim();
        const url = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
        if (!url.hostname) errors.registration_url = "Please enter a valid URL.";
      } catch (e) {
        errors.registration_url = "Please enter a valid web URL (e.g. https://forms.gle/...)";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Session (Create or Update)
  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setErrorNotice(null);

    try {
      if (editingSession) {
        const updated = await updateSession(editingSession.id, formData);
        setSessions((prev) => prev.map((item) => (item.id === editingSession.id ? updated : item)));
        setSuccessNotice(`Session "${updated.title}" updated successfully.`);
      } else {
        const created = await createSession(formData);
        setSessions((prev) => [created, ...prev]);
        setSuccessNotice(`Session "${created.title}" created successfully.`);
      }

      setIsFormModalOpen(false);
    } catch (err) {
      console.error("Save session error:", err);
      setErrorNotice(err.message || "Failed to save session.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Publish / Unpublish Status
  const handleTogglePublish = async (session) => {
    setActiveMenuId(null);
    const nextStatus = session.is_published ? "draft" : "published";

    try {
      const updated = await toggleSessionPublishStatus(session.id, nextStatus);
      setSessions((prev) => prev.map((item) => (item.id === session.id ? updated : item)));
      setSuccessNotice(
        nextStatus === "published"
          ? `Session "${session.title}" published successfully.`
          : `Session "${session.title}" unpublished.`
      );
    } catch (err) {
      console.error("Publish toggle error:", err);
      setErrorNotice("Failed to update session publish status.");
    }
  };

  // View Details Modal
  const handleOpenViewModal = (session) => {
    setActiveMenuId(null);
    setViewingSession(session);
    setIsViewModalOpen(true);
  };

  // Delete Confirmation Modal
  const handleOpenDeleteModal = (session) => {
    setActiveMenuId(null);
    setSessionToDelete(session);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);

    try {
      await deleteSession(sessionToDelete.id);
      setSessions((prev) => prev.filter((item) => item.id !== sessionToDelete.id));
      setSuccessNotice(`Session "${sessionToDelete.title}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    } catch (err) {
      console.error("Delete session error:", err);
      setErrorNotice(err.message || "Failed to delete session.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER                                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-red-700" />
            Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage schedules, activities and individual sessions within NSS events.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            title="Reload sessions from database"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-600" : "text-slate-400"}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Session</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NOTICES & ALERTS                                             */}
      {/* ------------------------------------------------------------- */}
      {errorNotice && (
        <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="text-red-500 hover:text-red-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-500 hover:text-emerald-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUMMARY CARDS                                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Sessions
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : summaryStats.total}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Upcoming
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : summaryStats.upcoming}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Ongoing
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : summaryStats.ongoing}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Completed
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : summaryStats.completed}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEARCH + FILTER BAR                                           */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions by name..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-slate-400 focus:outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Event Filter */}
            <div className="relative">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1.5 pr-7 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer max-w-[170px] truncate"
              >
                <option value="all">Event: All Events</option>
                {eventsList.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    Event: {ev.title}
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1.5 pr-7 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="draft">Status: Draft</option>
                <option value="published">Status: Published</option>
                <option value="archived">Status: Archived</option>
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Session Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1.5 pr-7 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
              >
                <option value="all">Type: All</option>
                {SESSION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Date / Timing Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1.5 pr-7 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
              >
                {TIMING_FILTER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.value === "all" ? "Date: All" : `Date: ${t.label}`}
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Clear Filters button if active */}
            {isFiltersActive && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SESSIONS TABLE CONTAINER                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {loading ? (
          /* Loading Skeleton State */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-8 h-8 bg-slate-200 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded-xs w-1/3" />
                  <div className="h-3 bg-slate-100 rounded-xs w-2/3" />
                </div>
                <div className="w-24 h-4 bg-slate-200 rounded-xs" />
                <div className="w-20 h-4 bg-slate-200 rounded-xs" />
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          /* Empty States */
          <div className="p-12 text-center">
            {sessions.length === 0 ? (
              <div className="max-w-sm mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No sessions yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Create sessions inside your NSS events to build the event schedule.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Session</span>
                </button>
              </div>
            ) : (
              <div className="max-w-sm mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-500">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No sessions match your filters</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Try adjusting your search terms or filter selections to view matching sessions.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Table Content */
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4 min-w-[220px]">Session</th>
                    <th className="py-3 px-4 min-w-[180px]">Event</th>
                    <th className="py-3 px-4 min-w-[160px]">Date & Time</th>
                    <th className="py-3 px-4 min-w-[100px]">Duration</th>
                    <th className="py-3 px-4 min-w-[130px]">Location</th>
                    <th className="py-3 px-4 min-w-[100px]">Type</th>
                    <th className="py-3 px-4 min-w-[110px]">Status</th>
                    <th className="py-3 px-4 text-right min-w-[90px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {paginatedSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Session Title & Description */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => handleOpenViewModal(s)}
                          className="font-medium text-slate-900 hover:text-red-700 cursor-pointer truncate max-w-xs transition-colors"
                          title={s.title}
                        >
                          {s.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                          {s.description || "No description provided."}
                        </div>
                      </td>

                      {/* Parent Event */}
                      <td className="py-3 px-4">
                        {s.event_id ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEventFilter(s.event_id);
                            }}
                            className="font-medium text-slate-800 hover:text-red-700 hover:underline inline-flex items-center space-x-1 truncate max-w-[170px] text-left"
                            title={`Filter by ${s.event_title}`}
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{s.event_title}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Unlinked Session</span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {formatDateDisplay(s.session_date)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {formatTimeDisplay(s.start_time)}
                            {s.end_time ? ` – ${formatTimeDisplay(s.end_time)}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {s.durationText}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1 text-slate-700 truncate max-w-[130px]" title={s.location}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{s.location}</span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {s.sessionTypeLabel}
                        </span>
                      </td>

                      {/* CMS Status + Timing Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          {s.status === "archived" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Archived
                            </span>
                          ) : s.is_published || s.status === "published" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Draft
                            </span>
                          )}

                          <span
                            className={`inline-flex items-center text-[10px] font-medium ${
                              s.timingStatus === "Upcoming"
                                ? "text-blue-600"
                                : s.timingStatus === "Ongoing"
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}
                          >
                            • {s.timingStatus}
                          </span>
                        </div>
                      </td>

                      {/* Row Actions Menu */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="relative inline-block text-left row-action-menu">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === s.id ? null : s.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === s.id && (
                            <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white border border-slate-200 divide-y divide-slate-100 focus:outline-hidden z-30 animate-in fade-in zoom-in-95 duration-100">
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenViewModal(s)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleOpenEditModal(s);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit Session</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(s)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                >
                                  <Check className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{s.is_published ? "Unpublish" : "Publish"}</span>
                                </button>
                              </div>
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteModal(s)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Delete Session</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {filteredSessions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * pageSize, filteredSessions.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-900">{filteredSessions.length}</span> sessions
              </div>

              {totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-red-700 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CREATE / EDIT SESSION FORM MODAL                              */}
      {/* ------------------------------------------------------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">
                {editingSession ? "Edit Session" : "Create New Session"}
              </h2>
              <button
                type="button"
                onClick={() => !isSaving && setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveSession} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Event Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Event <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                    fieldErrors.event_id ? "border-red-500 bg-red-50/30" : "border-slate-200"
                  } rounded-md focus:bg-white focus:outline-hidden transition-colors`}
                >
                  <option value="">-- Select Parent Event --</option>
                  {eventsList.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.start_date || "No date"})
                    </option>
                  ))}
                </select>
                {fieldErrors.event_id && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.event_id}</p>
                )}
              </div>

              {/* Range Warning if any */}
              {rangeWarning && (
                <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{rangeWarning}</span>
                </div>
              )}

              {/* Session Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Keynote Address & Volunteer Orientation"
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                    fieldErrors.title ? "border-red-500 bg-red-50/30" : "border-slate-200"
                  } rounded-md focus:bg-white focus:outline-hidden transition-colors`}
                />
                {fieldErrors.title && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of session agenda, activities, or topics..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Schedule */}
                <div className="space-y-2 bg-slate-50/60 p-3 rounded-md border border-slate-200">
                  <span className="text-xs font-semibold text-slate-800 block">Start Schedule</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">
                        Start Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            start_date: e.target.value,
                            end_date: formData.end_date < e.target.value ? e.target.value : formData.end_date,
                          })
                        }
                        className={`w-full px-2 py-1.5 text-xs bg-white border ${
                          fieldErrors.start_date ? "border-red-500" : "border-slate-200"
                        } rounded-md focus:outline-hidden`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">
                        Start Time <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className={`w-full px-2 py-1.5 text-xs bg-white border ${
                          fieldErrors.start_time ? "border-red-500" : "border-slate-200"
                        } rounded-md focus:outline-hidden`}
                      />
                    </div>
                  </div>
                  {fieldErrors.start_date && (
                    <p className="text-[11px] text-red-600">{fieldErrors.start_date}</p>
                  )}
                </div>

                {/* End Schedule */}
                <div className="space-y-2 bg-slate-50/60 p-3 rounded-md border border-slate-200">
                  <span className="text-xs font-semibold text-slate-800 block">End Schedule</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">
                        End Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className={`w-full px-2 py-1.5 text-xs bg-white border ${
                          fieldErrors.end_date ? "border-red-500" : "border-slate-200"
                        } rounded-md focus:outline-hidden`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">
                        End Time <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className={`w-full px-2 py-1.5 text-xs bg-white border ${
                          fieldErrors.end_time ? "border-red-500" : "border-slate-200"
                        } rounded-md focus:outline-hidden`}
                      />
                    </div>
                  </div>
                  {fieldErrors.end_time && (
                    <p className="text-[11px] text-red-600">{fieldErrors.end_time}</p>
                  )}
                </div>
              </div>

              {/* Calculated Duration Indicator */}
              <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 px-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Estimated Duration:{" "}
                  <strong className="text-slate-800">
                    {calculateDuration(
                      formData.start_date,
                      formData.start_time,
                      formData.end_date,
                      formData.end_time
                    )}
                  </strong>
                </span>
              </div>

              {/* Location & Session Type & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. NSS Auditorium or Hall 2"
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                      fieldErrors.location ? "border-red-500" : "border-slate-200"
                    } rounded-md focus:bg-white focus:outline-hidden`}
                  />
                  {fieldErrors.location && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.location}</p>
                  )}
                </div>

                {/* Session Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Session Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                  >
                    {SESSION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CMS Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CMS Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Fields Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Additional Details (Optional)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Session Lead */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Session Lead / Coordinator
                    </label>
                    <input
                      type="text"
                      value={formData.session_lead}
                      onChange={(e) => setFormData({ ...formData, session_lead: e.target.value })}
                      placeholder="e.g. Dr. R. Kumar (PO)"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Speaker / Resource Person */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Speaker / Guest Person
                    </label>
                    <input
                      type="text"
                      value={formData.speaker}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      placeholder="e.g. Mr. S. Viswanathan (District Officer)"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Maximum Participants */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Max Capacity Limit
                    </label>
                    <input
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                      placeholder="e.g. 100"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Registration Link */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Registration Link
                    </label>
                    <input
                      type="url"
                      value={formData.registration_url}
                      onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                      placeholder="https://forms.gle/..."
                      className={`w-full px-2.5 py-1.5 text-xs bg-slate-50 border ${
                        fieldErrors.registration_url ? "border-red-500" : "border-slate-200"
                      } rounded-md focus:bg-white focus:outline-hidden`}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Additional Instructions / Agenda Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.additional_information}
                    onChange={(e) => setFormData({ ...formData, additional_information: e.target.value })}
                    placeholder="Attendance will be recorded, materials provided..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Form Buttons Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingSession ? "Update Session" : "Create Session"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW SESSION DETAILS MODAL                                    */}
      {/* ------------------------------------------------------------- */}
      {isViewModalOpen && viewingSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">Session Details</h2>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {viewingSession.sessionTypeLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      viewingSession.is_published
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {viewingSession.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-[11px] font-medium text-blue-600">
                    • {viewingSession.timingStatus}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                  {viewingSession.title}
                </h3>
              </div>

              {/* Parent Event Banner / Link */}
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Parent Event</span>
                  <span className="font-semibold text-slate-900 text-xs">{viewingSession.event_title}</span>
                </div>
                {viewingSession.event_id && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      navigate(`/admin/events`);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors shrink-0"
                  >
                    <span>View Event</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="p-3 bg-slate-50/60 rounded-md border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-800">
                  <Calendar className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{formatDateDisplay(viewingSession.session_date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-800">
                  <Clock className="w-4 h-4 text-red-700 shrink-0" />
                  <span>
                    {formatTimeDisplay(viewingSession.start_time)}
                    {viewingSession.end_time ? ` – ${formatTimeDisplay(viewingSession.end_time)}` : ""}
                    <span className="text-slate-500 font-normal"> ({viewingSession.durationText})</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-800">
                  <MapPin className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{viewingSession.location}</span>
                </div>
              </div>

              {viewingSession.description && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Description</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {viewingSession.description}
                  </p>
                </div>
              )}

              {/* Extra Details Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-slate-600">
                {viewingSession.session_lead && (
                  <div>
                    <span className="font-semibold text-slate-800 block">Session Lead</span>
                    <span>{viewingSession.session_lead}</span>
                  </div>
                )}
                {viewingSession.speaker && (
                  <div>
                    <span className="font-semibold text-slate-800 block">Speaker / Guest</span>
                    <span>{viewingSession.speaker}</span>
                  </div>
                )}
                {viewingSession.max_participants && (
                  <div>
                    <span className="font-semibold text-slate-800 block">Capacity Limit</span>
                    <span>{viewingSession.max_participants} participants</span>
                  </div>
                )}
              </div>

              {/* Registration Link */}
              {viewingSession.registration_url && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">Registration Link</span>
                  <a
                    href={
                      viewingSession.registration_url.startsWith("http")
                        ? viewingSession.registration_url
                        : `https://${viewingSession.registration_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-blue-600 hover:underline font-medium"
                  >
                    <span>{viewingSession.registration_url}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Additional Info */}
              {viewingSession.additional_information && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">Additional Information</span>
                  <p className="text-slate-600 whitespace-pre-line">{viewingSession.additional_information}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Created {formatDateDisplay(viewingSession.created_at)}
              </span>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      {isDeleteModalOpen && sessionToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Session?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This action cannot be undone. Are you sure you want to delete the session{" "}
                  <strong className="text-slate-800">"{sessionToDelete.title}"</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Session</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
