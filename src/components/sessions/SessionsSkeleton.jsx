import React from "react";

/**
 * SessionsSkeleton — Clean skeleton loader matching the 5-section journal layout.
 */
export default function SessionsSkeleton() {
  return (
    <div className="journal-skeleton-wrap" aria-label="Loading activity schedule...">
      {/* Featured Box Skeleton */}
      <div className="skeleton-featured-card">
        <div className="skeleton-featured-left">
          <div className="skeleton-line skeleton-img-box" />
        </div>
        <div className="skeleton-featured-right">
          <div className="skeleton-line skeleton-tag" />
          <div className="skeleton-line skeleton-title-lg" />
          <div className="skeleton-line skeleton-sub-md" />
          <div className="skeleton-row">
            <div className="skeleton-line skeleton-chip" />
            <div className="skeleton-line skeleton-chip" />
            <div className="skeleton-line skeleton-chip" />
          </div>
        </div>
      </div>

      {/* Activity Stream Skeleton Rows */}
      <div className="skeleton-stream-wrap">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton-stream-row">
            <div className="skeleton-stream-date">
              <div className="skeleton-line skeleton-day" />
              <div className="skeleton-line skeleton-month" />
            </div>
            <div className="skeleton-stream-info">
              <div className="skeleton-line skeleton-cat" />
              <div className="skeleton-line skeleton-title-sm" />
              <div className="skeleton-line skeleton-meta-sm" />
            </div>
            <div className="skeleton-stream-action">
              <div className="skeleton-line skeleton-btn" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
