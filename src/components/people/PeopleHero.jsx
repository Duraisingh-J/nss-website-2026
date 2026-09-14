import React from "react";
import "./PeopleHero.css";

/**
 * PeopleHero
 * Editorial hero section with subtle entrance animation and oversized 'TEAM' watermark.
 */
export default function PeopleHero() {
  return (
    <section className="people-hero">
      {/* Background Watermark */}
      <div className="people-hero__watermark" aria-hidden="true">
        TEAM
      </div>

      <div className="people-hero__inner">
        <div className="people-hero__eyebrow">
          <span className="people-hero__eyebrow-dot" />
          The Team
        </div>
        <h1 className="people-hero__title">OUR PEOPLE</h1>
        <p className="people-hero__subtitle">
          Meet the dedicated faculty leaders and student coordinators driving
          NSS at Madras Institute of Technology, Anna University.
        </p>
      </div>
    </section>
  );
}
