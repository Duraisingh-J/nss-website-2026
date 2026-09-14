import React from "react";
import "./PeopleSection.css";

/**
 * PeopleSection
 * Section wrapper with eyebrow, title, thin red gradient line and balanced spacing.
 */
export default function PeopleSection({
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  id,
}) {
  return (
    <section className={`people-section ${className}`} id={id}>
      <div className="people-section__header">
        {eyebrow && <div className="people-section__eyebrow">{eyebrow}</div>}
        <div className="people-section__title-row">
          <h2 className="people-section__title">{title}</h2>
          <div className="people-section__line" />
        </div>
        {subtitle && <p className="people-section__subtitle">{subtitle}</p>}
      </div>

      <div className="people-section__content">{children}</div>
    </section>
  );
}
