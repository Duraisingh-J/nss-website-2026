/**
 * Mathematical utilities for calculating photo trajectories and Konark Wheel geometric layout
 */

export function getScatterPositions(count, isMobile = false) {
  // Predefined organic scattered layout offsets around viewport
  const baseScatter = [
    { x: -38, y: -28, r: -8, s: 1.05, z: 1 },
    { x: 36, y: -32, r: 12, s: 0.95, z: 2 },
    { x: -44, y: 15, r: 6, s: 1.1, z: 3 },
    { x: 40, y: 18, r: -14, s: 1.0, z: 1 },
    { x: -20, y: -38, r: 4, s: 0.9, z: 2 },
    { x: 22, y: -36, r: -9, s: 0.95, z: 3 },
    { x: -32, y: 34, r: -6, s: 1.05, z: 1 },
    { x: 30, y: 35, r: 8, s: 0.9, z: 2 },
    { x: -8, y: 40, r: -12, s: 1.0, z: 3 },
    { x: 8, y: -42, r: 10, s: 0.95, z: 1 },
    { x: -48, y: -6, r: 15, s: 0.85, z: 2 },
    { x: 46, y: -8, r: -7, s: 0.9, z: 3 },
  ];

  return Array.from({ length: count }, (_, i) => {
    const base = baseScatter[i % baseScatter.length];
    const mobileScale = isMobile ? 0.75 : 1.0;
    return {
      x: base.x * mobileScale,
      y: base.y * mobileScale,
      rotate: base.r,
      scale: (isMobile ? base.s * 0.75 : base.s),
      zIndex: base.z
    };
  });
}

/**
 * Calculates Konark Wheel circular perimeter coordinates
 * The 12/8 photo tiles lock into the outer wheel perimeter of the NSS emblem
 */
export function getWheelPositions(count, radius = 180, isMobile = false) {
  const actualRadius = isMobile ? Math.min(radius, 120) : radius;
  
  return Array.from({ length: count }, (_, i) => {
    const angleDeg = (i / count) * 360 - 90; // Start at 12 o'clock
    const angleRad = (angleDeg * Math.PI) / 180;
    
    const x = Math.cos(angleRad) * actualRadius;
    const y = Math.sin(angleRad) * actualRadius;
    
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      rotate: angleDeg + 90, // Orient tangent to circumference
      scale: isMobile ? 0.5 : 0.65,
      angleDeg
    };
  });
}

/**
 * Clamps value between min and max
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
