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
export default function PageHero({ watermark, eyebrow, title, description, children }) {
  return (
    <section className="page-hero">
      {/* Background watermark — decorative, hidden from screen readers */}
      {watermark && (
        <div className="page-hero__watermark" aria-hidden="true">
          {watermark}
        </div>
      )}

      <div className="page-hero__inner">
        {/* Eyebrow pill */}
        {eyebrow && (
          <div className="page-hero__eyebrow">
            <span className="page-hero__eyebrow-dot" aria-hidden="true" />
            {eyebrow}
          </div>
        )}

        {/* Page heading */}
        {title && <h1 className="page-hero__title">{title}</h1>}

        {/* Description */}
        {description && (
          <p className="page-hero__subtitle">{description}</p>
        )}

        {/* Optional extra content slot (e.g. year filter pills) */}
        {children && (
          <div className="page-hero__controls">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
