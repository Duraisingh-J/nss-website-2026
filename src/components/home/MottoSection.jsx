import React, { useRef, useLayoutEffect } from "react";
import { Quote } from "lucide-react";
import { gsap, isReducedMotion } from "../../lib/animations";

export default function MottoSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });

      tl.fromTo(
        ".motto-circle-geom",
        { opacity: 0, scale: 0.9 },
        { opacity: 0.08, scale: 1, duration: 1.0, ease: "power2.out" }
      )
        .fromTo(
          ".motto-icon",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.7"
        )
        .fromTo(
          ".motto-quote",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".motto-desc",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          "-=0.5"
        )
        .fromTo(
          ".motto-meta",
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-primary text-white py-28 px-4 sm:px-6 lg:px-8 overflow-hidden text-center"
      aria-label="National Service Scheme Guiding Motto"
    >
      {/* Calm, static circular architectural motif (zero continuous animation cost) */}
      <div className="motto-circle-geom absolute inset-0 flex items-center justify-center pointer-events-none opacity-8">
        <div className="w-[34rem] h-[34rem] rounded-full border-[2px] border-white" />
        <div className="absolute w-[22rem] h-[22rem] rounded-full border border-dashed border-white/60" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Ceremonial Icon */}
        <div className="motto-icon inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-amber-300 mb-6 backdrop-blur-sm border border-white/15">
          <Quote className="w-6 h-6 opacity-90" />
        </div>

        <span className="block text-xs sm:text-sm uppercase tracking-widest text-slate-300 font-bold mb-3">
          Our Guiding Philosophy
        </span>

        <h2 className="motto-quote font-display italic text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-8">
          "Not Me But You"
        </h2>

        <div className="w-20 h-0.5 bg-accent mx-auto mb-8 opacity-90" />

        <p className="motto-desc font-sans text-base sm:text-lg text-slate-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
          The motto of the National Service Scheme reflects the essence of democratic living and upholds the need for selfless service. It underlines that the welfare of an individual is ultimately dependent on the welfare of society as a whole.
        </p>

        <div className="motto-meta mt-10 pt-6 border-t border-white/15 inline-block">
          <span className="text-xs sm:text-sm tracking-wider uppercase text-slate-300 font-semibold">
            Adopted 1969 · National Service Scheme · Government of India
          </span>
        </div>

      </div>
    </section>
  );
}
