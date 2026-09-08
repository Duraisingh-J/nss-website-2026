import React, { useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { gsap, isReducedMotion } from "../../lib/animations";

export default function Hero() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Clean sequential reveal without continuous background animation
      tl.fromTo(
        ".hero-eyebrow",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .fromTo(
          ".hero-title-line",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 },
          "-=0.3"
        )
        .fromTo(
          ".hero-desc",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.65 },
          "-=0.4"
        )
        .fromTo(
          ".hero-actions",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          ".hero-emblem-composition",
          { opacity: 0, y: 24, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power2.out" },
          "-=0.6"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToAbout = () => {
    const el = document.getElementById("about-nss");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative bg-slate-900 text-white pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden border-b border-slate-800"
    >
      {/* Refined subtle institutional background grid lines (static, zero background performance cost) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] rounded-full border border-slate-500" />
        <div className="absolute -top-16 -right-16 w-[40rem] h-[40rem] rounded-full border border-slate-500" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Identity & Purpose */}
          <div className="lg:col-span-7">
            <div className="hero-eyebrow inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              National Service Scheme · MIT Campus · Anna University
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-[1.1] mb-6">
              <span className="hero-title-line block">NSS MIT</span>
              <span className="hero-title-line block text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-700">
                Serving Society
              </span>
            </h1>

            <p className="hero-desc font-sans text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-8 font-normal">
              The National Service Scheme unit of Madras Institute of Technology nurtures socially conscious engineers by engaging students in community development, environmental conservation, health outreach, and nation-building initiatives.
            </p>

            <div className="hero-actions flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="inline-flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-hover text-white font-sans font-semibold text-sm sm:text-base px-6 py-3.5 rounded-md transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <span>Explore Our Events</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={scrollToAbout}
                className="inline-flex items-center justify-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-sans font-medium text-sm sm:text-base px-5 py-3.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <span>Institutional Overview</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Institutional Identity Composition */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="hero-emblem-composition relative w-full max-w-md">
              
              {/* Integrated Institutional Identity Frame */}
              <div className="relative bg-slate-950/80 border border-slate-700/80 rounded-2xl p-8 sm:p-9 shadow-2xl backdrop-blur-sm text-center">
                
                {/* Concentric Architectural Geometry */}
                <div className="relative mx-auto w-36 h-36 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-slate-700/60" />
                  <div className="absolute inset-2 rounded-full border border-dashed border-red-500/40" />
                  
                  {/* Clean circular avatar */}
                  <div className="relative z-10 w-24 h-24 rounded-full bg-white p-2 flex items-center justify-center shadow-xl border-2 border-slate-600/80 overflow-hidden">
                    <img
                      src={`${process.env.PUBLIC_URL}/images/nss.png`}
                      alt="NSS Official Emblem"
                      className="w-full h-full object-contain rounded-full"
                      onError={(e) => {
                        if (!e.currentTarget.dataset.triedRoot) {
                          e.currentTarget.dataset.triedRoot = "true";
                          e.currentTarget.src = `${process.env.PUBLIC_URL}/nss.png`;
                        } else if (!e.currentTarget.dataset.triedAlt) {
                          e.currentTarget.dataset.triedAlt = "true";
                          e.currentTarget.src = `${process.env.PUBLIC_URL}/NSS_logo.png`;
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400 block">
                    Official NSS Motto
                  </span>
                  <p className="font-display italic text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide">
                    "Not Me But You"
                  </p>
                  <div className="w-12 h-0.5 bg-accent mx-auto my-3" />
                  <p className="text-xs sm:text-sm text-slate-300 uppercase tracking-wider font-semibold">
                    Government of India Initiative
                  </p>
                  <p className="text-xs text-slate-400 font-normal mt-1">
                    Ministry of Youth Affairs & Sports
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-left">
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">Affiliation</span>
                    <span className="text-sm font-semibold text-slate-200">Anna University</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">Active Units</span>
                    <span className="text-sm font-semibold text-slate-200">7 Units (I to VII)</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
