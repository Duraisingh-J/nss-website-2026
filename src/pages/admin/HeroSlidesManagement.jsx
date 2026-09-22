import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Upload,
  MoreVertical,
  GripVertical,
  Calendar,
  Globe,
  Monitor,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import HeroSlidePreviewCard from "../../components/admin/HeroSlidePreviewCard";
import {
  getAdminHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  togglePublishHeroSlide,
  reorderHeroSlides,
} from "../../services/heroSlideService";
import "../../styles/admin.css";

export default function HeroSlidesManagement() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  // Create / Edit modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null); // null = new slide
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    button_text: "Explore Our Work",
    button_url: "/events",
    start_at: "",
    end_at: "",
    is_published: true,
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState("desktop"); // "desktop" | "mobile"
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Fullscreen Preview Modal
  const [previewModalSlide, setPreviewModalSlide] = useState(null);
  const [previewModalMode, setPreviewModalMode] = useState("desktop");

  // Floating 3-dot Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const menuRef = useRef(null);

  // Delete confirmation modal state
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Load slides from Supabase ──────────────────────────────────────
  const loadSlides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminHeroSlides();
      setSlides(data);
    } catch (err) {
      console.error("Failed to load hero slides:", err);
      setError("Unable to load hero slides from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  // Close 3-dot action menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (activeMenuId && !e.target.closest(".hero-action-menu") && !e.target.closest(".action-menu-btn")) {
        setActiveMenuId(null);
        setMenuPos(null);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [activeMenuId]);

  // Clean up object URLs when unmounting or changing images
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // ── Form & Editor Management ───────────────────────────────────────
  const handleOpenCreateModal = () => {
    setEditingSlide(null);
    setFormData({
      title: "NSS MIT",
      subtitle: "Serving Society",
      description:
        "The National Service Scheme at MIT Campus, Anna University empowers students to contribute to society through community service, awareness programmes and nation-building initiatives.",
      button_text: "Explore Our Work",
      button_url: "/events",
      start_at: "",
      end_at: "",
      is_published: true,
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setFormErrors({});
    setIsDirty(false);
    setPreviewMode("desktop");
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      description: slide.description || "",
      button_text: slide.button_text || "",
      button_url: slide.button_url || "",
      start_at: slide.start_at ? slide.start_at.substring(0, 16) : "",
      end_at: slide.end_at ? slide.end_at.substring(0, 16) : "",
      is_published: slide.is_published,
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(slide.imageUrl || null);
    setFormErrors({});
    setIsDirty(false);
    setPreviewMode("desktop");
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      setIsEditorOpen(false);
      setEditingSlide(null);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    setIsEditorOpen(false);
    setEditingSlide(null);
    setIsDirty(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        image: "Please choose a valid image file (JPEG, PNG, WebP).",
      }));
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        image: "Image size exceeds 12MB limit.",
      }));
      return;
    }

    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setImagePreviewUrl(objectUrl);
    setIsDirty(true);
    setFormErrors((prev) => {
      const rest = { ...prev };
      delete rest.image;
      return rest;
    });
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSaveSlide = async (e) => {
    e.preventDefault();

    // Field Validations
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Headline title is required.";
    }
    if (!formData.subtitle.trim()) {
      errors.subtitle = "Subtitle/focus area is required.";
    }
    if (!editingSlide && !selectedImageFile) {
      errors.image = "A landscape hero image is required.";
    }
    if (formData.start_at && formData.end_at) {
      if (new Date(formData.end_at) <= new Date(formData.start_at)) {
        errors.end_at = "End date must be after start date.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSaving(true);
      if (editingSlide) {
        // Update existing slide
        const updated = await updateHeroSlide(
          editingSlide.id,
          {
            ...formData,
            media_id: editingSlide.media_id,
            priority: editingSlide.priority,
          },
          selectedImageFile
        );

        setSlides((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        showToast("Hero slide updated successfully!");
      } else {
        // Create new slide with initial priority
        const highestPriority =
          slides.length > 0
            ? Math.max(...slides.map((s) => s.priority || 0)) + 10
            : 10;

        const created = await createHeroSlide(
          {
            ...formData,
            priority: highestPriority,
          },
          selectedImageFile
        );

        setSlides((prev) => [created, ...prev]);
        showToast("Hero slide created successfully!");
      }

      setIsEditorOpen(false);
      setEditingSlide(null);
      setIsDirty(false);
    } catch (saveErr) {
      console.error("Failed to save hero slide:", saveErr);
      showToast(saveErr.message || "Failed to save slide.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Publication Toggle ─────────────────────────────────────────────
  const handleTogglePublish = async (slide) => {
    try {
      const updated = await togglePublishHeroSlide(slide.id, slide.is_published);
      setSlides((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      showToast(
        updated.is_published
          ? "Slide published to website homepage!"
          : "Slide moved to draft (hidden from public)."
      );
    } catch (err) {
      console.error("Error toggling publication:", err);
      showToast("Failed to change publication status.", "error");
    }
  };

  // ── Delete Management ──────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!slideToDelete) return;
    try {
      setIsDeleting(true);
      await deleteHeroSlide(slideToDelete.id, slideToDelete.media_id);
      setSlides((prev) => prev.filter((s) => s.id !== slideToDelete.id));
      showToast("Hero slide deleted successfully.");
      setSlideToDelete(null);
    } catch (err) {
      console.error("Error deleting slide:", err);
      showToast("Failed to delete hero slide.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Drag and Drop Reordering ───────────────────────────────────────
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...slides];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setSlides(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      setIsReordering(true);
      await reorderHeroSlides(reordered);
      showToast("Slide order saved to website!");
    } catch (err) {
      console.error("Failed to persist slide order:", err);
      showToast("Could not save reordered sequence.", "error");
      loadSlides(); // Revert on failure
    } finally {
      setIsReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ── Floating Action Menu Trigger ───────────────────────────────────
  const handleOpenActionMenu = (e, slide) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
    setActiveMenuId(slide.id);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      
      {/* ── Toast Notification ──────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-lg shadow-xl text-white text-xs font-semibold flex items-center gap-2 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "error" ? "bg-red-700" : "bg-slate-900 border border-slate-700"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-300" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
                  <Layers className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                    HERO SLIDES
                  </h1>
                </div>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Manage the visual stories displayed across the NSS website homepage.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadSlides}
                disabled={loading}
                title="Refresh slides"
                className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-600" : ""}`} />
              </button>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-red-700 hover:bg-red-800 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white shrink-0" />
                <span className="text-white">Add Hero Slide</span>
              </button>
            </div>

          </div>

          {/* Institutional Integration Notice */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-700">Homepage Hero</span>
              <span className="text-slate-400">·</span>
              <span>Changes saved here are dynamically reflected on the public website.</span>
            </div>
            {isReordering ? (
              <span className="text-red-600 font-semibold font-mono text-[10px] animate-pulse">
                Saving sequence to website...
              </span>
            ) : slides.length > 1 ? (
              <span className="text-slate-400 font-mono text-[10px]">
                Tip: Drag slides to reorder display sequence
              </span>
            ) : null}
          </div>

        </div>
      </div>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadSlides}
              className="font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-6 bg-slate-200 rounded" />
                  <div className="w-20 h-5 bg-slate-200 rounded-full" />
                </div>
                <div className="w-full aspect-[16/9] max-h-[340px] bg-slate-200 rounded-xl mb-4" />
                <div className="w-1/3 h-5 bg-slate-200 rounded mb-2" />
                <div className="w-1/4 h-4 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ── Visual Slide Board ────────────────────────────────────── */}
        {!loading && slides.length > 0 && (
          <div className="space-y-6">
            {slides.map((slide, index) => {
              const formattedIndex = String(index + 1).padStart(2, "0");
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <div
                  key={slide.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                    isDragging
                      ? "opacity-40 scale-[0.99] border-dashed border-red-400 shadow-none"
                      : isOver
                      ? "border-red-500 ring-2 ring-red-500/20 translate-y-1"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="p-5 sm:p-7">
                    
                    {/* Top Row: Index, Status Badge, Drag Handle & Actions */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        {/* Drag Handle */}
                        <div
                          title="Drag to reorder"
                          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-1 -ml-1 rounded transition-colors"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Editorial Number */}
                        <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                          {formattedIndex}
                        </span>

                        {/* Order Priority Tag */}
                        <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                          Priority {slide.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Published Status Marker */}
                        {slide.is_published ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Published</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Draft</span>
                          </span>
                        )}

                        {/* Scheduling pill if active */}
                        {(slide.start_at || slide.end_at) && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Scheduled</span>
                          </span>
                        )}

                        {/* 3-Dot Action Button */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenActionMenu(e, slide)}
                          className="action-menu-btn p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Slide actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ── Slide Hero Preview Card ─────────────────── */}
                    <div
                      onClick={() => setPreviewModalSlide(slide)}
                      className="cursor-pointer group/preview relative overflow-hidden rounded-xl"
                    >
                      <HeroSlidePreviewCard slide={slide} mode="desktop" />
                      
                      {/* Hover Overlay Hint */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/95 text-slate-900 text-xs font-semibold shadow-xl backdrop-blur-sm">
                          <Eye className="w-3.5 h-3.5 text-red-600" />
                          <span>Click to Preview Simulation</span>
                        </span>
                      </div>
                    </div>

                    {/* ── Card Footer: Title & Actions ────────────── */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold font-serif text-slate-900">
                          {slide.title} &nbsp;·&nbsp;{" "}
                          <span className="font-sans font-normal text-slate-600 text-sm">
                            {slide.subtitle}
                          </span>
                        </h3>
                        {slide.button_url && (
                          <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                            <span>CTA:</span>
                            <span className="text-slate-600 font-semibold">{slide.button_text}</span>
                            <span>→</span>
                            <span>{slide.button_url}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewModalSlide(slide)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(slide)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-900 hover:text-white bg-slate-100 hover:bg-slate-900 transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Slide →</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Onboarding / Empty State ──────────────────────────────── */}
        {!loading && slides.length === 0 && (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 sm:p-14 text-center max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-inner">
              <Layers className="w-8 h-8 text-red-600" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              HOMEPAGE HERO
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mb-2">
              No hero slides have been created yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
              Add your first visual hero slide to begin building the official NSS homepage experience. Slides will dynamically cycle across the top of the website.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-700 hover:bg-red-800 shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white shrink-0" />
              <span className="text-white">Add Hero Slide</span>
            </button>
          </div>
        )}

      </main>

      {/* ── 3-Dot Floating Action Menu Popover ──────────────────────── */}
      {activeMenuId && menuPos && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: `${menuPos.top}px`,
            right: `${menuPos.right}px`,
            zIndex: 9999,
          }}
          className="hero-action-menu w-48 rounded-xl shadow-2xl bg-white border border-slate-200 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
        >
          {(() => {
            const slide = slides.find((s) => s.id === activeMenuId);
            if (!slide) return null;

            return (
              <>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenuId(null);
                      setPreviewModalSlide(slide);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Preview Simulation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenuId(null);
                      handleOpenEditModal(slide);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Slide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenuId(null);
                      handleTogglePublish(slide);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slide.is_published ? "Unpublish (Move to Draft)" : "Publish to Website"}</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenuId(null);
                      setSlideToDelete(slide);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete Slide</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ── Two-Panel Studio Editor Modal ───────────────────────────── */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <Layers className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-serif text-slate-900">
                    {editingSlide ? "EDIT HERO SLIDE" : "CREATE HERO SLIDE"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Changes preview live in real time before persisting to Supabase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseEditor}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Two-Panel Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              
              {/* Left Panel: Form Controls */}
              <form onSubmit={handleSaveSlide} className="lg:col-span-6 p-6 space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Headline Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="e.g. NSS MIT"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                      formErrors.title
                        ? "border-red-400 focus:ring-red-200 bg-red-50/30"
                        : "border-slate-300 focus:border-slate-800 focus:ring-slate-200"
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Subtitle / Emphasis Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subtitle}
                    onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                    placeholder="e.g. Serving Society"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                      formErrors.subtitle
                        ? "border-red-400 focus:ring-red-200 bg-red-50/30"
                        : "border-slate-300 focus:border-slate-800 focus:ring-slate-200"
                    }`}
                  />
                  {formErrors.subtitle && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.subtitle}</p>
                  )}
                </div>

                {/* Supporting Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Supporting Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Short paragraph describing this initiative or motto..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-200 focus:outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Keep to 1–2 sentences for optimal readability over background imagery.
                  </p>
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Hero Slide Image {!editingSlide && <span className="text-red-500">*</span>}
                  </label>
                  <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-50 transition-colors text-center relative">
                    <input
                      type="file"
                      id="hero-image-input"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 mb-2">
                        <Upload className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {selectedImageFile
                          ? selectedImageFile.name
                          : editingSlide
                          ? "Click to replace hero background image"
                          : "Click to upload hero background image"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Recommended: 16:9 / wide landscape (e.g. 1920×1080 WebP, JPEG, PNG up to 12MB)
                      </span>
                    </div>
                  </div>
                  {formErrors.image && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.image}</p>
                  )}
                </div>

                {/* Call to Action Button fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={formData.button_text}
                      onChange={(e) => handleFieldChange("button_text", e.target.value)}
                      placeholder="e.g. Explore Our Work"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Button Destination URL
                    </label>
                    <input
                      type="text"
                      value={formData.button_url}
                      onChange={(e) => handleFieldChange("button_url", e.target.value)}
                      placeholder="e.g. /events or https://..."
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Scheduling: Start & End Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Display Start Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_at}
                      onChange={(e) => handleFieldChange("start_at", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Display End Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_at}
                      onChange={(e) => handleFieldChange("end_at", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-slate-800 focus:outline-none"
                    />
                    {formErrors.end_at && (
                      <p className="text-[10px] text-red-600 mt-1">{formErrors.end_at}</p>
                    )}
                  </div>
                </div>

                {/* Publication Toggle Checkbox */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => handleFieldChange("is_published", e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Publish immediately to public website homepage
                    </span>
                  </label>
                </div>

              </form>

              {/* Right Panel: Live Hero Preview */}
              <div className="lg:col-span-6 p-6 bg-slate-900/5 flex flex-col justify-between">
                <div>
                  {/* Preview Toolbar */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Simulation Preview</span>
                    </span>

                    {/* Desktop / Mobile Switcher */}
                    <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200 text-slate-600 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("desktop")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                          previewMode === "desktop"
                            ? "bg-white text-slate-900 shadow-sm font-bold"
                            : "hover:text-slate-900"
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Desktop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("mobile")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                          previewMode === "mobile"
                            ? "bg-white text-slate-900 shadow-sm font-bold"
                            : "hover:text-slate-900"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>

                  {/* Render Live Hero Preview Card */}
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                    <HeroSlidePreviewCard
                      slide={{
                        ...formData,
                        imageUrl: imagePreviewUrl,
                      }}
                      mode={previewMode}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 text-center mt-3 font-mono">
                    Visual preview updates live as you type or change background images.
                  </p>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseEditor}
                    disabled={isSaving}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSlide}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>{editingSlide ? "Saving Changes..." : "Creating Slide..."}</span>
                      </>
                    ) : (
                      <span>{editingSlide ? "Save Changes" : "Create Slide"}</span>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── Fullscreen Simulation Preview Modal ──────────────────────── */}
      {previewModalSlide && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <h3 className="text-sm font-bold font-serif">
                  HOMEPAGE HERO PREVIEW SIMULATION
                </h3>
                <p className="text-[11px] text-slate-400">
                  {previewModalSlide.title} &nbsp;·&nbsp; {previewModalSlide.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewModalMode("desktop")}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                      previewModalMode === "desktop"
                        ? "bg-red-700 text-white font-bold"
                        : "hover:text-white"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop (16:9)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewModalMode("mobile")}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                      previewModalMode === "mobile"
                        ? "bg-red-700 text-white font-bold"
                        : "hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (9:16)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewModalSlide(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex items-center justify-center bg-slate-950">
              <HeroSlidePreviewCard
                slide={previewModalSlide}
                mode={previewModalMode}
                className="shadow-2xl"
              />
            </div>

          </div>
        </div>
      )}

      {/* ── Discard Unsaved Changes Modal ────────────────────────────── */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Discard unsaved changes?
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Any modifications made to this slide will be lost.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────── */}
      {slideToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete hero slide?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This slide will no longer be available for the website homepage. Its background media asset will also be removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSlideToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Hero Slide</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
