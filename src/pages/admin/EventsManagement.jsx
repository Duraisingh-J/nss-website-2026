import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventPublishStatus,
  EVENT_CATEGORIES,
  formatDateDisplay,
  formatEventCategoryLabel,
} from "../../services/eventService.js";
import {
  getSessionsForEvent,
  syncEventSessions,
  formatTimeDisplay,
} from "../../services/sessionService.js";
import { validateImageFile } from "../../utils/imageOptimizer.js";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Upload,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Eye,
  MoreVertical,
  Filter,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import "../../styles/admin.css";

const ALL_UNITS = [1, 2, 3, 4, 5, 6, 7];

const TIMING_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
];

const INITIAL_EVENT_FORM_STATE = {
  title: "",
  description: "",
  event_type: "camp",
  start_date: new Date().toISOString().split("T")[0],
  end_date: new Date().toISOString().split("T")[0],
  is_published: false,
  cover_media_id: null,
  cover_image_url: null,
  sessions: [],
};

export default function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryTab, setCategoryTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Event Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState(INITIAL_EVENT_FORM_STATE);
  const [eventFieldErrors, setEventFieldErrors] = useState({});
  const [inlineSessionErrors, setInlineSessionErrors] = useState({});
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // Category switch confirmation state
  const [pendingCategory, setPendingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Image Upload states
  const [coverFile, setCoverFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // View Event Details & Embedded Sessions state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [embeddedSessions, setEmbeddedSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Delete Confirmation Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeMenuEvent, setActiveMenuEvent] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  const handleActionMenuToggle = (e, eventItem) => {
    e.stopPropagation();
    if (activeMenuId === eventItem.id) {
      setActiveMenuId(null);
      setActiveMenuEvent(null);
      setMenuPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensUp = spaceBelow < 190;

      setMenuPos({
        top: opensUp ? rect.top - 165 : rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
      setActiveMenuId(eventItem.id);
      setActiveMenuEvent(eventItem);
    }
  };

  // Close floating row action menu on outside click, scroll, or resize
  useEffect(() => {
    const handleCloseMenu = (e) => {
      if (!e.target?.closest?.(".row-action-menu")) {
        setActiveMenuId(null);
        setActiveMenuEvent(null);
        setMenuPos(null);
      }
    };
    document.addEventListener("click", handleCloseMenu);
    window.addEventListener("scroll", handleCloseMenu, true);
    window.addEventListener("resize", handleCloseMenu);
    return () => {
      document.removeEventListener("click", handleCloseMenu);
      window.removeEventListener("scroll", handleCloseMenu, true);
      window.removeEventListener("resize", handleCloseMenu);
    };
  }, []);

  // Load events from database
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorNotice(null);

    try {
      const fetchedEvents = await getAdminEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Failed to load events:", err);
      setErrorNotice("Unable to load events from database. Please check your connection.");
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

  // Compute Summary Statistics
  const summaryStats = useMemo(() => {
    const total = events.length;
    let upcoming = 0;
    let published = 0;
    let drafts = 0;

    events.forEach((ev) => {
      if (ev.timingStatus === "Upcoming") upcoming++;
      if (ev.is_published) published++;
      else drafts++;
    });

    return { total, upcoming, published, drafts };
  }, [events]);

  // Filtered Events based on search, category tab, status, and timing
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = event.title?.toLowerCase().includes(q);
        const matchesDesc = event.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) {
          return false;
        }
      }

      // Category Tab filter
      if (categoryTab !== "all") {
        const evCat = formatEventCategoryLabel(event.event_type);
        if (categoryTab === "camp" && evCat !== "Camp") return false;
        if (categoryTab === "outreach" && evCat !== "Outreach") return false;
        if (categoryTab === "orphanage" && evCat !== "Orphanage Visit") return false;
        if (categoryTab === "monthly" && evCat !== "Monthly Event") return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "published" && !event.is_published) return false;
        if (statusFilter === "draft" && event.is_published) return false;
      }

      // Timing filter
      if (dateFilter !== "all" && event.timingStatus !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, categoryTab, statusFilter, dateFilter]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryTab, statusFilter, dateFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage]);

  const isFiltersActive =
    searchQuery.trim() !== "" || categoryTab !== "all" || statusFilter !== "all" || dateFilter !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryTab("all");
    setStatusFilter("all");
    setDateFilter("all");
  };

  // Category switch handler with confirmation if sessions exist
  const handleEventTypeChange = (newType) => {
    if (
      newType === "monthly" &&
      Array.isArray(eventFormData.sessions) &&
      eventFormData.sessions.length > 0
    ) {
      setPendingCategory(newType);
      setIsCategoryModalOpen(true);
    } else {
      setEventFormData((prev) => ({ ...prev, event_type: newType }));
    }
  };

  const handleConfirmCategorySwitch = () => {
    setEventFormData((prev) => ({
      ...prev,
      event_type: pendingCategory || "monthly",
      sessions: [],
    }));
    setInlineSessionErrors({});
    setPendingCategory(null);
    setIsCategoryModalOpen(false);
  };

  const handleCancelCategorySwitch = () => {
    setPendingCategory(null);
    setIsCategoryModalOpen(false);
  };

  // Open Create Event Modal
  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setEventFormData(INITIAL_EVENT_FORM_STATE);
    setCoverFile(null);
    setImagePreview(null);
    setEventFieldErrors({});
    setInlineSessionErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Event Modal
  const handleOpenEditModal = async (event) => {
    setEditingEvent(event);
    setCoverFile(null);
    setImagePreview(event.cover_image_url || null);
    setEventFieldErrors({});
    setInlineSessionErrors({});

    // Fetch existing sessions for this event to load into form state
    let existingSessions = [];
    if (event.event_type !== "monthly") {
      try {
        existingSessions = await getSessionsForEvent(event.id);
      } catch (err) {
        console.error("Error loading sessions for edit:", err);
      }
    }

    setEventFormData({
      title: event.title || "",
      description: event.description || "",
      event_type: event.event_type || "camp",
      start_date: event.start_date || new Date().toISOString().split("T")[0],
      end_date: event.end_date || event.start_date || new Date().toISOString().split("T")[0],
      is_published: Boolean(event.is_published),
      cover_media_id: event.cover_media_id || null,
      cover_image_url: event.cover_image_url || null,
      sessions: existingSessions,
    });
    setIsFormModalOpen(true);
  };

  // Inline Sessions Local Handlers (React local state only)
  const handleAddInlineSession = () => {
    const newSession = {
      localId: Date.now() + Math.random(),
      id: null,
      title: "",
      description: "",
      session_date: eventFormData.start_date || new Date().toISOString().split("T")[0],
      start_time: "10:00",
      end_time: "11:30",
      location: "NSS Auditorium",
      is_published: true,
      units: [1, 2, 3, 4, 5, 6, 7],
    };
    setEventFormData((prev) => ({
      ...prev,
      sessions: [...(prev.sessions || []), newSession],
    }));
  };

  const handleRemoveInlineSession = (index) => {
    setEventFormData((prev) => ({
      ...prev,
      sessions: (prev.sessions || []).filter((_, idx) => idx !== index),
    }));
    setInlineSessionErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleUpdateInlineSession = (index, field, value) => {
    setEventFormData((prev) => {
      const updated = [...(prev.sessions || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sessions: updated };
    });
    if (inlineSessionErrors[index]?.[field]) {
      setInlineSessionErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], [field]: null },
      }));
    }
  };

  const handleToggleUnitForSession = (index, unitNum) => {
    setEventFormData((prev) => {
      const updated = [...(prev.sessions || [])];
      const currUnits = updated[index]?.units || [];
      const nextUnits = currUnits.includes(unitNum)
        ? currUnits.filter((u) => u !== unitNum)
        : [...currUnits, unitNum].sort((a, b) => a - b);
      updated[index] = { ...updated[index], units: nextUnits };
      return { ...prev, sessions: updated };
    });
  };

  const handleSelectAllUnitsForSession = (index) => {
    setEventFormData((prev) => {
      const updated = [...(prev.sessions || [])];
      updated[index] = { ...updated[index], units: [1, 2, 3, 4, 5, 6, 7] };
      return { ...prev, sessions: updated };
    });
  };

  const handleClearAllUnitsForSession = (index) => {
    setEventFormData((prev) => {
      const updated = [...(prev.sessions || [])];
      updated[index] = { ...updated[index], units: [] };
      return { ...prev, sessions: updated };
    });
  };

  // Image File Select Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setCoverFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      setEventFieldErrors((prev) => ({ ...prev, image: null }));
    } catch (err) {
      setEventFieldErrors((prev) => ({ ...prev, image: err.message }));
    }
  };

  const handleRemoveImage = () => {
    setCoverFile(null);
    setImagePreview(null);
    setEventFormData((prev) => ({ ...prev, cover_media_id: null, cover_image_url: null }));
  };

  // Validate Event Form
  const validateEventForm = () => {
    const errors = {};

    if (!eventFormData.title.trim()) {
      errors.title = "Event title is required.";
    } else if (eventFormData.title.trim().length > 150) {
      errors.title = "Title cannot exceed 150 characters.";
    }

    if (!eventFormData.start_date) {
      errors.start_date = "Start date is required.";
    }

    if (!eventFormData.end_date) {
      errors.end_date = "End date is required.";
    }

    if (eventFormData.start_date && eventFormData.end_date) {
      if (eventFormData.end_date < eventFormData.start_date) {
        errors.end_date = "End date cannot be before start date.";
      }
    }

    if (!eventFormData.event_type) {
      errors.event_type = "Event type / category is required.";
    }

    setEventFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate Inline Sessions
  const validateInlineSessions = () => {
    if (eventFormData.event_type === "monthly") return true;

    const errors = {};
    let hasErrors = false;

    (eventFormData.sessions || []).forEach((sess, idx) => {
      const sErr = {};
      if (!sess.title || !sess.title.trim()) {
        sErr.title = "Session title is required.";
      }
      if (!sess.session_date) {
        sErr.session_date = "Session date is required.";
      }
      if (!sess.start_time) {
        sErr.start_time = "Start time is required.";
      }
      if (!sess.end_time) {
        sErr.end_time = "End time is required.";
      }
      if (sess.session_date && sess.start_time && sess.end_time) {
        const startIso = `${sess.session_date}T${sess.start_time}`;
        const endIso = `${sess.session_date}T${sess.end_time}`;
        if (new Date(endIso) <= new Date(startIso)) {
          sErr.end_time = "End time must be after start time.";
        }
      }
      if (!sess.location || !sess.location.trim()) {
        sErr.location = "Location is required.";
      }

      if (Object.keys(sErr).length > 0) {
        errors[idx] = sErr;
        hasErrors = true;
      }
    });

    setInlineSessionErrors(errors);
    return !hasErrors;
  };

  // Save Event (Create or Update + Sync Sessions & Units)
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const isEventValid = validateEventForm();
    const isSessionsValid = validateInlineSessions();
    if (!isEventValid || !isSessionsValid) return;

    setIsSavingEvent(true);
    setErrorNotice(null);

    try {
      let savedEvent = null;
      if (editingEvent) {
        savedEvent = await updateEvent(editingEvent.id, eventFormData, coverFile);
      } else {
        savedEvent = await createEvent(eventFormData, coverFile);
      }

      // Unified creation/update: sync sessions and session_units
      await syncEventSessions(
        savedEvent.id,
        savedEvent.event_type,
        eventFormData.sessions
      );

      await loadData();

      setSuccessNotice(
        editingEvent
          ? `Event "${savedEvent.title}" updated successfully.`
          : `Event "${savedEvent.title}" created successfully.`
      );
      setIsFormModalOpen(false);
    } catch (err) {
      console.error("Save event error:", err);
      setErrorNotice(err.message || "Failed to save event.");
    } finally {
      setIsSavingEvent(false);
    }
  };

  // Toggle Publish / Unpublish Status
  const handleTogglePublish = async (event) => {
    setActiveMenuId(null);
    const nextPublished = !event.is_published;

    try {
      const updated = await toggleEventPublishStatus(event.id, nextPublished);
      setEvents((prev) => prev.map((item) => (item.id === event.id ? updated : item)));
      setSuccessNotice(
        nextPublished
          ? `Event "${event.title}" published successfully.`
          : `Event "${event.title}" unpublished.`
      );
    } catch (err) {
      console.error("Publish toggle error:", err);
      setErrorNotice("Failed to update event publish status.");
    }
  };

  // Open View Event Details (READ ONLY)
  const handleOpenViewModal = async (event) => {
    setActiveMenuId(null);
    setViewingEvent(event);
    setIsViewModalOpen(true);
    setLoadingSessions(true);

    try {
      const sessions = await getSessionsForEvent(event.id);
      setEmbeddedSessions(sessions);
    } catch (err) {
      console.error("Error loading embedded sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Delete Event Confirmation
  const handleOpenDeleteModal = (event) => {
    setActiveMenuId(null);
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeletingEvent(true);

    try {
      await deleteEvent(eventToDelete.id, eventToDelete.cover_media_id);
      setEvents((prev) => prev.filter((item) => item.id !== eventToDelete.id));
      setSuccessNotice(`Event "${eventToDelete.title}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error("Delete event error:", err);
      setErrorNotice(err.message || "Failed to delete event.");
    } finally {
      setIsDeletingEvent(false);
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
            <Calendar className="w-6 h-6 text-red-700" />
            Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage NSS events, camps, outreach programs, orphanage visits, and monthly activities.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            title="Reload events from database"
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
            <span>Create Event</span>
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
            Total Events
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
            Published
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : summaryStats.published}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Drafts
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : summaryStats.drafts}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CATEGORY TABS & SEARCH + FILTER BAR                           */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 border-b border-slate-200 pb-2.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setCategoryTab("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
              categoryTab === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            All Categories
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab("camp")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
              categoryTab === "camp"
                ? "bg-red-700 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Camp
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab("outreach")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
              categoryTab === "outreach"
                ? "bg-red-700 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Outreach
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab("orphanage")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
              categoryTab === "orphanage"
                ? "bg-red-700 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Orphanage Visit
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab("monthly")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
              categoryTab === "monthly"
                ? "bg-red-700 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Monthly Event
          </button>
        </div>

        {/* Search & Secondary Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by title or description..."
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
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1.5 pr-7 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="published">Status: Published</option>
                <option value="draft">Status: Draft</option>
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Timing Filter */}
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
      {/* EVENTS TABLE CONTAINER                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {loading ? (
          /* Loading Skeleton State */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-200 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded-xs w-1/3" />
                  <div className="h-3 bg-slate-100 rounded-xs w-2/3" />
                </div>
                <div className="w-24 h-4 bg-slate-200 rounded-xs" />
                <div className="w-20 h-4 bg-slate-200 rounded-xs" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty States */
          <div className="p-12 text-center">
            {events.length === 0 ? (
              <div className="max-w-sm mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No events found</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Create your first NSS event to get started with managing activities and programs.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Event</span>
                </button>
              </div>
            ) : (
              <div className="max-w-sm mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-500">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No events match your filters</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Try adjusting your search terms or filter selections to view matching events.
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
                    <th className="py-3 px-4 min-w-[240px]">Event</th>
                    <th className="py-3 px-4 min-w-[160px]">Dates</th>
                    <th className="py-3 px-4 min-w-[120px]">Category</th>
                    <th className="py-3 px-4 min-w-[140px]">Status</th>
                    <th className="py-3 px-4 min-w-[100px]">Created</th>
                    <th className="py-3 px-4 text-right min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {paginatedEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Event Title + Description + Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                              {ev.cover_image_url ? (
                                <img
                                  src={ev.cover_image_url}
                                  alt={ev.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <Calendar className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                onClick={() => handleOpenViewModal(ev)}
                                className="font-medium text-slate-900 hover:text-red-700 cursor-pointer truncate max-w-xs transition-colors"
                                title={ev.title}
                              >
                                {ev.title}
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                                {ev.description || "No description provided."}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">
                            {formatDateDisplay(ev.start_date)}
                            {ev.end_date && ev.end_date !== ev.start_date && (
                              <span className="text-slate-500 font-normal">
                                {" "}– {formatDateDisplay(ev.end_date)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {ev.categoryLabel}
                          </span>
                        </td>

                        {/* Status Badges */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            {ev.is_published ? (
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
                                ev.timingStatus === "Upcoming"
                                  ? "text-blue-600"
                                  : ev.timingStatus === "Ongoing"
                                  ? "text-emerald-600"
                                  : "text-slate-500"
                              }`}
                            >
                              • {ev.timingStatus}
                            </span>
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {formatDateDisplay(ev.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => handleActionMenuToggle(e, ev)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors row-action-menu"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
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
                  {filteredEvents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * pageSize, filteredEvents.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-900">{filteredEvents.length}</span> events
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
      {/* CREATE / EDIT EVENT FORM MODAL                                */}
      {/* ------------------------------------------------------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                type="button"
                onClick={() => !isSavingEvent && setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEvent} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Event Type / Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Type / Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={eventFormData.event_type}
                  onChange={(e) => handleEventTypeChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  placeholder="e.g. NSS Annual Special Camp 2026"
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                    eventFieldErrors.title ? "border-red-500 bg-red-50/30" : "border-slate-200"
                  } rounded-md focus:bg-white focus:outline-hidden transition-colors`}
                />
                {eventFieldErrors.title && (
                  <p className="text-[11px] text-red-600 mt-1">{eventFieldErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="Provide event details, theme, and schedule overview..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventFormData.start_date}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        start_date: e.target.value,
                        end_date: eventFormData.end_date < e.target.value ? e.target.value : eventFormData.end_date,
                      })
                    }
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                      eventFieldErrors.start_date ? "border-red-500" : "border-slate-200"
                    } rounded-md focus:bg-white focus:outline-hidden`}
                  />
                  {eventFieldErrors.start_date && (
                    <p className="text-[11px] text-red-600 mt-1">{eventFieldErrors.start_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventFormData.end_date}
                    onChange={(e) => setEventFormData({ ...eventFormData, end_date: e.target.value })}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                      eventFieldErrors.end_date ? "border-red-500" : "border-slate-200"
                    } rounded-md focus:bg-white focus:outline-hidden`}
                  />
                  {eventFieldErrors.end_date && (
                    <p className="text-[11px] text-red-600 mt-1">{eventFieldErrors.end_date}</p>
                  )}
                </div>
              </div>

              {/* Publishing Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Publishing Status <span className="text-red-600">*</span>
                </label>
                <select
                  value={eventFormData.is_published ? "true" : "false"}
                  onChange={(e) => setEventFormData({ ...eventFormData, is_published: e.target.value === "true" })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                >
                  <option value="false">Draft (Hidden)</option>
                  <option value="true">Published (Visible on Public Website)</option>
                </select>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Cover Image (Optional)
                </label>

                {imagePreview ? (
                  <div className="relative rounded-md border border-slate-200 p-2 bg-slate-50 flex items-center space-x-3">
                    <img
                      src={imagePreview}
                      alt="Cover Preview"
                      className="w-16 h-16 object-cover rounded-md border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {coverFile ? coverFile.name : "Current cover photo"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {coverFile
                          ? `New upload: ${(coverFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : "Uploaded in storage"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-md p-4 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="event-image-upload"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <label htmlFor="event-image-upload" className="cursor-pointer space-y-1 block">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <div className="text-xs font-medium text-slate-700">
                        Upload event banner or cover image
                      </div>
                      <div className="text-[11px] text-slate-400">
                        PNG, JPG or WebP (Visually lossless WebP optimization)
                      </div>
                    </label>
                  </div>
                )}
                {eventFieldErrors.image && (
                  <p className="text-[11px] text-red-600 mt-1">{eventFieldErrors.image}</p>
                )}
              </div>

              {/* -------------------------------------------------- */}
              {/* SESSIONS SECTION (Inline creation/management)     */}
              {/* -------------------------------------------------- */}
              {eventFormData.event_type !== "monthly" && (
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-red-700" />
                        Sessions
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Optional — add sessions to schedule specific activities for this event.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddInlineSession}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Session</span>
                    </button>
                  </div>

                  {/* Inline Session Blocks */}
                  {(!eventFormData.sessions || eventFormData.sessions.length === 0) ? (
                    <div className="p-4 rounded-md border border-dashed border-slate-200 text-center bg-slate-50/50 space-y-2">
                      <p className="text-xs text-slate-500">No sessions added to this event yet.</p>
                      <button
                        type="button"
                        onClick={handleAddInlineSession}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Session</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eventFormData.sessions.map((sess, idx) => (
                        <div
                          key={sess.localId || sess.id || idx}
                          className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3 relative"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              Session {idx + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveInlineSession(idx)}
                              className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove Session</span>
                            </button>
                          </div>

                          {/* Session Title */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Session Title <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={sess.title}
                              onChange={(e) => handleUpdateInlineSession(idx, "title", e.target.value)}
                              placeholder="e.g. Volunteer Orientation & Briefing"
                              className={`w-full px-3 py-1.5 text-xs bg-white border ${
                                inlineSessionErrors[idx]?.title ? "border-red-500 bg-red-50/20" : "border-slate-200"
                              } rounded-md focus:outline-hidden`}
                            />
                            {inlineSessionErrors[idx]?.title && (
                              <p className="text-[11px] text-red-600 mt-0.5">{inlineSessionErrors[idx].title}</p>
                            )}
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={sess.description || ""}
                              onChange={(e) => handleUpdateInlineSession(idx, "description", e.target.value)}
                              placeholder="Session agenda or notes..."
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden"
                            />
                          </div>

                          {/* Session Date & Times */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Session Date <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="date"
                                value={sess.session_date}
                                onChange={(e) => handleUpdateInlineSession(idx, "session_date", e.target.value)}
                                className={`w-full px-2.5 py-1.5 text-xs bg-white border ${
                                  inlineSessionErrors[idx]?.session_date ? "border-red-500" : "border-slate-200"
                                } rounded-md focus:outline-hidden`}
                              />
                              {inlineSessionErrors[idx]?.session_date && (
                                <p className="text-[11px] text-red-600 mt-0.5">{inlineSessionErrors[idx].session_date}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Start Time <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="time"
                                value={sess.start_time}
                                onChange={(e) => handleUpdateInlineSession(idx, "start_time", e.target.value)}
                                className={`w-full px-2.5 py-1.5 text-xs bg-white border ${
                                  inlineSessionErrors[idx]?.start_time ? "border-red-500" : "border-slate-200"
                                } rounded-md focus:outline-hidden`}
                              />
                              {inlineSessionErrors[idx]?.start_time && (
                                <p className="text-[11px] text-red-600 mt-0.5">{inlineSessionErrors[idx].start_time}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                End Time <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="time"
                                value={sess.end_time}
                                onChange={(e) => handleUpdateInlineSession(idx, "end_time", e.target.value)}
                                className={`w-full px-2.5 py-1.5 text-xs bg-white border ${
                                  inlineSessionErrors[idx]?.end_time ? "border-red-500" : "border-slate-200"
                                } rounded-md focus:outline-hidden`}
                              />
                              {inlineSessionErrors[idx]?.end_time && (
                                <p className="text-[11px] text-red-600 mt-0.5">{inlineSessionErrors[idx].end_time}</p>
                              )}
                            </div>
                          </div>

                          {/* Location */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Location <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={sess.location}
                              onChange={(e) => handleUpdateInlineSession(idx, "location", e.target.value)}
                              placeholder="e.g. NSS Auditorium"
                              className={`w-full px-3 py-1.5 text-xs bg-white border ${
                                inlineSessionErrors[idx]?.location ? "border-red-500" : "border-slate-200"
                              } rounded-md focus:outline-hidden`}
                            />
                            {inlineSessionErrors[idx]?.location && (
                              <p className="text-[11px] text-red-600 mt-0.5">{inlineSessionErrors[idx].location}</p>
                            )}
                          </div>

                          {/* Units Attending Checkboxes */}
                          <div className="pt-2 border-t border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-slate-700">Units Attending</label>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleSelectAllUnitsForSession(idx)}
                                  className="text-[10px] text-red-700 font-medium hover:underline"
                                >
                                  Select All
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  type="button"
                                  onClick={() => handleClearAllUnitsForSession(idx)}
                                  className="text-[10px] text-slate-500 font-medium hover:underline"
                                >
                                  Clear All
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 bg-white p-2 rounded-md border border-slate-200">
                              {ALL_UNITS.map((u) => {
                                const isChecked = (sess.units || []).includes(u);
                                return (
                                  <label
                                    key={u}
                                    className={`flex items-center justify-center space-x-1 p-1 rounded-md border text-[11px] cursor-pointer transition-colors ${
                                      isChecked
                                        ? "bg-red-50 border-red-200 text-red-700 font-medium"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleUnitForSession(idx, u)}
                                      className="rounded-xs text-red-700 focus:ring-0 cursor-pointer"
                                    />
                                    <span>Unit {u}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="pt-1 flex justify-center">
                        <button
                          type="button"
                          onClick={handleAddInlineSession}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Another Session</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Buttons Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSavingEvent}
                  className="px-4 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingEvent}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors"
                >
                  {isSavingEvent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingEvent ? "Update Event" : "Create Event"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CATEGORY SWITCH CONFIRMATION MODAL                            */}
      {/* ------------------------------------------------------------- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Switch to Monthly Event?</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Monthly Events do not use separate sessions. Switching to Monthly Event will remove the sessions currently added to this form. Continue?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelCategorySwitch}
                className="px-4 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCategorySwitch}
                className="px-4 py-2 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW EVENT DETAILS MODAL (READ-ONLY EXPERIENCE)               */}
      {/* ------------------------------------------------------------- */}
      {isViewModalOpen && viewingEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Banner if Cover Image */}
            {viewingEvent.cover_image_url ? (
              <div className="relative max-h-64 w-full bg-slate-950 flex items-center justify-center p-3 overflow-hidden rounded-t-lg">
                <img
                  src={viewingEvent.cover_image_url}
                  alt={viewingEvent.title}
                  className="max-h-56 w-auto object-contain rounded-md shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-3 right-3 bg-slate-900/80 text-white hover:bg-slate-950 p-1.5 rounded-full transition-colors shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-semibold text-slate-900">Event Details</h2>
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {viewingEvent.categoryLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      viewingEvent.is_published
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {viewingEvent.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-[11px] font-medium text-blue-600">
                    • {viewingEvent.timingStatus}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                  {viewingEvent.title}
                </h3>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center space-x-2 text-slate-800">
                <Calendar className="w-4 h-4 text-red-700 shrink-0" />
                <span>
                  {formatDateDisplay(viewingEvent.start_date)}
                  {viewingEvent.end_date && viewingEvent.end_date !== viewingEvent.start_date
                    ? ` – ${formatDateDisplay(viewingEvent.end_date)}`
                    : ""}
                </span>
              </div>

              {viewingEvent.description && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Description</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {viewingEvent.description}
                  </p>
                </div>
              )}

              {/* READ-ONLY SESSIONS DISPLAY */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-red-700" />
                    Sessions
                  </h4>
                </div>

                {viewingEvent.categoryLabel === "Monthly Event" ? (
                  <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800 block mb-0.5">Monthly Event</span>
                    This event represents a single scheduled activity. Individual sub-sessions are not required for Monthly Events.
                  </div>
                ) : loadingSessions ? (
                  <div className="p-4 text-center text-xs text-slate-400">Loading sessions...</div>
                ) : embeddedSessions.length === 0 ? (
                  <div className="p-4 rounded-md border border-dashed border-slate-200 text-center bg-slate-50/50">
                    <p className="text-xs text-slate-500">No sessions added to this event.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {embeddedSessions.map((s, idx) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-md bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-xs flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] inline-flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span>{s.title}</span>
                          </div>

                          {s.description && (
                            <p className="text-[11px] text-slate-600 pl-7">{s.description}</p>
                          )}

                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 pl-7 pt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formatDateDisplay(s.session_date)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>
                                {formatTimeDisplay(s.start_time)} – {formatTimeDisplay(s.end_time)}
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{s.location}</span>
                            </span>
                          </div>

                          {/* Attending Units Badges */}
                          {Array.isArray(s.units) && s.units.length > 0 && (
                            <div className="flex items-center space-x-1 mt-1 pt-1.5 border-t border-slate-200/60 pl-7">
                              <span className="text-[10px] font-semibold text-slate-500">Units Attending:</span>
                              <div className="flex flex-wrap gap-1">
                                {s.units.map((u) => (
                                  <span
                                    key={u}
                                    className="px-1.5 py-0.2 rounded-xs text-[10px] font-medium bg-red-50 text-red-700 border border-red-200"
                                  >
                                    Unit {u}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Created {formatDateDisplay(viewingEvent.created_at)}
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
      {/* DELETE EVENT CONFIRMATION MODAL                               */}
      {/* ------------------------------------------------------------- */}
      {isDeleteModalOpen && eventToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Event?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This action cannot be undone. Are you sure you want to delete the event{" "}
                  <strong className="text-slate-800">"{eventToDelete.title}"</strong> and all its embedded sessions?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => !isDeletingEvent && setIsDeleteModalOpen(false)}
                disabled={isDeletingEvent}
                className="px-4 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEvent}
                disabled={isDeletingEvent}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-medium text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors"
              >
                {isDeletingEvent ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Event</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED POSITION FLOATING OVERLAY DROPDOWN MENU */}
      {activeMenuId && activeMenuEvent && menuPos && (
        <div
          style={{
            position: "fixed",
            top: `${menuPos.top}px`,
            right: `${menuPos.right}px`,
            zIndex: 9999,
          }}
          className="w-48 rounded-md shadow-2xl bg-white border border-slate-200 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100 row-action-menu"
        >
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                const ev = activeMenuEvent;
                setActiveMenuId(null);
                setActiveMenuEvent(null);
                handleOpenViewModal(ev);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>View Details & Sessions</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const ev = activeMenuEvent;
                setActiveMenuId(null);
                setActiveMenuEvent(null);
                handleOpenEditModal(ev);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Edit Event</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const ev = activeMenuEvent;
                setActiveMenuId(null);
                setActiveMenuEvent(null);
                handleTogglePublish(ev);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
            >
              <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{activeMenuEvent.is_published ? "Unpublish" : "Publish"}</span>
            </button>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                const ev = activeMenuEvent;
                setActiveMenuId(null);
                setActiveMenuEvent(null);
                handleOpenDeleteModal(ev);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Delete Event</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
