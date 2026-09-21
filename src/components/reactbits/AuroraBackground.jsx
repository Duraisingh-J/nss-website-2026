import React from "react";

/**
 * AuroraBackground — React Bits ambient glowing light mesh and dot-matrix blueprint pattern.
 *
 * Props:
 *  children   {node}
 *  className  {string}
 *  showGrid   {boolean}
 */
export default function AuroraBackground({
  children,
  className = "",
  showGrid = true,
  glowColors = {
    primary: "rgba(217, 75, 75, 0.14)",
    secondary: "rgba(23, 74, 126, 0.18)",
    accent: "rgba(245, 158, 11, 0.12)",
  },
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Ambient Moving Aurora Mesh */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-70 animate-aurora-slow z-0"
        style={{ background: glowColors.secondary }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-20 -right-20 w-[550px] h-[550px] rounded-full blur-3xl opacity-60 animate-aurora-medium z-0"
        style={{ background: glowColors.primary }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full blur-3xl opacity-40 animate-aurora-fast z-0"
        style={{ background: glowColors.accent }}
        aria-hidden="true"
      />

      {/* Subtle Blueprint Dot Grid */}
      {showGrid && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.14) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Content Slot */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
