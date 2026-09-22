import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAdminAnnouncements,
  getEventsForSelection,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  ANNOUNCEMENT_CATEGORIES,
  ANNOUNCEMENT_STATUSES,
  PRIORITY_OPTIONS,
  formatCategoryLabel,
  formatDateTimeDisplay,
} from "../../services/announcementService.js";
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
  Megaphone,
  Eye,
  MoreVertical,
  Filter,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  AlertTriangle,
  Tag,
  Flame,
} from "lucide-react";
import "../../styles/admin.css";

const INITIAL_FORM_STATE = {
  title: "",
  content: "",
  category: "general",
  priority: 0,
  status: "draft",
  event_id: "",
  published_at: "",
  expires_at: "",
};

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Floating Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeMenuAnnouncement, setActiveMenuAnnouncement] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  // Create / Edit Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // View Details Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);

  // Delete Confirmation Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // -----------------------------------------------------------------
  // LOAD DATA FROM SUPABASE
  // -----------------------------------------------------------------
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorNotice(null);

    try {
      const [announcementsData, eventsData] = await Promise.all([
        getAdminAnnouncements(),
        getEventsForSelection(),
      ]);
      setAnnouncements(announcementsData);
      setAvailableEvents(eventsData);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setErrorNotice(err.message || "Unable to load announcements from database. Please check your connection.");
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

  // -----------------------------------------------------------------
  // FLOATING ACTION MENU HANDLERS
  // -----------------------------------------------------------------
  const handleActionMenuToggle = (e, item) => {
    e.stopPropagation();
    if (activeMenuId === item.id) {
      setActiveMenuId(null);
      setActiveMenuAnnouncement(null);
      setMenuPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensUp = spaceBelow < 200;

      setMenuPos({
        top: opensUp ? rect.top - 180 : rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
      setActiveMenuId(item.id);
      setActiveMenuAnnouncement(item);
    }
  };

  // Close floating row action menu on outside click, scroll, or resize
  useEffect(() => {
    const handleCloseMenu = (e) => {
      if (!e.target?.closest?.(".row-action-menu")) {
        setActiveMenuId(null);
        setActiveMenuAnnouncement(null);
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

  // -----------------------------------------------------------------
  // SUMMARY METRICS
  // -----------------------------------------------------------------
  const metrics = useMemo(() => {
    const total = announcements.length;
    let published = 0;
    let drafts = 0;
    let urgent = 0;

    announcements.forEach((a) => {
      if (a.status === "published") published++;
      else if (a.status === "draft") drafts++;
      if (Number(a.priority) > 0) urgent++;
    });

    return { total, published, drafts, urgent };
  }, [announcements]);

  // -----------------------------------------------------------------
  // FILTERED & SEARCHED ANNOUNCEMENTS
  // -----------------------------------------------------------------
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Search matching title or content
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesContent = item.content?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all") {
        if (priorityFilter === "urgent" && Number(item.priority) < 2) return false;
        if (priorityFilter === "high" && Number(item.priority) < 1) return false;
        if (priorityFilter === "normal" && Number(item.priority) !== 0) return false;
      }

      return true;
    });
  }, [announcements, searchQuery, categoryFilter, statusFilter, priorityFilter]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredAnnouncements.length / pageSize) || 1;
  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAnnouncements.slice(start, start + pageSize);
  }, [filteredAnnouncements, currentPage, pageSize]);

  const isFiltersActive =
    searchQuery.trim() !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCurrentPage(1);
  };

  // -----------------------------------------------------------------
  // CREATE & EDIT MODAL HANDLERS
  // -----------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setActiveMenuId(null);
    setEditingAnnouncement(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setActiveMenuId(null);
    setEditingAnnouncement(item);

    // Format ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
    const formatForInput = (isoStr) => {
      if (!isoStr) return "";
      try {
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return "";
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch (e) {
        return "";
      }
    };

    setFormData({
      title: item.title || "",
      content: item.content || "",
      category: item.category || "general",
      priority: Number(item.priority) || 0,
      status: item.status || "draft",
      event_id: item.event_id || "",
      published_at: formatForInput(item.published_at),
      expires_at: formatForInput(item.expires_at),
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (isSaving) return;
    setIsFormModalOpen(false);
    setEditingAnnouncement(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
  };

  // Form input validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Announcement title is required.";
    }
    if (!formData.content.trim()) {
      errors.content = "Announcement content is required.";
    }

    // Expiry date validation: must be >= published_at if both are specified
    if (formData.published_at && formData.expires_at) {
      const pubDate = new Date(formData.published_at);
      const expDate = new Date(formData.expires_at);
      if (expDate < pubDate) {
        errors.expires_at = "Expiry date cannot be earlier than publish date.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setErrorNotice(null);

    const payload = {
      title: formData.title,
      content: formData.content,
      category: formData.category,
      priority: Number(formData.priority) || 0,
      status: formData.status,
      event_id: formData.event_id || null,
      published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
    };

    try {
      if (editingAnnouncement) {
        const updated = await updateAnnouncement(editingAnnouncement.id, payload);
        setAnnouncements((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setSuccessNotice(`Announcement "${updated.title}" updated successfully.`);
      } else {
        const created = await createAnnouncement(payload);
        setAnnouncements((prev) => [created, ...prev]);
        setSuccessNotice(`Announcement "${created.title}" created successfully.`);
      }
      setIsFormModalOpen(false);
      setEditingAnnouncement(null);
      setFormData(INITIAL_FORM_STATE);
    } catch (err) {
      console.error("Error saving announcement:", err);
      setErrorNotice(err.message || "Failed to save announcement. Please check all fields.");
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------------------------------------------
  // VIEW MODAL HANDLERS
  // -----------------------------------------------------------------
  const handleOpenViewModal = (item) => {
    setActiveMenuId(null);
    setViewingAnnouncement(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingAnnouncement(null);
  };

  // -----------------------------------------------------------------
  // TOGGLE STATUS (PUBLISH / UNPUBLISH)
  // -----------------------------------------------------------------
  const handleToggleStatus = async (item) => {
    setActiveMenuId(null);
    try {
      const updated = await toggleAnnouncementStatus(item.id, item.status);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setSuccessNotice(
        `Announcement is now ${updated.status === "published" ? "Published" : "Draft"}.`
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      setErrorNotice(err.message || "Failed to update announcement status.");
    }
  };

  // -----------------------------------------------------------------
  // DELETE MODAL HANDLERS
  // -----------------------------------------------------------------
  const handleOpenDeleteModal = (item) => {
    setActiveMenuId(null);
    setAnnouncementToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!announcementToDelete) return;
    setIsDeleting(true);

    try {
      await deleteAnnouncement(announcementToDelete.id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementToDelete.id));
      setSuccessNotice(`Announcement "${announcementToDelete.title}" deleted.`);
      setIsDeleteModalOpen(false);
      setAnnouncementToDelete(null);
    } catch (err) {
      console.error("Delete announcement error:", err);
      setErrorNotice(err.message || "Failed to delete announcement.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Category badge color helper
  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case "event":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "registration":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "opportunity":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "notice":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "achievement":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "general":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    if (status === "published") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          Published
        </span>
      );
    }
    if (status === "archived") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
          Archived
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
        Draft
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* 1. COMPACT PAGE HEADER                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Contents / Announcements
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-red-700" />
            Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage NSS announcements, circulars, and volunteer updates.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            title="Reload announcements from database"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                refreshing ? "animate-spin text-red-600" : "text-slate-400"
              }`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NOTIFICATIONS (Success / Error Banners)                         */}
      {/* ------------------------------------------------------------- */}
      {successNotice && (
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-500 hover:text-emerald-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-800 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. SUMMARY METRICS BAR                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setStatusFilter("all");
            setPriorityFilter("all");
          }}
          className={`bg-white border rounded-lg p-4 shadow-2xs cursor-pointer hover:border-slate-300 transition-all ${
            statusFilter === "all" && priorityFilter === "all"
              ? "border-slate-400 ring-1 ring-slate-400"
              : "border-slate-200"
          }`}
          title="Filter: All announcements"
        >
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Announcements
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : metrics.total}
          </div>
        </div>

        <div
          onClick={() =>
            setStatusFilter(statusFilter === "published" ? "all" : "published")
          }
          className={`bg-white border rounded-lg p-4 shadow-2xs cursor-pointer hover:border-slate-300 transition-all ${
            statusFilter === "published"
              ? "border-slate-400 ring-1 ring-slate-400 bg-slate-50/50"
              : "border-slate-200"
          }`}
          title="Click to filter published announcements"
        >
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Published
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : metrics.published}
          </div>
        </div>

        <div
          onClick={() =>
            setStatusFilter(statusFilter === "draft" ? "all" : "draft")
          }
          className={`bg-white border rounded-lg p-4 shadow-2xs cursor-pointer hover:border-slate-300 transition-all ${
            statusFilter === "draft"
              ? "border-slate-400 ring-1 ring-slate-400 bg-slate-50/50"
              : "border-slate-200"
          }`}
          title="Click to filter draft announcements"
        >
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Drafts</span>
            {metrics.drafts > 0 && (
              <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : metrics.drafts}
          </div>
        </div>

        <div
          onClick={() =>
            setPriorityFilter(priorityFilter === "high" ? "all" : "high")
          }
          className={`bg-white border rounded-lg p-4 shadow-2xs cursor-pointer hover:border-slate-300 transition-all ${
            priorityFilter === "high"
              ? "border-slate-400 ring-1 ring-slate-400 bg-slate-50/50"
              : "border-slate-200"
          }`}
          title="Click to filter high/urgent announcements"
        >
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            High / Urgent
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans tabular-nums">
            {loading ? "—" : metrics.urgent}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SEARCH & FILTERS BAR                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 admin-custom-scrollbar">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
              categoryFilter === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            All Categories
          </button>
          {ANNOUNCEMENT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                categoryFilter === cat.value
                  ? "bg-red-700 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input & Select Dropdowns */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements by title or content..."
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

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1.5 pr-7 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="published">Status: Published</option>
                <option value="draft">Status: Draft</option>
                <option value="archived">Status: Archived</option>
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Priority Dropdown */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1.5 pr-7 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
              >
                <option value="all">Priority: All</option>
                <option value="urgent">Priority: Urgent (2)</option>
                <option value="high">Priority: High+ (1+)</option>
                <option value="normal">Priority: Normal (0)</option>
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Reset Filters button */}
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
      {/* 4. ANNOUNCEMENTS TABLE CONTAINER                               */}
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
                <div className="w-20 h-4 bg-slate-200 rounded-xs" />
                <div className="w-20 h-4 bg-slate-200 rounded-xs" />
              </div>
            ))}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          /* Empty States */
          <div className="p-12 text-center">
            {announcements.length === 0 ? (
              <div className="max-w-sm mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  No announcements yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Create your first announcement to share important NSS updates and circulars with volunteers.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Announcement</span>
                </button>
              </div>
            ) : (
              <div className="max-w-sm mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-500">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  No announcements match your filters
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Try adjusting your search query, status, or category filters.
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
          /* Table Presentation */
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="py-3 px-4">
                      Title & Excerpt
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Category
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Priority
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Associated Event
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Dates
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Status
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAnnouncements.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenViewModal(item)}
                    >
                      {/* Title & Excerpt */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1">
                          {item.title}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.content}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getCategoryBadgeClass(
                            item.category
                          )}`}
                        >
                          <Tag className="w-2.5 h-2.5 mr-1" />
                          {formatCategoryLabel(item.category)}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {Number(item.priority) === 2 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                            <Flame className="w-3 h-3 mr-1 text-red-600" />
                            Urgent
                          </span>
                        ) : Number(item.priority) === 1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            High (1)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Normal (0)</span>
                        )}
                      </td>

                      {/* Associated Event */}
                      <td className="py-3.5 px-4 whitespace-nowrap max-w-[180px]">
                        {item.eventTitle ? (
                          <span className="inline-flex items-center text-[11px] text-slate-700 hover:text-red-700 font-medium truncate max-w-full">
                            <Calendar className="w-3 h-3 text-slate-400 mr-1.5 shrink-0" />
                            <span className="truncate">{item.eventTitle}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Published / Expiry Dates */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Pub: {formatDateTimeDisplay(item.published_at)}</span>
                        </div>
                        {item.expires_at && (
                          <div className="text-[10px] text-slate-400">
                            Exp: {formatDateTimeDisplay(item.expires_at)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Three-Dot Actions Button */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleActionMenuToggle(e, item)}
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

            {/* Pagination Controls */}
            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {filteredAnnouncements.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * pageSize, filteredAnnouncements.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {filteredAnnouncements.length}
                </span>{" "}
                announcements
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
      {/* 5. CREATE / EDIT ANNOUNCEMENT MODAL                            */}
      {/* ------------------------------------------------------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-red-700" />
                {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
              </h2>
              <button
                type="button"
                onClick={handleCloseFormModal}
                disabled={isSaving}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveAnnouncement} className="p-5 space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) {
                      setFormErrors({ ...formErrors, title: null });
                    }
                  }}
                  placeholder="e.g., NSS Volunteer Orientation Meeting 2026"
                  className={`w-full px-3 py-2 text-xs bg-white border rounded-md focus:outline-hidden transition-colors ${
                    formErrors.title
                      ? "border-red-500 focus:border-red-600"
                      : "border-slate-300 focus:border-slate-500"
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Content / Body Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Content <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e.target.value });
                    if (formErrors.content) {
                      setFormErrors({ ...formErrors, content: null });
                    }
                  }}
                  placeholder="Enter the complete text of the announcement or notice..."
                  className={`w-full px-3 py-2 text-xs bg-white border rounded-md focus:outline-hidden transition-colors ${
                    formErrors.content
                      ? "border-red-500 focus:border-red-600"
                      : "border-slate-300 focus:border-slate-500"
                  }`}
                />
                {formErrors.content && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.content}
                  </p>
                )}
              </div>

              {/* Two-Column: Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-500 focus:outline-hidden"
                  >
                    {ANNOUNCEMENT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-500 focus:outline-hidden"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Two-Column: Status & Linked Event */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-500 focus:outline-hidden"
                  >
                    {ANNOUNCEMENT_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Linked Event <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={formData.event_id}
                    onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-500 focus:outline-hidden"
                  >
                    <option value="">No linked event</option>
                    {availableEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.start_date || "No date"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Two-Column: Publish Date & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Publish Date & Time{" "}
                    <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.published_at}
                    onChange={(e) =>
                      setFormData({ ...formData, published_at: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    If published, defaults to current time automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiry Date & Time{" "}
                    <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => {
                      setFormData({ ...formData, expires_at: e.target.value });
                      if (formErrors.expires_at) {
                        setFormErrors({ ...formErrors, expires_at: null });
                      }
                    }}
                    className={`w-full px-3 py-2 text-xs bg-white border rounded-md focus:outline-hidden ${
                      formErrors.expires_at
                        ? "border-red-500 focus:border-red-600"
                        : "border-slate-300 focus:border-slate-500"
                    }`}
                  />
                  {formErrors.expires_at && (
                    <p className="text-[11px] text-red-600 mt-1">
                      {formErrors.expires_at}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Must be after publish date if specified.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{editingAnnouncement ? "Saving..." : "Creating..."}</span>
                    </>
                  ) : (
                    <span>{editingAnnouncement ? "Save Changes" : "Create Announcement"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. READ-ONLY DETAIL VIEW MODAL                                */}
      {/* ------------------------------------------------------------- */}
      {isViewModalOpen && viewingAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getCategoryBadgeClass(
                    viewingAnnouncement.category
                  )}`}
                >
                  {formatCategoryLabel(viewingAnnouncement.category)}
                </span>
                {getStatusBadge(viewingAnnouncement.status)}
              </div>
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {viewingAnnouncement.title}
                </h3>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Published: {formatDateTimeDisplay(viewingAnnouncement.published_at)}
                    </span>
                  </div>
                  {viewingAnnouncement.expires_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Expires: {formatDateTimeDisplay(viewingAnnouncement.expires_at)}
                      </span>
                    </div>
                  )}
                  {Number(viewingAnnouncement.priority) > 0 && (
                    <div className="flex items-center gap-1 font-semibold text-red-600">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Priority {viewingAnnouncement.priority}</span>
                    </div>
                  )}
                </div>
              </div>

              {viewingAnnouncement.eventTitle && (
                <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      Associated Event:{" "}
                      <span className="font-semibold">{viewingAnnouncement.eventTitle}</span>
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Announcement Body
                </h4>
                <div className="p-4 rounded-md bg-slate-50/70 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {viewingAnnouncement.content}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Created: {formatDateTimeDisplay(viewingAnnouncement.created_at)}</span>
                <span>Last Updated: {formatDateTimeDisplay(viewingAnnouncement.updated_at)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const item = viewingAnnouncement;
                  handleCloseViewModal();
                  handleOpenEditModal(item);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Announcement</span>
              </button>

              <button
                type="button"
                onClick={handleCloseViewModal}
                className="px-4 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. DELETE CONFIRMATION DIALOG                                  */}
      {/* ------------------------------------------------------------- */}
      {isDeleteModalOpen && announcementToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Delete Announcement?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-slate-700">
                    "{announcementToDelete.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2.5">
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
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Announcement</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. FIXED POSITION FLOATING OVERLAY DROPDOWN MENU              */}
      {/* ------------------------------------------------------------- */}
      {activeMenuId && activeMenuAnnouncement && menuPos && (
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
                const item = activeMenuAnnouncement;
                setActiveMenuId(null);
                setActiveMenuAnnouncement(null);
                handleOpenViewModal(item);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>View Details</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const item = activeMenuAnnouncement;
                setActiveMenuId(null);
                setActiveMenuAnnouncement(null);
                handleOpenEditModal(item);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Edit Announcement</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const item = activeMenuAnnouncement;
                handleToggleStatus(item);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
            >
              <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {activeMenuAnnouncement.status === "published" ? "Unpublish (Draft)" : "Publish"}
              </span>
            </button>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                const item = activeMenuAnnouncement;
                setActiveMenuId(null);
                setActiveMenuAnnouncement(null);
                handleOpenDeleteModal(item);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Delete Announcement</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
