import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventPublishStatus,
  EVENT_TYPES,
  STATUS_OPTIONS,
  formatDateDisplay,
  formatTimeDisplay,
} from "../../services/eventService.js";
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
} from "lucide-react";
import "../../styles/admin.css";

const TIMING_FILTER_OPTIONS = [
  { value: "all", label: "All Timing" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
];

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  event_type: "event",
  start_date: new Date().toISOString().split("T")[0],
  start_time: "10:00",
  end_date: new Date().toISOString().split("T")[0],
  end_time: "13:00",
  location: "NSS Campus",
  status: "draft",
  organizer: "NSS MIT Unit",
  registration_url: "",
  contact_email: "",
  contact_phone: "",
  max_participants: "",
  additional_information: "",
  cover_media_id: null,
  cover_image_url: null,
};

export default function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Image Upload states
  const [coverFile, setCoverFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);

  // Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

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
      setErrorNotice("Unable to load events from database. Please check your connection and try again.");
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

  // Close active row menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".row-action-menu")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Compute Summary Statistics
  const summaryStats = useMemo(() => {
    const total = events.length;
    let upcoming = 0;
    let published = 0;
    let drafts = 0;

    events.forEach((ev) => {
      if (ev.timingStatus === "Upcoming") upcoming++;
      if (ev.is_published || ev.status === "published") published++;
      if (ev.status === "draft" || (!ev.is_published && ev.status !== "archived")) drafts++;
    });

    return { total, upcoming, published, drafts };
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = event.title?.toLowerCase().includes(q);
        const matchesDesc = event.description?.toLowerCase().includes(q);
        const matchesLoc = event.location?.toLowerCase().includes(q);
        const matchesOrg = event.organizer?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesOrg) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "published" && !event.is_published && event.status !== "published") return false;
        if (statusFilter === "draft" && event.status !== "draft" && event.is_published) return false;
        if (statusFilter === "archived" && event.status !== "archived") return false;
      }

      // Event Type filter
      if (typeFilter !== "all" && event.event_type !== typeFilter) {
        return false;
      }

      // Date / Timing filter
      if (dateFilter !== "all" && event.timingStatus !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, statusFilter, typeFilter, dateFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, dateFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage]);

  const isFiltersActive = searchQuery.trim() !== "" || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData(INITIAL_FORM_STATE);
    setCoverFile(null);
    setImagePreview(null);
    setFieldErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      event_type: event.event_type || "event",
      start_date: event.start_date || new Date().toISOString().split("T")[0],
      start_time: event.start_time || "10:00",
      end_date: event.end_date || new Date().toISOString().split("T")[0],
      end_time: event.end_time || "13:00",
      location: event.location || "",
      status: event.status || (event.is_published ? "published" : "draft"),
      organizer: event.organizer || "",
      registration_url: event.registration_url || "",
      contact_email: event.contact_email || "",
      contact_phone: event.contact_phone || "",
      max_participants: event.max_participants ? String(event.max_participants) : "",
      additional_information: event.additional_information || "",
      cover_media_id: event.cover_media_id || null,
      cover_image_url: event.cover_image_url || null,
    });
    setCoverFile(null);
    setImagePreview(event.cover_image_url || null);
    setFieldErrors({});
    setIsFormModalOpen(true);
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
      setFieldErrors((prev) => ({ ...prev, image: null }));
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, image: err.message }));
    }
  };

  const handleRemoveImage = () => {
    setCoverFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, cover_media_id: null, cover_image_url: null }));
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Event title is required.";
    } else if (formData.title.trim().length > 150) {
      errors.title = "Title cannot exceed 150 characters.";
    }

    if (!formData.description.trim()) {
      errors.description = "Event description is required.";
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

    // Date range validation
    if (formData.start_date && formData.end_date) {
      const startDateTimeStr = `${formData.start_date}T${formData.start_time || "00:00"}`;
      const endDateTimeStr = `${formData.end_date}T${formData.end_time || "23:59"}`;
      const startDT = new Date(startDateTimeStr);
      const endDT = new Date(endDateTimeStr);

      if (endDT < startDT) {
        errors.end_date = "End date & time cannot be before start date & time.";
      }
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required.";
    }

    if (!formData.event_type) {
      errors.event_type = "Event type is required.";
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

  // Save Event (Create or Update)
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setErrorNotice(null);

    try {
      if (editingEvent) {
        const updated = await updateEvent(editingEvent.id, formData, coverFile);
        setEvents((prev) => prev.map((item) => (item.id === editingEvent.id ? updated : item)));
        setSuccessNotice(`Event "${updated.title}" updated successfully.`);
      } else {
        const created = await createEvent(formData, coverFile);
        setEvents((prev) => [created, ...prev]);
        setSuccessNotice(`Event "${created.title}" created successfully.`);
      }

      setIsFormModalOpen(false);
    } catch (err) {
      console.error("Save event error:", err);
      setErrorNotice(err.message || "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Publish / Unpublish Status
  const handleTogglePublish = async (event) => {
    setActiveMenuId(null);
    const nextStatus = event.is_published ? "draft" : "published";

    try {
      const updated = await toggleEventPublishStatus(event.id, nextStatus);
      setEvents((prev) => prev.map((item) => (item.id === event.id ? updated : item)));
      setSuccessNotice(
        nextStatus === "published"
          ? `Event "${event.title}" published successfully.`
          : `Event "${event.title}" unpublished.`
      );
    } catch (err) {
      console.error("Publish toggle error:", err);
      setErrorNotice("Failed to update event publish status.");
    }
  };

  // View Details Modal
  const handleOpenViewModal = (event) => {
    setActiveMenuId(null);
    setViewingEvent(event);
    setIsViewModalOpen(true);
  };

  // Delete Confirmation Modal
  const handleOpenDeleteModal = (event) => {
    setActiveMenuId(null);
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);

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
            <Calendar className="w-6 h-6 text-red-700" />
            Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage NSS events, programs, workshops and activities.
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
                <option value="draft">Status: Draft</option>
                <option value="published">Status: Published</option>
                <option value="archived">Status: Archived</option>
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Event Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1.5 pr-7 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
              >
                <option value="all">Type: All</option>
                {EVENT_TYPES.map((t) => (
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
                    <th className="py-3 px-4 min-w-[160px]">Date & Time</th>
                    <th className="py-3 px-4 min-w-[140px]">Location</th>
                    <th className="py-3 px-4 min-w-[100px]">Type</th>
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

                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {formatDateDisplay(ev.start_date)}
                          {ev.end_date && ev.end_date !== ev.start_date && (
                            <span className="text-slate-500 font-normal">
                              {" "}– {formatDateDisplay(ev.end_date)}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {formatTimeDisplay(ev.start_time)}
                            {ev.end_time ? ` – ${formatTimeDisplay(ev.end_time)}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1 text-slate-700 truncate max-w-[140px]" title={ev.location}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      </td>

                      {/* Event Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {ev.eventTypeLabel}
                        </span>
                      </td>

                      {/* Status Badges (CMS Status + Timing) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          {/* CMS Status */}
                          {ev.status === "archived" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Archived
                            </span>
                          ) : ev.is_published || ev.status === "published" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Draft
                            </span>
                          )}

                          {/* Secondary Timing Indicator */}
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

                      {/* Row Actions Menu */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="relative inline-block text-left row-action-menu">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === ev.id ? null : ev.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === ev.id && (
                            <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white border border-slate-200 divide-y divide-slate-100 focus:outline-hidden z-30 animate-in fade-in zoom-in-95 duration-100">
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenViewModal(ev)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleOpenEditModal(ev);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit Event</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(ev)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                >
                                  <Check className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{ev.is_published ? "Unpublish" : "Publish"}</span>
                                </button>
                              </div>
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteModal(ev)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Delete Event</span>
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
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">
                {editingEvent ? "Edit Event" : "Create New Event"}
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
            <form onSubmit={handleSaveEvent} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual Blood Donation Camp 2026"
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                    fieldErrors.title ? "border-red-500 bg-red-50/30" : "border-slate-200"
                  } rounded-md focus:bg-white focus:border-slate-400 focus:outline-hidden transition-colors`}
                />
                {fieldErrors.title && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed description of the event, objectives, and schedule..."
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                    fieldErrors.description ? "border-red-500 bg-red-50/30" : "border-slate-200"
                  } rounded-md focus:bg-white focus:border-slate-400 focus:outline-hidden transition-colors`}
                />
                {fieldErrors.description && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.description}</p>
                )}
              </div>

              {/* Dates & Times Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date & Time */}
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
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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

                {/* End Date & Time */}
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
                  {fieldErrors.end_date && (
                    <p className="text-[11px] text-red-600">{fieldErrors.end_date}</p>
                  )}
                </div>
              </div>

              {/* Location & Event Type & Status Row */}
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
                    placeholder="e.g. NSS Auditorium or Online"
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border ${
                      fieldErrors.location ? "border-red-500" : "border-slate-200"
                    } rounded-md focus:bg-white focus:outline-hidden`}
                  />
                  {fieldErrors.location && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.location}</p>
                  )}
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                  >
                    {EVENT_TYPES.map((t) => (
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

              {/* Cover Image Upload (WebP Client Optimization) */}
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
                        PNG, JPG or WebP (Automatically optimized to visually lossless WebP)
                      </div>
                    </label>
                  </div>
                )}
                {fieldErrors.image && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.image}</p>
                )}
              </div>

              {/* Optional Fields Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Additional Details (Optional)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Organizer */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Organizer / Department
                    </label>
                    <input
                      type="text"
                      value={formData.organizer}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      placeholder="e.g. NSS MIT Unit II"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Maximum Participants */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Max Participants Limit
                    </label>
                    <input
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                      placeholder="e.g. 150"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="nss@mitindia.edu"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Registration Link */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Registration Link / Google Form URL
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
                  {fieldErrors.registration_url && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.registration_url}</p>
                  )}
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Additional Instructions / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.additional_information}
                    onChange={(e) => setFormData({ ...formData, additional_information: e.target.value })}
                    placeholder="Certificates will be provided, refreshers included..."
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
                    <span>{editingEvent ? "Update Event" : "Create Event"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW EVENT DETAILS MODAL                                      */}
      {/* ------------------------------------------------------------- */}
      {isViewModalOpen && viewingEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Cover Image Header if exists */}
            {viewingEvent.cover_image_url ? (
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={viewingEvent.cover_image_url}
                  alt={viewingEvent.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-3 right-3 bg-slate-900/70 text-white hover:bg-slate-900 p-1.5 rounded-full transition-colors"
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

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {viewingEvent.eventTypeLabel}
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

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-800">
                  <Calendar className="w-4 h-4 text-red-700 shrink-0" />
                  <span>
                    {formatDateDisplay(viewingEvent.start_date)}
                    {viewingEvent.end_date && viewingEvent.end_date !== viewingEvent.start_date
                      ? ` – ${formatDateDisplay(viewingEvent.end_date)}`
                      : ""}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-800">
                  <Clock className="w-4 h-4 text-red-700 shrink-0" />
                  <span>
                    {formatTimeDisplay(viewingEvent.start_time)}
                    {viewingEvent.end_time ? ` – ${formatTimeDisplay(viewingEvent.end_time)}` : ""}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-800">
                  <MapPin className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{viewingEvent.location}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Description</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {viewingEvent.description}
                </p>
              </div>

              {/* Extra Details Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800 block">Organizer</span>
                  <span>{viewingEvent.organizer || "NSS Unit"}</span>
                </div>
                {viewingEvent.max_participants && (
                  <div>
                    <span className="font-semibold text-slate-800 block">Max Participants</span>
                    <span>{viewingEvent.max_participants} seats</span>
                  </div>
                )}
                {viewingEvent.contact_email && (
                  <div>
                    <span className="font-semibold text-slate-800 block">Contact Email</span>
                    <span>{viewingEvent.contact_email}</span>
                  </div>
                )}
                {viewingEvent.contact_phone && (
                  <div>
                    <span className="font-semibold text-slate-800 block">Contact Phone</span>
                    <span>{viewingEvent.contact_phone}</span>
                  </div>
                )}
              </div>

              {/* Registration Link */}
              {viewingEvent.registration_url && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">Registration Link</span>
                  <a
                    href={
                      viewingEvent.registration_url.startsWith("http")
                        ? viewingEvent.registration_url
                        : `https://${viewingEvent.registration_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-blue-600 hover:underline font-medium"
                  >
                    <span>{viewingEvent.registration_url}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Additional Notes */}
              {viewingEvent.additional_information && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">Additional Information</span>
                  <p className="text-slate-600 whitespace-pre-line">{viewingEvent.additional_information}</p>
                </div>
              )}
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
      {/* DELETE CONFIRMATION MODAL                                     */}
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
                  <strong className="text-slate-800">"{eventToDelete.title}"</strong>?
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
                  <span>Delete Event</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
