import React from "react";

/**
 * ShinyText — React Bits inspired shimmering lustrous text effect.
 *
 * Props:
 *  text       {string}
 *  disabled   {boolean}
 *  speed      {number} Animation cycle in seconds (default: 5)
 *  className  {string}
 */
export default function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
  children,
}) {
  const content = text || children;

  if (disabled) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(115deg, currentColor 0%, currentColor 38%, rgba(255, 255, 255, 0.95) 50%, currentColor 62%, currentColor 100%)`,
        backgroundSize: "220% 100%",
        animation: `shiny-sweep ${speed}s ease-in-out infinite`,
        WebkitBackgroundClip: "text",
      }}
    >
      {content}
    </span>
  );
}
