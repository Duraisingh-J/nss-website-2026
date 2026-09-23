import React from "react";
import "./PageHero.css";

/**
 * PageHero — Reusable hero/header section used across public pages.
 *
 * Props:
 *  watermark  {string}  Large decorative background text (e.g. "TEAM", "EVENTS")
 *  eyebrow    {string}  Small uppercase pill label (e.g. "OUR PEOPLE")
 *  title      {string}  Main page heading
 *  description {string} Supporting subtitle text
 *  children   {node}   Optional slot for extra controls (e.g. year pill selectors)
 */
export default function PageHero({
  watermark,
  eyebrow,
  title,
  statement,
  description,
  children,
  className = "",
}) {
  return (
    <header className={`page-hero ${className}`.trim()}>
      <div className="page-hero__shell">
        <div className="page-hero__content">
          {/* Optional eyebrow pill */}
          {eyebrow && (
            <div className="page-hero__eyebrow">
              <span className="page-hero__eyebrow-dot" aria-hidden="true" />
              <strong>{eyebrow}</strong>
            </div>
          )}

          {/* Main title */}
          {title && <h1 className="page-hero__title">{title}</h1>}

          {/* Poetic statement */}
          {statement && (
            <div className="page-hero__statement">
              {statement}
            </div>
          )}

          {/* Subtitle description */}
          {description && (
            <p className="page-hero__subtitle">{description}</p>
          )}

          {/* Optional extra controls slot */}
          {children && (
            <div className="page-hero__controls">
              {children}
            </div>
          )}
        </div>

        {/* Background watermark */}
        {watermark && (
          <div className="page-hero__watermark" aria-hidden="true">
            {watermark}
          </div>
        )}
      </div>
    </header>
  );
}
