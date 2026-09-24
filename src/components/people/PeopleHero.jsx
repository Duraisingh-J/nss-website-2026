import React from "react";

/**
 * PeopleHero — Editorial title card for the personnel directory.
 */
export default function PeopleHero() {
  return (
    <header className="people-hero">
      <div className="people-hero__shell">
        <div className="people-hero__content">
          <div className="people-hero__statement">
          People, <em>in service.</em>
          </div>
          <p>
          Meet the dedicated faculty leaders and student coordinators driving NSS
          at Madras Institute of Technology, Anna University.
          </p>
        </div>
        <div className="people-hero__background-word" aria-hidden="true">
          PEOPLE
        </div>
      </div>
    </header>
  );
}
