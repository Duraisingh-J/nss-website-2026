import React from "react";
import PageHero from "../ui/PageHero";

/**
 * PeopleHero — Uses the shared PageHero component.
 * Keeps the TEAM watermark and OUR PEOPLE eyebrow/title hierarchy
 * with a reduced, more compact visual footprint.
 */
export default function PeopleHero() {
  return (
    <PageHero
      watermark="TEAM"
      eyebrow="The Team"
      title="OUR PEOPLE"
      description="Meet the dedicated faculty leaders and student coordinators driving NSS at Madras Institute of Technology, Anna University."
    />
  );
}
