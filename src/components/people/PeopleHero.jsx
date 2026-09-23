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
      title="PEOPLE"
      statement={
        <>
          Leadership, driven <em>by service.</em>
        </>
      }
      description="Meet the dedicated faculty leaders, programme officers, and student coordinators driving NSS at Madras Institute of Technology, Anna University."
      watermark="PEOPLE"
    />
  );
}
