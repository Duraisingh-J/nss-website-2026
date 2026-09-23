import React, { useRef, useLayoutEffect, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, Leaf, Heart, Sparkles } from "lucide-react";
import { gsap, isReducedMotion } from "../../lib/animations";
import { ThreeDMarquee } from "../ui/3d-marquee";
import { getHeroMedia, DEFAULT_HERO_MEDIA } from "../../services/mediaService";
import { getPublicHeroSlides } from "../../services/heroSlideService";

// Curated high-impact NSS action placeholders for 3D isometric marquee
const CURATED_NSS_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80", // Community volunteer teamwork
  "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=900&q=80", // Medical checkup & health camp
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80", // Tree plantation & environmental care
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80", // Education & youth empowerment
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80", // Student leadership & collaboration
  "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=900&q=80", // Social service & community care
  "https://images.unsplash.com/photo-1617870952348-7524edfb61b7?auto=format&fit=crop&w=900&q=80", // Blood donation & awareness drive
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=900&q=80", // Village development & outreach
  "https://images.unsplash.com/photo-1526976668912-1a811878dd37?auto=format&fit=crop&w=900&q=80", // Youth rally & civic engagement
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80", // Classroom teaching & digital literacy
  "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=900&q=80", // Clean India campaign & waste management
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80", // Student assembly & flag ceremony
  "https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=900&q=80", // Rural support & humanitarian relief
  "https://images.unsplash.com/photo-1569098644584-210bcd375b59?auto=format&fit=crop&w=900&q=80", // Tree sapling nurture
  "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80", // Youth conference & workshop
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80", // Community celebration & harmony
];

export default function Hero() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [dynamicSlides, setDynamicSlides] = useState([]);
  const [dbImages, setDbImages] = useState([]);

  // Load dynamic hero slides and media from Supabase with fallback
  useEffect(() => {
    let isMounted = true;
    async function loadMedia() {
      try {
        // 1. Fetch published hero slides from database
        const publicSlides = await getPublicHeroSlides();
        if (isMounted && Array.isArray(publicSlides) && publicSlides.length > 0) {
          setDynamicSlides(publicSlides);
          const slideImgUrls = publicSlides
            .filter((s) => Boolean(s.imageUrl))
            .map((s) => s.imageUrl);

          if (slideImgUrls.length > 0) {
            setDbImages(slideImgUrls);
          }
        }

        // 2. Fetch general hero media from Supabase media library
        const media = await getHeroMedia();
        if (isMounted && Array.isArray(media) && media.length > 0) {
          const mediaUrls = media
            .filter((m) => Boolean(m.url))
            .map((m) => m.url);
          setDbImages((prev) => Array.from(new Set([...prev, ...mediaUrls])));
        }
      } catch (err) {
        console.warn("Failed to load dynamic hero media, using fallback placeholders:", err);
      }
    }
    loadMedia();
    return () => {
      isMounted = false;
    };
  }, []);

  // Build a rich 24+ image array for the 4-column 3D marquee
  const marqueeImages = useMemo(() => {
    // Local assets from DEFAULT_HERO_MEDIA
    const localDefaults = DEFAULT_HERO_MEDIA.map((m) => m.url);

    // Combine database images + local defaults + curated placeholders
    const combined = [
      ...dbImages,
      ...localDefaults,
      ...CURATED_NSS_PLACEHOLDERS,
    ].filter(Boolean);

    // Ensure we have at least 24 images for smooth multi-column scrolling
    const pool = combined.length > 0 ? combined : CURATED_NSS_PLACEHOLDERS;
    const result = [];
    while (result.length < 24) {
      result.push(...pool);
    }
    return result.slice(0, 32);
  }, [dbImages]);

  // GSAP Entrance Animations
  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        ".hero-eyebrow",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
        .fromTo(
          ".hero-title-line",
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.12, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".hero-desc",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".hero-btn",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          ".hero-feature-item",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
          "-=0.2"
        )
        .fromTo(
          ".hero-cursive-tag",
          { opacity: 0, y: -10, rotate: -8 },
          { opacity: 1, y: 0, rotate: -6, duration: 0.8, ease: "power2.out" },
          "-=0.7"
        )
        .fromTo(
          ".hero-motto-card",
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
          "-=0.5"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToAbout = () => {
    const el = document.getElementById("guiding-philosophy") || document.getElementById("about-nss");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const primarySlide = dynamicSlides.length > 0 ? dynamicSlides[0] : null;
  const currentTitle = primarySlide?.title || "NSS MIT";
  const currentSubtitle = primarySlide?.subtitle || "Serving Society";
  const currentDescription =
    primarySlide?.description ||
    "The National Service Scheme at MIT Campus, Anna University empowers youth through impactful community service, village outreach, tree plantation, and nation-building initiatives.";
  const currentButtonText = primarySlide?.button_text || "Explore Our Work";
  const currentButtonUrl = primarySlide?.button_url || "/events";

  return (
    <section
      ref={heroRef}
      className="relative min-h-[92vh] flex items-center bg-[#070e1b] text-white overflow-hidden pt-28 pb-20 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28"
      aria-label="NSS MIT Hero Section"
    >
      {/* ── 3D ISOMETRIC MARQUEE BACKGROUND ────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto opacity-70">
        <ThreeDMarquee
          images={marqueeImages}
          className="w-full h-full max-w-none rounded-none"
        />
      </div>

      {/* ── REDUCED TRANSPARENCY CONTRAST OVERLAYS ─────────────────── */}
      {/* Left-to-right directional scrim for crisp text readability */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-[#070e1b] via-[#070e1b]/90 to-[#070e1b]/40 lg:to-transparent"
        aria-hidden="true"
      />
      {/* Top and bottom vignettes for smooth section transition */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#070e1b]/95 via-transparent to-[#070e1b]"
        aria-hidden="true"
      />
      {/* Subtle radial ambient glow */}
      <div
        className="absolute top-1/4 left-10 w-96 h-96 bg-[#BC3A26]/10 rounded-full blur-3xl pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* ── MAIN HERO CONTENT CONTAINER ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Mission, Typography, Actions, Focus Areas */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Eyebrow / Live Indicator */}
            <div className="hero-eyebrow inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-4 w-fit shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-[#E0533C]" />
              <span>SERVICE · LEADERSHIP · SOCIAL RESPONSIBILITY</span>
            </div>

            {/* Main Headline */}
            <h1 className="tracking-tight leading-[1.05] mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              <span className="hero-title-line font-display block text-5xl sm:text-6xl lg:text-7xl font-black text-white">
                {currentTitle}
              </span>
              <span className="hero-title-line font-display block text-5xl sm:text-6xl lg:text-7xl font-bold text-[#E0533C] mt-1 drop-shadow-[0_2px_10px_rgba(224,83,60,0.4)]">
                {currentSubtitle}
              </span>
            </h1>

            {/* Supporting Description with Reduced Transparency */}
            <p className="hero-desc font-sans text-slate-200 text-base sm:text-lg leading-relaxed max-w-xl font-normal mb-8 drop-shadow-sm bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 backdrop-blur-sm">
              {currentDescription}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 sm:mb-12">
              <button
                type="button"
                onClick={() => {
                  if (currentButtonUrl.startsWith("http")) {
                    window.open(currentButtonUrl, "_blank", "noopener,noreferrer");
                  } else {
                    navigate(currentButtonUrl);
                  }
                }}
                className="hero-btn inline-flex items-center justify-center gap-2.5 bg-[#BC3A26] hover:bg-[#A5311F] text-white font-sans font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-red-900/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0533C] cursor-pointer"
              >
                <span>{currentButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={scrollToAbout}
                className="hero-btn inline-flex items-center justify-center gap-2.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-slate-500 text-white font-sans font-medium text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
              >
                <span>Learn About NSS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Focus Pillars Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-800/80 max-w-2xl">
              
              {/* Item 1: Students */}
              <div className="hero-feature-item flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                <div className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center text-[#E0533C] shrink-0 bg-slate-800/80 shadow-inner">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs tracking-wider text-white uppercase">
                    STUDENTS
                  </span>
                  <span className="text-[10px] text-slate-300 tracking-wider uppercase mt-0.5">
                    FOR A BETTER TOMORROW
                  </span>
                </div>
              </div>

              {/* Item 2: Communities */}
              <div className="hero-feature-item flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                <div className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 bg-slate-800/80 shadow-inner">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs tracking-wider text-white uppercase">
                    COMMUNITIES
                  </span>
                  <span className="text-[10px] text-slate-300 tracking-wider uppercase mt-0.5">
                    FOR A STRONGER INDIA
                  </span>
                </div>
              </div>

              {/* Item 3: Service */}
              <div className="hero-feature-item flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                <div className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center text-red-400 shrink-0 bg-slate-800/80 shadow-inner">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs tracking-wider text-white uppercase">
                    SERVICE
                  </span>
                  <span className="text-[10px] text-slate-300 tracking-wider uppercase mt-0.5">
                    BEYOND THE CLASSROOM
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Cursive Tag & High-Contrast Motto Card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-between relative min-h-[360px] lg:min-h-[440px]">
            
            {/* Handwritten Script Tag */}
            <div className="hero-cursive-tag font-script text-white text-3xl sm:text-4xl leading-tight text-center lg:text-right select-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] mb-8 lg:mb-0 lg:mr-4">
              <span className="block">Together</span>
              <span className="block text-[#E0533C]">for a brighter</span>
              <span className="block">Tomorrow</span>
            </div>

            {/* Floating Motto Card with Reduced Transparency */}
            <div className="hero-motto-card relative w-full max-w-[270px] bg-[#091524]/95 border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-center shadow-2xl">
              
              {/* NSS Official Emblem */}
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white p-1.5 shadow-md flex items-center justify-center border-2 border-slate-700 overflow-hidden">
                <img
                  src={`${process.env.PUBLIC_URL}/NSS_logo.png`}
                  alt="NSS Official Emblem"
                  className="w-full h-full object-contain block"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallback) {
                      e.currentTarget.dataset.fallback = "true";
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/images/NSS_logo.png`;
                    }
                  }}
                />
              </div>

              {/* Eyebrow */}
              <span className="text-[10px] font-bold tracking-[0.25em] text-slate-300 uppercase block mb-1">
                OUR MOTTO
              </span>

              {/* Motto Quote */}
              <p className="font-display italic text-lg sm:text-xl font-bold text-white tracking-wide mb-3">
                “Not Me But You”
              </p>

              {/* Values list */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] text-slate-300 uppercase">
                  SELFLESS SERVICE
                </p>
                <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] text-slate-300 uppercase">
                  STRONGER COMMUNITIES
                </p>
                <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] text-slate-300 uppercase">
                  BRIGHTER INDIA
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
