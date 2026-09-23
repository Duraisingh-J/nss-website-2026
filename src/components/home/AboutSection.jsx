import React, { useRef, useLayoutEffect } from "react";
import { gsap, isReducedMotion } from "../../lib/animations";

export default function AboutSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-reveal",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.15,
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
      id="about-nss"
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-24 bg-[#F8FAFC] border-b border-border text-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split-Tone Editorial Container: Dark Left, Light Right */}
        <div className="about-reveal rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Deep Navy Dark Background */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0a1526] via-[#0d1b32] to-[#07101e] p-8 sm:p-12 lg:p-14 text-white relative overflow-hidden flex flex-col justify-between">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E0533C]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <span className="block text-[11px] font-bold tracking-[0.2em] text-[#f87171] uppercase mb-3">
                Institutional Heritage & Purpose
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
                About <br />
                <span className="text-[#E0533C]">NSS MIT</span>
              </h2>
              <div className="w-14 h-1 bg-[#E0533C] mb-8 rounded-full" />

              <p className="text-slate-300 text-[15px] sm:text-base leading-relaxed font-normal">
                The National Service Scheme is an initiative of the Government of India under the Ministry of Youth Affairs and Sports. It was launched on 24th September 1969, during the centenary year of Mahatma Gandhi, with the aim of developing personality, social awareness, and a sense of responsibility through voluntary service.
              </p>
            </div>

            {/* Faint Decorative Watermark */}
            <div
              className="absolute -right-6 -bottom-6 font-serif text-[130px] font-bold text-white/[0.03] select-none pointer-events-none leading-none"
              aria-hidden="true"
            >
              NSS
            </div>
          </div>

          {/* Right Column: Crisp Light Surface */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-6">
            {/* Editorial Quote */}
            <div className="border-l-3 border-[#BC3A26] pl-6 py-2 bg-slate-50/70 rounded-r-xl">
              <p className="font-serif italic text-lg sm:text-xl text-slate-900 leading-relaxed">
                "Nurturing empathetic engineering minds through dedicated social engagement and grassroots community partnership."
              </p>
            </div>

            {/* Narrative Paragraphs */}
            <div className="space-y-4 text-[15px] sm:text-[15.5px] text-slate-600 leading-relaxed font-normal">
              <p>
                At Madras Institute of Technology (Anna University), NSS operates across seven active units (Unit I through Unit VII), each guided by dedicated Programme Officers. Our volunteers connect their academic knowledge with real-world needs by working with adopted villages, schools, healthcare teams, and local authorities.
              </p>
              <p>
                Through 7-day residential Special Camps, blood donation drives, village development activities, environmental initiatives, literacy programmes, and disaster relief efforts, NSS MIT helps students build teamwork, responsibility, leadership, and a strong sense of service.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
