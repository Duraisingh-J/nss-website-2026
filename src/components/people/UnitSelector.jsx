import React, { useRef, useEffect, useState } from "react";
import "./UnitSelector.css";

const UNITS = [
  { id: "Unit I", label: "Unit 01", num: "01" },
  { id: "Unit II", label: "Unit 02", num: "02" },
  { id: "Unit III", label: "Unit 03", num: "03" },
  { id: "Unit IV", label: "Unit 04", num: "04" },
  { id: "Unit V", label: "Unit 05", num: "05" },
  { id: "Unit VI", label: "Unit 06", num: "06" },
  { id: "Unit VII", label: "Unit 07", num: "07" },
];

/**
 * UnitSelector
 * Modern editorial navigation for NSS Units (01 - 07) with sliding underline indicator.
 * Horizontally scrollable on mobile without awkward wrapping.
 */
export default function UnitSelector({
  selectedUnit,
  onSelectUnit,
  yearFilter,
  onSelectYear,
}) {
  const tabsRef = useRef([]);
  const navRef = useRef(null);
  const isFirstMount = useRef(true);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = UNITS.findIndex((u) => u.id === selectedUnit);
    if (activeIndex !== -1 && tabsRef.current[activeIndex]) {
      const el = tabsRef.current[activeIndex];
      setSliderStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });

      // Prevent page auto-scrolling on initial mount
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }

      // If user deliberately changes unit, scroll only the horizontal tab container, never the window
      if (navRef.current) {
        const container = navRef.current;
        const targetScrollLeft =
          el.offsetLeft - (container.clientWidth - el.offsetWidth) / 2;
        container.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [selectedUnit]);

  return (
    <div className="unit-selector-wrapper">
      <nav
        ref={navRef}
        className="unit-selector"
        role="tablist"
        aria-label="NSS Units Navigation"
      >
        <div className="unit-selector__list">
          {UNITS.map((unit, idx) => {
            const isActive = unit.id === selectedUnit;
            return (
              <button
                key={unit.id}
                ref={(el) => (tabsRef.current[idx] = el)}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`unit-panel-${unit.num}`}
                className={`unit-selector__tab ${
                  isActive ? "unit-selector__tab--active" : ""
                }`}
                onClick={() => onSelectUnit(unit.id)}
              >
                <span className="unit-selector__tab-num">{unit.num}</span>
                <span className="unit-selector__tab-label">{unit.label}</span>
              </button>
            );
          })}

          {/* Sliding underline */}
          <div
            className="unit-selector__slider"
            style={{
              left: `${sliderStyle.left}px`,
              width: `${sliderStyle.width}px`,
            }}
          />
        </div>
      </nav>

      {/* Optional Year Filter Sub-Pills */}
      {onSelectYear && (
        <div className="unit-year-filters" role="group" aria-label="Filter by Year">
          {[
            { id: "all", label: "All Members" },
            { id: "finalYear", label: "Final Year" },
            { id: "preFinalYear", label: "Pre-Final Year" },
          ].map((yf) => (
            <button
              key={yf.id}
              type="button"
              className={`unit-year-pill ${
                yearFilter === yf.id ? "unit-year-pill--active" : ""
              }`}
              onClick={() => onSelectYear(yf.id)}
            >
              {yf.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
