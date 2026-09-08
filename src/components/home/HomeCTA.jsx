import React, { useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Flag, ArrowRight } from "lucide-react";
import { gsap, isReducedMotion } from "../../lib/animations";

export default function HomeCTA() {
  const navigate = useNavigate();
  const ctaRef = useRef(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-content",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, ctaRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ctaRef}
      className="py-24 bg-slate-900 text-white border-t border-slate-800"
      aria-label="Institutional Call to Engagement"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="cta-content">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Engage & Participate
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100 max-w-3xl mx-auto mb-6 leading-tight">
            Beyond the Classroom. Into the Community.
          </h2>

          <p className="font-sans text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Explore the initiatives, sessions, and community service activities led by NSS MIT. Discover how student involvement translates into tangible social impact.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="inline-flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-hover text-white font-sans font-semibold text-sm sm:text-base px-7 py-4 rounded-md transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Flag className="w-4 h-4" />
              <span>Explore All Events & Camps</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/sessions")}
              className="inline-flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-sans font-medium text-sm sm:text-base px-6 py-4 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span>View Session Calendar</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
