import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, Leaf, Heart } from "lucide-react";
import { gsap, isReducedMotion } from "../../lib/animations";
import { ImagesSlider } from "../ui/images-slider";
import { getHeroMedia, DEFAULT_HERO_MEDIA } from "../../services/mediaService";
import { getPublicHeroSlides } from "../../services/heroSlideService";

export default function Hero() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [heroImages, setHeroImages] = useState(DEFAULT_HERO_MEDIA);
  const [dynamicSlides, setDynamicSlides] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Dynamically load hero slides & images from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadMedia() {
      try {
        // 1. First attempt to load published hero slides from database
        const publicSlides = await getPublicHeroSlides();
        if (isMounted && Array.isArray(publicSlides) && publicSlides.length > 0) {
          setDynamicSlides(publicSlides);
          const images = publicSlides
            .filter((s) => Boolean(s.imageUrl))
            .map((s, idx) => ({
              id: s.id,
              url: s.imageUrl,
              altText: s.title || `NSS Hero Slide ${idx + 1}`,
            }));

          if (images.length > 0) {
            setHeroImages(images);
            return;
          }
        }

        // 2. Fallback to general hero media / default assets
        const media = await getHeroMedia();
        if (isMounted && Array.isArray(media) && media.length > 0) {
          setHeroImages(media);
        }
      } catch (err) {
        console.warn("Failed to load dynamic hero media:", err);
      }
    }
    loadMedia();
    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP Entrance Animations for Text & Overlay Elements
  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        ".hero-eyebrow",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
        .fromTo(
          ".hero-title-line",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" },
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
          { opacity: 0, y: 24, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" },
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

  const currentSlide =
    dynamicSlides && dynamicSlides.length > 0
      ? dynamicSlides[activeSlideIndex % dynamicSlides.length]
      : null;

  const currentTitle = currentSlide?.title || "NSS MIT";
  const currentSubtitle = currentSlide?.subtitle || "Serving Society";
  const currentDescription =
    currentSlide?.description ||
    "The National Service Scheme at MIT Campus, Anna University empowers students to contribute to society through community service, awareness programmes and nation-building initiatives.";
  const currentButtonText = currentSlide?.button_text || "Explore Our Work";
  const currentButtonUrl = currentSlide?.button_url || "/events";

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] lg:min-h-[92vh] flex items-center bg-slate-950 text-white overflow-hidden"
      aria-label="NSS MIT Hero Section"
    >
      {/* ── Media-Driven Automatic Images Slider Foundation ──────── */}
      <ImagesSlider
        images={heroImages}
        autoplay={true}
        interval={7000}
        direction="fade"
        onIndexChange={(idx) => setActiveSlideIndex(idx)}
        className="min-h-[90vh] lg:min-h-[92vh] pt-28 pb-20 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28"
      >
        {/* ── Stable Hero Content Grid ─────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Mission, Typography, Actions, Focus Areas */}
            <div className="lg:col-span-7 flex flex-col justify-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              
              {/* Eyebrow */}
              <p className="hero-eyebrow text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 mb-4 select-none drop-shadow">
                SERVICE &nbsp;·&nbsp; LEADERSHIP &nbsp;·&nbsp; SOCIAL RESPONSIBILITY
              </p>

              {/* Main Headline */}
              <h1 className="tracking-tight leading-[1.05] mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                <span className="hero-title-line font-display block text-5xl sm:text-6xl lg:text-7xl font-black text-white">
                  {currentTitle}
                </span>
                <span className="hero-title-line font-display block text-5xl sm:text-6xl lg:text-7xl font-bold text-[#E0533C] mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                  {currentSubtitle}
                </span>
              </h1>

              {/* Supporting Description */}
              <p className="hero-desc font-sans text-slate-100 text-base sm:text-lg leading-relaxed max-w-xl font-normal mb-8 drop-shadow-md">
                {currentDescription}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-12 sm:mb-14">
                <button
                  type="button"
                  onClick={() => {
                    if (currentButtonUrl.startsWith("http")) {
                      window.open(currentButtonUrl, "_blank", "noopener,noreferrer");
                    } else {
                      navigate(currentButtonUrl);
                    }
                  }}
                  className="hero-btn inline-flex items-center justify-center gap-2.5 bg-[#BC3A26] hover:bg-[#A5311F] text-white font-sans font-semibold text-sm sm:text-base px-6 py-3.5 rounded-lg transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>{currentButtonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollToAbout}
                  className="hero-btn inline-flex items-center justify-center gap-2.5 bg-slate-950/40 hover:bg-slate-900/60 border border-slate-500/70 hover:border-slate-300 text-white font-sans font-medium text-sm sm:text-base px-6 py-3.5 rounded-lg transition-all backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <span>Learn About NSS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Focus Pillars Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/15 max-w-2xl">
                
                {/* Item 1: Students */}
                <div className="hero-feature-item flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/90 shrink-0 bg-white/5">
                    <Users className="w-5 h-5" />
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
                <div className="hero-feature-item flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/90 shrink-0 bg-white/5">
                    <Leaf className="w-5 h-5" />
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
                <div className="hero-feature-item flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/90 shrink-0 bg-white/5">
                    <Heart className="w-5 h-5" />
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

            {/* Right Column: Cursive Tag & Floating Motto Card */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-between relative min-h-[380px] lg:min-h-[460px]">
              
              {/* Handwritten Script Tag */}
              <div className="hero-cursive-tag font-script text-white text-3xl sm:text-4xl leading-tight text-center lg:text-right select-none drop-shadow-lg mb-8 lg:mb-0 lg:mr-4">
                <span className="block">Together</span>
                <span className="block">for a brighter</span>
                <span className="block">Tomorrow</span>
              </div>

              {/* Floating Motto Card */}
              <div className="hero-motto-card relative w-full max-w-[260px] bg-[#0d1c31]/80 border border-white/20 rounded-3xl p-6 sm:p-7 text-center backdrop-blur-md shadow-2xl">
                
                {/* NSS Official Emblem */}
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white p-1.5 shadow-lg flex items-center justify-center border border-white/40 overflow-hidden">
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
                <div className="space-y-1 pt-1 border-t border-white/15">
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
      </ImagesSlider>
    </section>
  );
}
