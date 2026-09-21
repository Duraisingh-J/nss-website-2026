import React, { useRef, useState, useCallback } from "react";

/**
 * SpotlightCard — React Bits inspired interactive mouse-tracking spotlight card.
 *
 * Props:
 *  children      {node}
 *  className     {string}
 *  spotlightColor {string} rgba color for the radial glow (default: rgba(217, 75, 75, 0.15))
 *  borderColor   {string} rgba color for the border highlight (default: rgba(217, 75, 75, 0.35))
 *  onClick       {function}
 */
export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(217, 75, 75, 0.12)",
  borderColor = "rgba(217, 75, 75, 0.3)",
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Dynamic radial glow overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Dynamic border spotlight highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-0"
        style={{
          opacity,
          border: `1px solid ${borderColor}`,
          maskImage: `radial-gradient(280px circle at ${position.x}px ${position.y}px, black, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(280px circle at ${position.x}px ${position.y}px, black, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Card Content Slot */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
