import React, { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { GALLERY } from "../../data/data";
import ImageWithFallback from "../ui/ImageWithFallback";
import { gsap, isReducedMotion } from "../../lib/animations";

// Authentic NSS domain categories for each gallery highlight
const CATEGORY_MAP = {
  1: "Annual Special Camp",
  2: "Health & Life Support",
  3: "Environmental Stewardship",
  4: "Youth Parliament & Democracy",
  5: "Swachh Bharat Mission",
};

export default function ActivitiesGallery() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gallery-item-reveal",
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
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
      className="py-24 bg-slate-50/70 border-b border-border text-foreground"
      aria-label="Recent NSS MIT Activities"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="text-xs font-bold tracking-wider text-accent uppercase mb-2">
              Authentic Field Documentation
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-3">
              Our <span className="text-primary font-sans">Recent Activities</span>
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
              Photographic documentation from annual residential camps, health drives, awareness sessions, and village adoption projects conducted by NSS MIT volunteers.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-primary hover:text-accent transition-colors shrink-0 group"
          >
            <span>View All Annual Camps & Events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Asymmetric Editorial Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {GALLERY.map((item) => {
            const isFeatured = Boolean(item.featured);
            const category = CATEGORY_MAP[item.id] || "Outreach Drive";

            return (
              <div
                key={item.id}
                className={`gallery-item-reveal group relative flex flex-col rounded-lg overflow-hidden bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 ${
                  isFeatured ? "md:col-span-2 md:row-span-2" : "col-span-1"
                }`}
              >
                {/* Image Container with Fixed Aspect Ratio (CLS safe) */}
                <div className="relative w-full overflow-hidden bg-slate-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.label}
                    aspectRatio={isFeatured ? "16/10" : "4/3"}
                    fallbackLabel={item.label}
                    category={category}
                    priority={false}
                    className="group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  
                  {/* Institutional Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm backdrop-blur-sm">
                    {category}
                  </div>
                </div>

                {/* Card Content Footer with Readable Typography */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className={`font-sans font-bold text-foreground group-hover:text-primary transition-colors leading-snug ${
                      isFeatured ? "text-xl sm:text-2xl mb-2" : "text-base sm:text-lg mb-1.5"
                    }`}>
                      {item.label}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <MapPin className="w-4 h-4 text-accent shrink-0" />
                      <span className="line-clamp-1">{item.caption}</span>
                    </div>
                  </div>

                  {isFeatured && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-muted font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>7-Day Intensive Village Engagement & Rural Development Programme</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
