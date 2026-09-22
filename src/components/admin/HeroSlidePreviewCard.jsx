import React from "react";
import { ArrowRight, Users, Leaf, Heart, Image as ImageIcon } from "lucide-react";

/**
 * Shared Hero Slide Presentation Component
 *
 * Faithfully mirrors the public homepage hero (Hero.jsx) presentation rules:
 * - Real uploaded image with dark tint overlay and directional gradient vignettes
 * - Left column: Eyebrow, Main Title, Subtitle, Description, CTA Buttons, Focus Pillars
 * - Right column: Script cursive tag and floating "Not Me But You" motto card
 * - Supports both "desktop" (wide landscape) and "mobile" (compact phone) viewports
 */
export default function HeroSlidePreviewCard({
  slide,
  mode = "desktop", // "desktop" | "mobile"
  className = "",
}) {
  const title = slide?.title || "NSS MIT";
  const subtitle = slide?.subtitle || "Serving Society";
  const description =
    slide?.description ||
    "The National Service Scheme at MIT Campus, Anna University empowers students to contribute to society through community service, awareness programmes and nation-building initiatives.";
  const buttonText = slide?.button_text || "Explore Our Work";
  const imageUrl = slide?.imageUrl || slide?.imagePreviewUrl || null;

  const isMobile = mode === "mobile";

  return (
    <div
      className={`relative overflow-hidden bg-slate-950 text-white select-none rounded-xl border border-slate-800 shadow-2xl transition-all ${
        isMobile
          ? "w-[320px] max-w-full aspect-[9/16] mx-auto"
          : "w-full aspect-[16/9] min-h-[300px]"
      } ${className}`}
    >
      {/* ── 1. Background Image Layer ───────────────────────────── */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-[#090e17] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
            <ImageIcon className="w-7 h-7 text-slate-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
            Hero Slide Image
          </span>
          <span className="text-[11px] text-slate-400 mt-1 max-w-xs">
            16:9 landscape image will display across the background
          </span>
        </div>
      )}

      {/* ── 2. Cinematic Gradient Overlays & Vignettes ────────────── */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-brightness-[0.82] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-16 sm:h-24 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 sm:h-36 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-28 sm:w-64 bg-gradient-to-r from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 sm:w-44 bg-gradient-to-l from-slate-950/60 via-slate-950/15 to-transparent pointer-events-none" />

      {/* ── 3. Content Layout ───────────────────────────────────── */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-8">
        
        {/* Top Bar / Eyebrow */}
        <div className="flex items-center justify-between">
          <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 drop-shadow">
            SERVICE &nbsp;·&nbsp; LEADERSHIP &nbsp;·&nbsp; SOCIAL RESPONSIBILITY
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20 backdrop-blur-md">
            {mode === "mobile" ? "Mobile View" : "Public Hero"}
          </span>
        </div>

        {/* Center / Body Section */}
        <div className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-12 gap-6"} items-center my-auto`}>
          
          {/* Left Column: Headlines & CTA */}
          <div className={`${isMobile ? "col-span-1" : "col-span-7"} flex flex-col justify-center drop-shadow-md`}>
            
            <h2 className="leading-[1.1] mb-2 sm:mb-3">
              <span className={`block font-serif font-black text-white ${isMobile ? "text-2xl" : "text-2xl sm:text-3xl lg:text-4xl"}`}>
                {title}
              </span>
              <span className={`block font-serif font-bold text-[#E0533C] mt-0.5 ${isMobile ? "text-xl" : "text-xl sm:text-2xl lg:text-3xl"}`}>
                {subtitle}
              </span>
            </h2>

            <p className={`text-slate-100 font-sans leading-relaxed max-w-lg mb-4 line-clamp-3 ${isMobile ? "text-[11px]" : "text-xs sm:text-sm"}`}>
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
              <div className="inline-flex items-center gap-1.5 bg-[#BC3A26] text-white font-sans font-semibold text-[11px] sm:text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-md">
                <span>{buttonText}</span>
                <ArrowRight className="w-3 h-3" />
              </div>

              {!isMobile && (
                <div className="inline-flex items-center gap-1.5 bg-slate-950/50 border border-white/20 text-white font-sans font-medium text-[11px] sm:text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-md backdrop-blur-sm">
                  <span>Learn About NSS</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Focus Pillars (Desktop Only) */}
            {!isMobile && (
              <div className="hidden sm:grid grid-cols-3 gap-3 pt-3 border-t border-white/15 max-w-md">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-white/90 bg-white/5 shrink-0">
                    <Users className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[9px] tracking-wider text-white uppercase">Students</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-white/90 bg-white/5 shrink-0">
                    <Leaf className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[9px] tracking-wider text-white uppercase">Communities</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-white/90 bg-white/5 shrink-0">
                    <Heart className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[9px] tracking-wider text-white uppercase">Service</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Floating Motto Card (Desktop Only) */}
          {!isMobile && (
            <div className="col-span-5 hidden md:flex flex-col items-end justify-center">
              
              {/* Motto Card Preview */}
              <div className="w-full max-w-[210px] bg-[#0d1c31]/80 border border-white/20 rounded-2xl p-4 text-center backdrop-blur-md shadow-2xl">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white p-1 shadow flex items-center justify-center border border-white/40">
                  <img
                    src={`${process.env.PUBLIC_URL}/NSS_logo.png`}
                    alt="NSS Emblem"
                    className="w-full h-full object-contain block"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.fallback) {
                        e.currentTarget.dataset.fallback = "true";
                        e.currentTarget.src = `${process.env.PUBLIC_URL}/images/NSS_logo.png`;
                      }
                    }}
                  />
                </div>
                <span className="text-[8px] font-bold tracking-[0.2em] text-slate-300 uppercase block mb-0.5">
                  OUR MOTTO
                </span>
                <p className="font-serif italic text-xs font-bold text-white tracking-wide mb-1.5">
                  “Not Me But You”
                </p>
                <div className="space-y-0.5 pt-1 border-t border-white/15">
                  <p className="text-[8px] font-semibold tracking-wider text-slate-300 uppercase">
                    SELFLESS SERVICE
                  </p>
                  <p className="text-[8px] font-semibold tracking-wider text-slate-300 uppercase">
                    STRONGER COMMUNITIES
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Bar: Slide Indicator Dots Simulation */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <div className="w-4 h-1 rounded-full bg-[#E0533C]" />
          <div className="w-1.5 h-1 rounded-full bg-white/40" />
          <div className="w-1.5 h-1 rounded-full bg-white/40" />
        </div>

      </div>
    </div>
  );
}
