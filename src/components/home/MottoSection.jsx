import React, { useRef, useLayoutEffect } from "react";
import { User, Users, Shield } from "lucide-react";
import { gsap, isReducedMotion } from "../../lib/animations";

// Ashoka Chakra 24-Spoke Architectural Watermark
function AshokaChakra({ className }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="200" cy="200" r="192" strokeWidth="3.5" />
      <circle cx="200" cy="200" r="184" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="200" cy="200" r="50" strokeWidth="3.5" />
      <circle cx="200" cy="200" r="22" strokeWidth="2.5" fill="currentColor" fillOpacity="0.15" />
      {spokes.map((deg) => (
        <g key={deg} transform={`rotate(${deg} 200 200)`}>
          <line x1="200" y1="200" x2="200" y2="16" strokeWidth="2" />
          <circle cx="200" cy="12" r="2.5" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

// Architectural Heritage Watermark (Anna University / MIT Heritage Tower & Arches)
function HeritageWatermark({ className }) {
  return (
    <svg
      viewBox="0 0 280 340"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Central Clock Tower */}
      <rect x="110" y="20" width="60" height="18" rx="2" opacity="0.7" />
      <polygon points="110,20 140,2 170,20" opacity="0.8" />
      <rect x="118" y="38" width="44" height="60" opacity="0.6" />
      {/* Clock Face */}
      <circle cx="140" cy="62" r="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      <line x1="140" y1="62" x2="140" y2="55" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      <line x1="140" y1="62" x2="146" y2="62" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      {/* Tower Balcony & Pilasters */}
      <rect x="112" y="98" width="56" height="8" opacity="0.7" />
      <rect x="122" y="106" width="36" height="50" opacity="0.5" />
      <path d="M130 130 a10 10 0 0 1 20 0 v26 h-20 z" opacity="0.8" />
      
      {/* Main Building Base & Wings */}
      <rect x="80" y="156" width="120" height="12" opacity="0.7" />
      <rect x="50" y="168" width="180" height="150" opacity="0.4" />
      
      {/* Arched Portico Windows */}
      <path d="M65 190 a12 12 0 0 1 24 0 v40 h-24 z" opacity="0.65" />
      <path d="M100 190 a12 12 0 0 1 24 0 v40 h-24 z" opacity="0.65" />
      <path d="M135 190 a12 12 0 0 1 24 0 v40 h-24 z" opacity="0.75" />
      <path d="M170 190 a12 12 0 0 1 24 0 v40 h-24 z" opacity="0.65" />
      
      {/* Ground Floor Grand Arches */}
      <path d="M70 250 a16 16 0 0 1 32 0 v68 h-32 z" opacity="0.7" />
      <path d="M124 240 a16 16 0 0 1 32 0 v78 h-32 z" opacity="0.85" />
      <path d="M178 250 a16 16 0 0 1 32 0 v68 h-32 z" opacity="0.7" />
      
      {/* Surrounding Trees / Foliage Silhouette */}
      <path d="M10 280 q15 -40 35 -30 q20 -20 30 10 q15 30 -5 60 z" opacity="0.3" />
      <path d="M220 270 q20 -50 45 -25 q25 15 15 55 z" opacity="0.3" />
    </svg>
  );
}

export default function MottoSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      });

      tl.fromTo(
        ".motto-image-col",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }
      )
        .fromTo(
          ".motto-eyebrow",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.6"
        )
        .fromTo(
          ".motto-quote-line",
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".motto-accent-bar",
          { opacity: 0, scaleX: 0 },
          { opacity: 1, scaleX: 1, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".motto-desc",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          ".motto-pillar-item",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          ".motto-callout",
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".motto-attribution",
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.2"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="guiding-philosophy"
      ref={sectionRef}
      className="relative bg-[#FAF8F5] text-slate-900 py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-stone-200/80"
      aria-label="Our Guiding Philosophy: Not Me But You"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* =========================================================
              LEFT COLUMN: Tall Photo Card with Compassionate Hands
              ========================================================= */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="motto-image-col relative w-full max-w-md sm:max-w-[420px] lg:max-w-[440px] xl:max-w-[460px] rounded-2xl overflow-hidden shadow-2xl border border-stone-200/80 group">
              
              {/* Hands Photograph with Integrated Editorial Typography */}
              <img
                src={`${process.env.PUBLIC_URL}/images/motto-hands.png`}
                alt="People Serve People Grow Nations Rise - Not Me But You"
                className="w-full h-auto object-cover object-center transform transition-transform duration-700 group-hover:scale-102"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = "true";
                    e.currentTarget.src = `${process.env.PUBLIC_URL}/images/nss.png`;
                  }
                }}
              />

            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: Guiding Philosophy Editorial Composition
              Motto Heading, Explanation, 3 Pillars, and Quote Callout
              ========================================================= */}
          <div className="lg:col-span-7 relative flex flex-col justify-between py-2">
            
            {/* Background Watermarks: Ashoka Chakra & Heritage Building */}
            <div className="absolute top-1/2 right-0 sm:right-4 -translate-y-1/2 pointer-events-none z-0 select-none opacity-[0.10] text-[#A67C52]">
              <AshokaChakra className="w-[480px] sm:w-[560px] h-[480px] sm:h-[560px]" />
            </div>
            <div className="absolute -bottom-6 right-2 sm:right-6 pointer-events-none z-0 select-none opacity-[0.14] text-[#8C5D38]">
              <HeritageWatermark className="w-44 sm:w-56 h-60 sm:h-72" />
            </div>

            <div className="relative z-10">
              
              {/* Eyebrow */}
              <span className="motto-eyebrow text-[#BC3A26] font-bold text-xs tracking-[0.22em] uppercase mb-4 block select-none">
                OUR GUIDING PHILOSOPHY
              </span>

              {/* Giant Motto Display Heading */}
              <h2 className="tracking-tight leading-[1.05] mb-5 select-none">
                <span className="motto-quote-line font-display italic block text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900">
                  “Not Me
                </span>
                <span className="motto-quote-line font-display italic block text-5xl sm:text-6xl lg:text-7xl font-bold text-[#BC3A26] mt-1">
                  But You”
                </span>
              </h2>

              {/* Golden Accent Divider */}
              <div className="motto-accent-bar origin-left w-16 h-1 bg-[#D4AF37] my-6 rounded-full" />

              {/* Authentic NSS Explanatory Text */}
              <p className="motto-desc font-sans text-slate-700 text-base sm:text-lg leading-relaxed max-w-xl font-normal mb-10">
                The motto of the National Service Scheme reflects the essence of democratic living and upholds the need for selfless service. It underlines that the welfare of an individual is ultimately dependent on the welfare of society as a whole.
              </p>

              {/* Pillars & Quote Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center pt-2">
                
                {/* 3 Core Values / Pillars (Takes 7 or 8 columns on sm/lg) */}
                <div className="sm:col-span-7 grid grid-cols-3 gap-3 sm:gap-4">
                  
                  {/* Pillar 1: Individual Responsibility */}
                  <div className="motto-pillar-item flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="w-12 h-12 rounded-full bg-[#F3EDE2] border border-[#E5DAC8] flex items-center justify-center text-[#9E653A] mb-2.5 shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 block leading-tight">
                      INDIVIDUAL
                    </span>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 block leading-tight mt-0.5">
                      RESPONSIBILITY
                    </span>
                  </div>

                  {/* Pillar 2: Community Welfare */}
                  <div className="motto-pillar-item flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="w-12 h-12 rounded-full bg-[#F3EDE2] border border-[#E5DAC8] flex items-center justify-center text-[#9E653A] mb-2.5 shadow-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 block leading-tight">
                      COMMUNITY
                    </span>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 block leading-tight mt-0.5">
                      WELFARE
                    </span>
                  </div>

                  {/* Pillar 3: A Stronger Nation */}
                  <div className="motto-pillar-item flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="w-12 h-12 rounded-full bg-[#F3EDE2] border border-[#E5DAC8] flex items-center justify-center text-[#9E653A] mb-2.5 shadow-sm">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 block leading-tight">
                      A STRONGER
                    </span>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 block leading-tight mt-0.5">
                      NATION
                    </span>
                  </div>

                </div>

                {/* Vertical Quote Callout (Takes 5 columns on sm/lg) */}
                <div className="sm:col-span-5 motto-callout border-l-2 border-[#BC3A26] pl-5 py-1">
                  <blockquote className="font-display italic text-2xl sm:text-[26px] lg:text-[28px] text-slate-800 leading-snug font-normal">
                    Service
                    <br />
                    to People
                    <br />
                    is Service
                    <br />
                    to the Nation.
                  </blockquote>
                  <div className="w-12 h-[2px] bg-[#BC3A26] mt-4" />
                </div>

              </div>

              {/* Bottom Metadata Attribution Line */}
              <div className="motto-attribution border-t border-slate-300/80 pt-6 mt-10">
                <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase flex flex-wrap items-center gap-x-3 gap-y-1 select-none">
                  <span>ADOPTED 1969</span>
                  <span className="text-slate-400">·</span>
                  <span>NATIONAL SERVICE SCHEME</span>
                  <span className="text-slate-400">·</span>
                  <span>GOVERNMENT OF INDIA</span>
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
