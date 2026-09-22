import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAdminAchievements,
  getPeopleForSelection,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  toggleAchievementPublish,
  ACHIEVEMENT_CATEGORIES,
  formatAchievementDate,
  formatUnitLabel,
} from "../../services/achievementService.js";
import { validateImageFile } from "../../utils/imageOptimizer.js";
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  MoreVertical,
  Filter,
  RotateCcw,
  Check,
  Calendar,
  AlertTriangle,
  User,
  Sparkles,
  Trophy,
  ImageIcon,
  ArrowRight,
} from "lucide-react";
import "../../styles/admin.css";

const UNIT_OPTIONS = [
  { value: "", label: "No specific unit / Overall NSS" },
  { value: "1", label: "Unit I" },
  { value: "2", label: "Unit II" },
  { value: "3", label: "Unit III" },
  { value: "4", label: "Unit IV" },
  { value: "5", label: "Unit V" },
  { value: "6", label: "Unit VI" },
  { value: "7", label: "Unit VII" },
];

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  achievement_date: new Date().toISOString().split("T")[0],
  category: "State Award",
  person_id: "",
  unit: "",
  is_published: true,
  media_id: null,
};

export default function AchievementsManagement() {
  const [achievements, setAchievements] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Floating Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeMenuAchievement, setActiveMenuAchievement] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  // Create / Edit Modal state (Two-Panel with Live Preview)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // View Details Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAchievement, setViewingAchievement] = useState(null);

  // Delete Confirmation Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // -----------------------------------------------------------------
  // LOAD DATA FROM SUPABASE
  // -----------------------------------------------------------------
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorNotice(null);

    try {
      const [achievementsData, peopleData] = await Promise.all([
        getAdminAchievements(),
        getPeopleForSelection(),
      ]);
      setAchievements(achievementsData);
      setPeople(peopleData);
    } catch (err) {
      console.error("Failed to load achievements:", err);
      setErrorNotice(
        err.message || "Unable to load achievements from database. Please check connection."
      );
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
      setActiveMenuAchievement(null);
      setMenuPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensUp = spaceBelow < 190;

      setMenuPos({
        top: opensUp ? rect.top - 170 : rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
      setActiveMenuId(item.id);
      setActiveMenuAchievement(item);
    }
  };

  // Close floating menu on outside click, scroll, resize
  useEffect(() => {
    const handleCloseMenu = (e) => {
      if (!e.target?.closest?.(".row-action-menu")) {
        setActiveMenuId(null);
        setActiveMenuAchievement(null);
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
  // METRICS & ARCHIVE SUMMARY
  // -----------------------------------------------------------------
  const metrics = useMemo(() => {
    const total = achievements.length;
    let published = 0;
    const yearsSet = new Set();

    achievements.forEach((a) => {
      if (a.is_published) published++;
      if (a.year && a.year !== "Archived") yearsSet.add(a.year);
    });

    return {
      total,
      published,
      yearsCount: yearsSet.size,
      availableYears: Array.from(yearsSet).sort((a, b) => b.localeCompare(a)),
    };
  }, [achievements]);

  // -----------------------------------------------------------------
  // FILTERED ACHIEVEMENTS
  // -----------------------------------------------------------------
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesPerson = item.personName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesPerson) {
          return false;
        }
      }

      if (yearFilter !== "all" && item.year !== yearFilter) {
        return false;
      }

      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [achievements, searchQuery, yearFilter, categoryFilter]);

  // Chronological Grouping by Year
  const groupedByYear = useMemo(() => {
    const groups = {};
    filteredAchievements.forEach((item) => {
      const y = item.year || "Archived";
      if (!groups[y]) groups[y] = [];
      groups[y].push(item);
    });

    const sortedYears = Object.keys(groups).sort((a, b) => {
      if (a === "Archived") return 1;
      if (b === "Archived") return -1;
      return b.localeCompare(a);
    });

    return sortedYears.map((year) => ({
      year,
      items: groups[year],
    }));
  }, [filteredAchievements]);

  const isFiltersActive = searchQuery.trim() !== "" || yearFilter !== "all" || categoryFilter !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setYearFilter("all");
    setCategoryFilter("all");
  };

  // -----------------------------------------------------------------
  // TWO-PANEL CREATE & EDIT MODAL HANDLERS
  // -----------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setActiveMenuId(null);
    setEditingAchievement(null);
    setFormData(INITIAL_FORM_STATE);
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setActiveMenuId(null);
    setEditingAchievement(item);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      achievement_date: item.achievement_date || new Date().toISOString().split("T")[0],
      category: item.category || "State Award",
      person_id: item.person_id || "",
      unit: item.unit ? String(item.unit) : "",
      is_published: item.is_published,
      media_id: item.media_id,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || null);
    setRemoveImage(false);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (isSaving) return;
    setIsFormModalOpen(false);
    setEditingAchievement(null);
    setFormData(INITIAL_FORM_STATE);
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setFormErrors({});
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setImageFile(file);
      setRemoveImage(false);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } catch (err) {
      alert(err.message || "Invalid image file format or size.");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Achievement title is required.";
    }
    if (!formData.achievement_date) {
      errors.achievement_date = "Achievement date is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setErrorNotice(null);

    const payload = {
      title: formData.title,
      description: formData.description,
      achievement_date: formData.achievement_date,
      category: formData.category,
      person_id: formData.person_id || null,
      unit: formData.unit || null,
      is_published: formData.is_published,
      media_id: formData.media_id,
    };

    try {
      if (editingAchievement) {
        const updated = await updateAchievement(
          editingAchievement.id,
          payload,
          imageFile,
          removeImage
        );
        setAchievements((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setSuccessNotice(`Achievement "${updated.title}" updated successfully.`);
      } else {
        const created = await createAchievement(payload, imageFile);
        setAchievements((prev) => [created, ...prev]);
        setSuccessNotice(`Achievement "${created.title}" added to archive.`);
      }
      handleCloseFormModal();
    } catch (err) {
      console.error("Error saving achievement:", err);
      setErrorNotice(err.message || "Failed to save achievement. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------------------------------------------
  // TOGGLE PUBLISH STATUS
  // -----------------------------------------------------------------
  const handleTogglePublish = async (item) => {
    setActiveMenuId(null);
    try {
      const updated = await toggleAchievementPublish(item.id, item.is_published);
      setAchievements((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setSuccessNotice(
        `Milestone "${item.title}" is now ${updated.is_published ? "Published" : "Draft"}.`
      );
    } catch (err) {
      console.error("Publish toggle error:", err);
      setErrorNotice(err.message || "Failed to update publication status.");
    }
  };

  // -----------------------------------------------------------------
  // VIEW MODAL HANDLERS
  // -----------------------------------------------------------------
  const handleOpenViewModal = (item) => {
    setActiveMenuId(null);
    setViewingAchievement(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingAchievement(null);
  };

  // -----------------------------------------------------------------
  // DELETE MODAL HANDLERS
  // -----------------------------------------------------------------
  const handleOpenDeleteModal = (item) => {
    setActiveMenuId(null);
    setAchievementToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!achievementToDelete) return;
    setIsDeleting(true);

    try {
      await deleteAchievement(achievementToDelete.id, achievementToDelete.media_id);
      setAchievements((prev) => prev.filter((a) => a.id !== achievementToDelete.id));
      setSuccessNotice(`Achievement "${achievementToDelete.title}" removed from archive.`);
      setIsDeleteModalOpen(false);
      setAchievementToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorNotice(err.message || "Failed to delete achievement.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper for live preview recipient details
  const previewPerson = useMemo(() => {
    if (!formData.person_id) return null;
    return people.find((p) => p.id === formData.person_id) || null;
  }, [formData.person_id, people]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* 1. EDITORIAL HEADER + INLINE ARCHIVE SUMMARY                  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Contents / Achievements
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-red-700" />
            Achievements
          </h1>
          {/* Understated Editorial Archive Metadata Line */}
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {metrics.total === 0 ? (
              <span>0 recognitions archived &bull; Archive ready</span>
            ) : (
              <span>
                {metrics.total} {metrics.total === 1 ? "recognition" : "recognitions"} archived &bull; across{" "}
                {metrics.yearsCount} {metrics.yearsCount === 1 ? "year" : "years"} ({metrics.published} published)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            title="Reload achievements from database"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-600" : "text-slate-400"}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Achievement</span>
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
      {/* 2. COMPACT ARCHIVE TOOLBAR                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-800 tracking-tight">
            Achievement Archive
          </span>
          <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {filteredAchievements.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compact Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recognitions..."
              className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-slate-400 focus:outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Compact Year Dropdown */}
          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1 pr-6 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
            >
              <option value="all">All Years</option>
              {metrics.availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Compact Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1 pr-6 focus:outline-hidden focus:border-slate-400 appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {ACHIEVEMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {isFiltersActive && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. RECOGNITION ARCHIVE & CHRONOLOGICAL TIMELINE               */}
      {/* ------------------------------------------------------------- */}
      {loading ? (
        /* Recognition Archive Skeleton Loader */
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-lg p-5 flex items-start space-x-6 animate-pulse"
            >
              <div className="w-12 h-10 bg-slate-200 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded-xs w-1/4" />
                <div className="h-5 bg-slate-200 rounded-xs w-1/2" />
                <div className="h-3 bg-slate-100 rounded-xs w-3/4" />
              </div>
              <div className="w-24 h-16 bg-slate-100 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      ) : filteredAchievements.length === 0 ? (
        /* MINIMALIST ARCHIVE OPENING EMPTY STATE (Unique to Achievements) */
        <div className="py-16 text-center max-w-lg mx-auto space-y-5 animate-in fade-in duration-300">
          {/* Subtle Watermark Index */}
          <div className="text-7xl font-bold font-mono text-slate-200 select-none">
            01
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Achievement Archive</span>
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900 tracking-tight">
              {achievements.length === 0 ? "NO MILESTONES YET" : "NO MATCHING RECOGNITIONS"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {achievements.length === 0
                ? "Your first recognition will become the beginning of the NSS achievement archive."
                : "No archived achievements match your current search terms or filters."}
            </p>
          </div>

          <div>
            {achievements.length === 0 ? (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Achievement</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* CHRONOLOGICAL TIMELINE ARCHIVE */
        <div className="space-y-10 pt-1">
          {groupedByYear.map((group) => (
            <div key={group.year} className="space-y-3">
              {/* Year Rail Divider */}
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold font-serif text-slate-900 tracking-tight">
                  {group.year}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-mono text-slate-400">
                  {group.items.length} {group.items.length === 1 ? "milestone" : "milestones"}
                </span>
              </div>

              {/* Asymmetric Recognition Items */}
              <div className="space-y-3">
                {group.items.map((item, index) => {
                  const editorialIndex = String(index + 1).padStart(2, "0");

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenViewModal(item)}
                      className="bg-white border border-slate-200 rounded-lg p-4 md:p-5 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group cursor-pointer relative"
                    >
                      {/* Left: Editorial Index Number */}
                      <div className="shrink-0 flex sm:flex-col items-center sm:items-start space-x-2 sm:space-x-0 w-12">
                        <span className="font-mono text-xl font-bold text-slate-300 group-hover:text-red-700 transition-colors">
                          {editorialIndex}
                        </span>
                      </div>

                      {/* Middle: Content Hierarchy */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-semibold tracking-wider uppercase text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            {item.category || "Recognition"}
                          </span>
                          {!item.is_published && (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                              Draft
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            &bull; {item.formattedDate}
                          </span>
                        </div>

                        <h3 className="text-sm md:text-base font-bold font-serif text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-1">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                          {item.personName && (
                            <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.personName}</span>
                            </div>
                          )}
                          {item.unitLabel && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                              {item.unitLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Framed Certificate Thumbnail & Actions */}
                      <div
                        className="shrink-0 flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.imageUrl && (
                          <div className="w-20 h-14 bg-slate-50 border border-slate-200 rounded-md p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="max-h-full max-w-full object-contain rounded-xs"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(item)}
                            className="text-xs font-semibold text-slate-500 hover:text-red-700 inline-flex items-center space-x-1 transition-colors px-2 py-1 rounded hover:bg-slate-50"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleActionMenuToggle(e, item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors row-action-menu"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. TWO-PANEL CREATE / EDIT MODAL WITH REAL-TIME LIVE PREVIEW  */}
      {/* ------------------------------------------------------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-red-700" />
                <h2 className="text-base font-semibold text-slate-900">
                  {editingAchievement ? "Edit Recognition Record" : "Create Recognition Record"}
                </h2>
              </div>
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

            {/* Modal Body: Two-Panel Grid (Form on Left, Live Preview on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* LEFT PANEL: Form Inputs */}
              <form
                onSubmit={handleSaveAchievement}
                className="lg:col-span-7 p-6 space-y-4 max-h-[75vh] overflow-y-auto admin-custom-scrollbar"
              >
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Achievement / Award Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) setFormErrors({ ...formErrors, title: null });
                    }}
                    placeholder="e.g., Best NSS Volunteer State Award 2026"
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

                {/* Date & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Achievement Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.achievement_date}
                      onChange={(e) => {
                        setFormData({ ...formData, achievement_date: e.target.value });
                        if (formErrors.achievement_date) {
                          setFormErrors({ ...formErrors, achievement_date: null });
                        }
                      }}
                      className={`w-full px-3 py-2 text-xs bg-white border rounded-md focus:outline-hidden ${
                        formErrors.achievement_date
                          ? "border-red-500"
                          : "border-slate-300 focus:border-slate-500"
                      }`}
                    />
                    {formErrors.achievement_date && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {formErrors.achievement_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      list="achievement-categories-list"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., State Award"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-500 focus:outline-hidden"
                    />
                    <datalist id="achievement-categories-list">
                      {ACHIEVEMENT_CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Recipient Person & Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient / Volunteer <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={formData.person_id}
                      onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-500 focus:outline-hidden"
                    >
                      <option value="">No specific recipient (Overall NSS)</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.designation ? `(${p.designation})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Associated Unit <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-500 focus:outline-hidden"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description Narrative */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description / Milestone Narrative{" "}
                    <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about the recognition, awarding body, or impact..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-500 focus:outline-hidden transition-colors"
                  />
                </div>

                {/* Photograph / Certificate Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recognition Image / Certificate{" "}
                    <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/50">
                    {imagePreview && !removeImage ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-14 rounded-md bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {imageFile ? imageFile.name : "Current achievement image"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {imageFile
                              ? `${(imageFile.size / 1024).toFixed(1)} KB`
                              : "Preserved in original aspect ratio"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <label className="cursor-pointer text-xs text-red-700 hover:text-red-800 font-semibold">
                          <span>Upload certificate or photograph</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Rendered in original aspect ratio without cropping.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Public Visibility Toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">
                      Public Visibility
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Publish to public website recognition archive
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({ ...formData, is_published: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
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
                        <span>{editingAchievement ? "Saving..." : "Creating..."}</span>
                      </>
                    ) : (
                      <span>{editingAchievement ? "Save Changes" : "Create Achievement"}</span>
                    )}
                  </button>
                </div>
              </form>

              {/* RIGHT PANEL: Live Archive Card Preview */}
              <div className="lg:col-span-5 bg-slate-50/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Live Archive Card Preview</span>
                  </div>

                  {/* Rendered Live Preview Card */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-300">
                        01
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        {formData.category || "Recognition"}
                      </span>
                    </div>

                    {imagePreview && !removeImage && (
                      <div className="h-32 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-center p-1 overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain rounded-xs"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="text-sm font-bold font-serif text-slate-900 leading-snug">
                        {formData.title.trim() || (
                          <span className="text-slate-300 italic">
                            Your achievement title will appear here...
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                        {formData.description.trim() || (
                          <span className="text-slate-300 italic">
                            Milestone narrative description preview...
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="truncate max-w-[65%]">
                        {previewPerson ? (
                          <span className="font-medium text-slate-700 truncate">
                            {previewPerson.name}
                          </span>
                        ) : formData.unit ? (
                          <span>{formatUnitLabel(formData.unit)}</span>
                        ) : (
                          <span>NSS MIT</span>
                        )}
                      </div>
                      <div className="font-medium text-slate-400 shrink-0">
                        {formData.achievement_date
                          ? formatAchievementDate(formData.achievement_date)
                          : "Today"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-[11px] text-slate-400 text-center">
                  This preview reflects the editorial card displayed on the archive wall.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. EDITORIAL DETAIL VIEW MODAL                                */}
      {/* ------------------------------------------------------------- */}
      {isViewModalOpen && viewingAchievement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                  {viewingAchievement.category || "Recognition"}
                </span>
                {viewingAchievement.is_published ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                    Draft
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Editorial Content */}
            <div className="p-6 space-y-5">
              {viewingAchievement.imageUrl && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 max-h-72 overflow-hidden flex items-center justify-center">
                  <img
                    src={viewingAchievement.imageUrl}
                    alt={viewingAchievement.title}
                    className="max-h-64 max-w-full object-contain rounded-lg"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900 leading-snug">
                  {viewingAchievement.title}
                </h3>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Conferred: {viewingAchievement.formattedDate}</span>
                  </div>
                  {viewingAchievement.unitLabel && (
                    <div className="flex items-center gap-1 font-medium text-slate-700">
                      <span>{viewingAchievement.unitLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              {viewingAchievement.personName && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center space-x-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {viewingAchievement.personName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {viewingAchievement.personName}
                    </div>
                    {viewingAchievement.personDesignation && (
                      <div className="text-[11px] text-slate-500">
                        {viewingAchievement.personDesignation}
                        {viewingAchievement.personUnit ? ` &bull; ${viewingAchievement.personUnit}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Achievement Narrative & Details
                </h4>
                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {viewingAchievement.description || "No detailed description recorded."}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Created: {formatAchievementDate(viewingAchievement.created_at)}</span>
                <span>Last Updated: {formatAchievementDate(viewingAchievement.updated_at)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const item = viewingAchievement;
                  handleCloseViewModal();
                  handleOpenEditModal(item);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Recognition</span>
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
      {/* 6. DELETE CONFIRMATION MODAL                                  */}
      {/* ------------------------------------------------------------- */}
      {isDeleteModalOpen && achievementToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Delete Achievement?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-slate-700">
                    "{achievementToDelete.title}"
                  </span>
                  ? This milestone will be removed from the archive. This action cannot be undone.
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
                  <span>Delete Achievement</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. FIXED FLOATING ACTION MENU POPOVER                         */}
      {/* ------------------------------------------------------------- */}
      {activeMenuId && activeMenuAchievement && menuPos && (
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
                const item = activeMenuAchievement;
                setActiveMenuId(null);
                setActiveMenuAchievement(null);
                handleOpenViewModal(item);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>View Recognition</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const item = activeMenuAchievement;
                setActiveMenuId(null);
                setActiveMenuAchievement(null);
                handleOpenEditModal(item);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Edit Milestone</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const item = activeMenuAchievement;
                handleTogglePublish(item);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
            >
              <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {activeMenuAchievement.is_published ? "Unpublish (Draft)" : "Publish"}
              </span>
            </button>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                const item = activeMenuAchievement;
                handleOpenDeleteModal(item);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Delete Achievement</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
