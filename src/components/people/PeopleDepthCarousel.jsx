import React, { useState, useEffect } from "react";
import DepthCarousel from "./DepthCarousel";
import ActivePersonInfo from "./ActivePersonInfo";
import { getStaffProfileUrl } from "../../data/staffProfileLinks.js";
import "./PeopleDepthCarousel.css";

/**
 * PeopleDepthCarousel
 * Two-column horizontal layout:
 * - LEFT (35%): Active person's editorial profile typography
 * - RIGHT (65%): DepthCarousel with bilateral 3D depth cards peeking out from center
 * Collapses to a single column (carousel top, info below) on mobile (< 900px).
 */
export default function PeopleDepthCarousel({
  people = [],
  fallbackRole,
  cardWidth = 280,
  cardHeight = 370,
  depth = 120,
  spread = 145,
  tilt = 9,
  visibleCards,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Track viewport width to pass correct alignment to ActivePersonInfo
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Reset activeIndex if people array changes (e.g. changing unit)
  useEffect(() => {
    setActiveIndex(0);
  }, [people]);

  if (!people || people.length === 0) {
    return null;
  }

  const count = people.length;

  const resolvedVisibleCards =
    visibleCards !== undefined
      ? visibleCards
      : count <= 2
      ? 2
      : count === 3
      ? 3
      : 5;

  const resolvedSpread =
    spread !== undefined
      ? spread
      : count <= 2
      ? 140
      : 145;

  // Format people items for DepthCarousel
  const carouselItems = people.map((p, idx) => {
    const profileUrl = (p.profileUrl || getStaffProfileUrl(p) || "").trim();
    return {
      ...p,
      id: p.id || p.reg || p.name || idx,
      profileUrl,
      badge: p.badge || p.unit || p.role || (p.year ? `${p.year}` : null),
    };
  });

  const rawActivePerson = people[activeIndex] || people[0];
  const activePerson = rawActivePerson
    ? {
        ...rawActivePerson,
        profileUrl: (
          rawActivePerson.profileUrl ||
          getStaffProfileUrl(rawActivePerson) ||
          ""
        ).trim(),
      }
    : null;

  return (
    <div className={`people-split-layout ${className}`}>
      {/* LEFT: Active Person Profile Details */}
      <div className="people-split-layout__info">
        <ActivePersonInfo
          person={activePerson}
          fallbackRole={fallbackRole}
          align={isMobile ? "center" : "left"}
        />
      </div>

      {/* RIGHT: DepthCarousel */}
      <div className="people-split-layout__carousel">
        <DepthCarousel
          items={carouselItems}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          depth={depth}
          spread={resolvedSpread}
          tilt={tilt}
          visibleCards={resolvedVisibleCards}
          falloff={0.14}
          blur={2}
          duration={0.6}
          ease="power3.out"
          loop={count >= 2}
          showControls={count > 1}
          showIndicators={count > 1}
        />
      </div>
    </div>
  );
}
