import React, { useRef, useLayoutEffect } from "react";
import {
  Droplet,
  Sprout,
  Tent,
  BookOpen,
  Stethoscope,
  Sparkles,
  ShieldAlert,
  Vote,
  Activity,
} from "lucide-react";
import { EVENT_TYPES } from "../../data/data";
import { gsap, isReducedMotion } from "../../lib/animations";

const ICON_MAP = {
  "Blood Donation Drives": Droplet,
  "Tree Plantation & Environment": Sprout,
  "Special & Annual Camps": Tent,
  "Literacy Drives": BookOpen,
  "Health & Hygiene Camps": Stethoscope,
  "Cultural & Youth Festivals": Sparkles,
  "Disaster Relief": ShieldAlert,
  "Election Awareness (SVEEP)": Vote,
  "Sports & Recreation": Activity,
};

export default function ImpactSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".domain-card",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-surface border-b border-border text-foreground"
      aria-label="NSS Domains of Community Engagement"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-bold tracking-wider text-accent uppercase mb-2">
            Structured Civic Action
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Domains of <span className="text-primary font-sans">Community Impact</span>
          </h2>
          <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
            Our volunteers engage in structured civic programmes targeting key development sectors across rural and urban communities. These core domains define our ongoing student-led initiatives.
          </p>
        </div>

        {/* Editorial Civic Grid (Clean, institutional, non-dashboard style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EVENT_TYPES.map((domain) => {
            const IconComponent = ICON_MAP[domain.title] || Activity;
            return (
              <div
                key={domain.title}
                className="domain-card group bg-white border border-slate-200/90 rounded-lg p-7 hover:border-slate-400/80 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Clean unboxed icon */}
                  <div className="text-primary mb-5 flex items-center justify-between">
                    <IconComponent className="w-6 h-6" strokeWidth={1.75} />
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Focus Area
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-lg text-foreground mb-2.5 group-hover:text-primary transition-colors">
                    {domain.title}
                  </h3>

                  <p className="text-[15px] text-slate-600 leading-relaxed font-normal">
                    {domain.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-muted">
                  <span className="font-medium uppercase tracking-wide text-slate-500">
                    NSS MIT Community Drive
                  </span>
                  <span className="text-accent font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
