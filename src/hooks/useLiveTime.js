import { useState, useEffect, useCallback, useRef } from "react";
import { getNextTransitionBoundary } from "../utils/timeStatusUtils";

/**
 * useLiveTime — Central live time source for automatic schedule transitions.
 *
 * Features:
 * - Dynamic boundary-aware scheduling (fires at exact start_at / end_at timestamps)
 * - Tab visibility change recovery (document.visibilitychange)
 * - Window focus change recovery (window.focus)
 * - Laptop / device sleep recovery
 * - Periodic safety tick (every 30 seconds)
 * - No database polling
 *
 * @param {Array} [items=[]] - Array of events/sessions to inspect for next boundary
 * @param {number} [safetyIntervalMs=30000] - Safety fallback interval in ms (default 30s)
 * @returns {{ now: Date, refreshNow: () => void }}
 */
export default function useLiveTime(items = [], safetyIntervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  const boundaryTimerRef = useRef(null);
  const safetyTimerRef = useRef(null);

  const refreshNow = useCallback(() => {
    setNow(new Date());
  }, []);

  // 1. Tab Visibility and Window Focus listeners for instant sleep / tab-switch recovery
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setNow(new Date());
      }
    };

    const handleFocus = () => {
      setNow(new Date());
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // 2. Periodic safety interval (default 30s) to catch clock drift & system adjustments
  useEffect(() => {
    safetyTimerRef.current = setInterval(() => {
      setNow(new Date());
    }, safetyIntervalMs);

    return () => {
      if (safetyTimerRef.current) clearInterval(safetyTimerRef.current);
    };
  }, [safetyIntervalMs]);

  // 3. Smart Boundary Scheduling: Schedule timeout for the earliest upcoming transition
  useEffect(() => {
    if (boundaryTimerRef.current) {
      clearTimeout(boundaryTimerRef.current);
      boundaryTimerRef.current = null;
    }

    const nextBoundaryMs = getNextTransitionBoundary(items, now);

    if (nextBoundaryMs) {
      const nowMs = Date.now();
      // Add +50ms buffer to ensure Date.now() >= boundary when timeout executes
      const delayMs = Math.max(100, nextBoundaryMs - nowMs + 50);

      // Only schedule boundary timer if it's within a sensible window (under 24 hours)
      if (delayMs < 86400000) {
        boundaryTimerRef.current = setTimeout(() => {
          setNow(new Date());
        }, delayMs);
      }
    }

    return () => {
      if (boundaryTimerRef.current) {
        clearTimeout(boundaryTimerRef.current);
      }
    };
  }, [items, now]);

  return { now, refreshNow };
}
