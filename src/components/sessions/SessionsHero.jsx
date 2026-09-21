import React from "react";

/**
 * SessionsHero — Editorial NSS Schedule Introduction
 * 
 * Clean, institutional, editorial design matching the official NSS visual identity.
 * Features dominant typography, secondary editorial statement, clear informative description,
 * subtle navigation preview context line, and refined visual composition.
 */
export default function SessionsHero() {
  return (
    <header className="sessions-editorial-hero" aria-label="NSS Schedule Introduction">
      <div className="sessions-hero-inner">
        {/* Left Column: Clear Typographic Hierarchy */}
        <div className="sessions-hero-text-col">
          {/* Eyebrow / Kicker */}
          <div className="sessions-hero-eyebrow-row">
            <span className="sessions-hero-eyebrow-dash" aria-hidden="true" />
            <span className="sessions-hero-eyebrow">NSS SCHEDULE</span>
          </div>

          {/* Dominant Main Heading */}
          <h1 className="sessions-hero-main-heading font-editorial">
            Sessions
          </h1>

          {/* Secondary Editorial Subheading */}
          <h2 className="sessions-hero-subheading font-editorial">
            Where service takes <em>shape.</em>
          </h2>

          {/* Concrete, Readable Description */}
          <p className="sessions-hero-description">
            Explore NSS camps, community outreach, village visits and
            student-led initiatives happening across the MIT Campus community.
          </p>

          {/* Subtle Context Navigation Preview */}
          <div className="sessions-hero-context-line" aria-label="Session categories overview">
            <span className="context-item">CAMPS</span>
            <span className="context-sep" aria-hidden="true">·</span>
            <span className="context-item">OUTREACH</span>
            <span className="context-sep" aria-hidden="true">·</span>
            <span className="context-item">COMMUNITY</span>
            <span className="context-sep" aria-hidden="true">·</span>
            <span className="context-item">STUDENT INITIATIVES</span>
          </div>
        </div>

        {/* Right Column: Refined Editorial Visual Composition */}
        <div className="sessions-hero-visual-col" aria-hidden="true">
          {/* Architectural Vertical Accents */}
          <div className="sessions-hero-bars">
            <div className="hero-bar hero-bar--gray" />
            <div className="hero-bar hero-bar--red" />
          </div>

          {/* Volunteer Photo Card */}
          <div className="sessions-hero-photo-wrap">
            <img
              src={`${process.env.PUBLIC_URL}/images/sessions-hero-volunteers.jpg`}
              alt="NSS student volunteers during community outreach"
              className="sessions-hero-photo"
              onError={(e) => {
                // Fallback if needed
                e.currentTarget.src = `${process.env.PUBLIC_URL}/images/hero-placeholder.jpg`;
              }}
            />
          </div>

          {/* Attached Dark Navy Editorial Statement Card */}
          <div className="sessions-hero-navy-card">
            <div className="hero-card-words font-editorial">
              <span>People</span>
              <span>Communities</span>
              <span>Change</span>
              <span className="hero-card-emphasis">Together.</span>
            </div>
            <div className="hero-card-dash" />
          </div>

          {/* Botanical Accent & Thought */}
          <div className="sessions-hero-botanical-panel">
            <svg
              className="sessions-botanical-icon"
              viewBox="0 0 100 120"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M50 115 C50 80, 50 40, 75 10" />
              <path d="M54 90 C68 85, 76 72, 70 60 C64 48, 52 65, 52 75" />
              <path d="M48 70 C32 65, 24 52, 30 40 C36 28, 46 45, 48 55" />
              <path d="M56 45 C70 40, 78 28, 72 18 C66 8, 54 25, 54 35" />
              <path d="M68 20 C78 12, 85 5, 80 2" />
            </svg>
            <p className="sessions-botanical-quote font-editorial">
              A kinder<br />tomorrow<br />is a practice<br />today.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
