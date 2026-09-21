import React from "react";
import { Sparkles, Archive } from "lucide-react";

export const CATEGORIES = [
  { id: "all", label: "ALL" },
  { id: "camp", label: "CAMPS" },
  { id: "outreach", label: "OUTREACH" },
  { id: "visit", label: "ORPHANAGE VISITS" },
  { id: "monthly", label: "MONTHLY EVENTS" },
];

/**
 * ActivityFilters — Modern editorial navigation bar.
 *
 * Props:
 *  activeCategory {string}
 *  onSelectCategory {function}
 *  viewMode {string} "upcoming" | "all"
 *  onSelectViewMode {function}
 */
export default function ActivityFilters({
  activeCategory,
  onSelectCategory,
  viewMode,
  onSelectViewMode,
}) {
  return (
    <section className="activity-nav-section" aria-label="Activity Filters and Navigation">
      <div className="activity-nav-container">
        
        {/* Left Side: Category Filter Scroll */}
        <div className="activity-filters-group">
          <span className="activity-filters-label">EXPLORE ACTIVITIES</span>
          <div className="activity-filters-pills" role="tablist" aria-label="Filter activities by category">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`filter-pill-btn ${isActive ? "filter-pill-btn--active" : ""}`}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Scope Toggle */}
        <div className="activity-scope-group">
          <div className="scope-segmented-control" role="group" aria-label="Activity scope">
            <button
              type="button"
              className={`scope-control-btn ${viewMode === "upcoming" ? "scope-control-btn--active" : ""}`}
              onClick={() => onSelectViewMode("upcoming")}
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>UPCOMING</span>
            </button>
            <button
              type="button"
              className={`scope-control-btn ${viewMode === "all" ? "scope-control-btn--active" : ""}`}
              onClick={() => onSelectViewMode("all")}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>ALL ACTIVITIES</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
