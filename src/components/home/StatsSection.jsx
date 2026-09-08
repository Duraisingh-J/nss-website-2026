import React, { useRef, useState, useLayoutEffect } from "react";
import { STATS } from "../../data/data";
import { gsap, isReducedMotion } from "../../lib/animations";

export default function StatsSection() {
  const sectionRef = useRef(null);

  // Initialize with target values so that if JS is delayed or fails,
  // the user sees the real authoritative numbers immediately.
  const [displayValues, setDisplayValues] = useState(() =>
    STATS.map((s) => s.target)
  );

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    // Reset to 0 for progressive counting enhancement only when GSAP executes
    setDisplayValues(STATS.map(() => 0));

    const ctx = gsap.context(() => {
      const proxy = {
        val0: 0,
        val1: 0,
        val2: 0,
      };

      gsap.to(proxy, {
        val0: STATS[0]?.target || 7,
        val1: STATS[1]?.target || 7,
        val2: STATS[2]?.target || 350,
        duration: 1.3, // Restrained 1.3s duration
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => {
          setDisplayValues([
            Math.round(proxy.val0),
            Math.round(proxy.val1),
            Math.round(proxy.val2),
          ]);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-slate-950 border-y border-slate-800 text-white py-16 sm:py-20"
      aria-label="NSS MIT Key Statistics"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/90">
          {STATS.map((stat, idx) => {
            const isStudents = stat.id === "students";
            return (
              <div
                key={stat.id}
                className="py-8 sm:py-4 px-6 sm:px-10 text-center flex flex-col items-center justify-center"
              >
                <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-slate-100 tracking-tight leading-none mb-3">
                  <span>{displayValues[idx] || 0}</span>
                  {isStudents && <span className="text-accent ml-1 font-sans font-bold">+</span>}
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-300 uppercase tracking-widest">
                  {stat.label}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
                  {stat.id === "units" && "Unit I through Unit VII"}
                  {stat.id === "pos" && "Faculty Leadership & Mentorship"}
                  {stat.id === "students" && "Enrolled Engineering Volunteers"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
