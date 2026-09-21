import React from "react";
import { Sparkles, CalendarDays } from "lucide-react";

export const CATEGORIES = [
  { id: "all", label: "ALL", index: "01" },
  { id: "camp", label: "CAMPS", index: "02" },
  { id: "outreach", label: "OUTREACH", index: "03" },
  { id: "visit", label: "ORPHANAGE", index: "04" },
  { id: "monthly", label: "MONTHLY", index: "05" },
];

/**
 * ActivityExplorer — Premium sticky glassmorphism activity navigation bar.
 *
 * Props:
 *  activeCategory {string}
 *  onSelectCategory {function}
 *  viewMode {string} "upcoming" | "all"
 *  onSelectViewMode {function}
 */
export default function ActivityExplorer({
  activeCategory,
  onSelectCategory,
  viewMode,
  onSelectViewMode,
}) {
  return (
    <nav className="journal-explorer-bar" aria-label="Activity Discovery Navigation">
      <div className="journal-explorer-container">
        
        {/* Left: Category Navigation */}
        <div className="explorer-left-group">
          <div className="explorer-title-tag">
            <span className="tag-dot" aria-hidden="true" />
            <span className="tag-label">EXPLORE</span>
          </div>

          <div className="explorer-category-links" role="tablist" aria-label="Filter by activity category">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`explorer-cat-btn ${isActive ? "explorer-cat-btn--active" : ""}`}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <span className="cat-index">{cat.index}</span>
                  <span className="cat-text">{cat.label}</span>
                  {isActive && <span className="cat-active-line" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Scope Switcher */}
        <div className="explorer-right-group">
          <div className="explorer-scope-switch" role="group" aria-label="Filter schedule scope">
            <button
              type="button"
              className={`scope-switch-btn ${viewMode === "upcoming" ? "scope-switch-btn--active" : ""}`}
              onClick={() => onSelectViewMode("upcoming")}
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>UPCOMING</span>
            </button>
            <button
              type="button"
              className={`scope-switch-btn ${viewMode === "all" ? "scope-switch-btn--active" : ""}`}
              onClick={() => onSelectViewMode("all")}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>ALL ARCHIVE</span>
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}
