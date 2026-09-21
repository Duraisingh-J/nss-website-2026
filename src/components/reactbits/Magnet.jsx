import React, { useRef, useState, useCallback } from "react";

/**
 * Magnet — React Bits magnetic pull container for buttons and badges.
 *
 * Props:
 *  children   {node}
 *  padding    {number} Distance threshold in px (default: 50)
 *  strength   {number} Pull strength factor (default: 0.25)
 *  className  {string}
 */
export default function Magnet({
  children,
  padding = 40,
  strength = 0.25,
  className = "",
  disabled = false,
  ...props
}) {
  const magnetRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (disabled || !magnetRef.current) return;
    const rect = magnetRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    if (Math.abs(distX) < rect.width / 2 + padding && Math.abs(distY) < rect.height / 2 + padding) {
      setOffset({
        x: distX * strength,
        y: distY * strength,
      });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [disabled, padding, strength]);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={magnetRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: offset.x === 0 && offset.y === 0 ? "transform 0.4s ease-out" : "transform 0.1s ease-out",
      }}
      className={`inline-block will-change-transform ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
