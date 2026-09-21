import React, { useRef, useState, useCallback } from "react";

/**
 * TiltedCard — React Bits 3D perspective tilt effect on cursor move.
 *
 * Props:
 *  children      {node}
 *  className     {string}
 *  maxTilt       {number} Maximum tilt in degrees (default: 8)
 *  perspective   {number} CSS perspective in px (default: 1000)
 *  scale         {number} Hover scale factor (default: 1.02)
 *  onClick       {function}
 */
export default function TiltedCard({
  children,
  className = "",
  maxTilt = 7,
  perspective = 1000,
  scale = 1.015,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg) scale(1)");
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  }, [maxTilt, scale]);

  const handleMouseLeave = useCallback(() => {
    setTransform("rotateX(0deg) rotateY(0deg) scale(1)");
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className={`transition-perspective ${className}`}
      onClick={onClick}
      {...props}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative will-change-transform transition-transform duration-200 ease-out"
        style={{ transform, transformStyle: "preserve-3d" }}
      >
        {children}

        {/* Dynamic Sheen / Glare Layer */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-20"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.4), transparent 60%)`,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
