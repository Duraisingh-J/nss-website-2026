import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure ScrollTrigger is registered once globally
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Checks if the user prefers reduced motion
 * @returns {boolean}
 */
export function isReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const ANIMATION_CONFIG = {
  duration: 0.75,
  ease: "power2.out",
  stagger: 0.1,
};

export { gsap, ScrollTrigger };
