import React, { useRef, useLayoutEffect } from "react";
import { Mail, Landmark, Calendar, Users2 } from "lucide-react";
import { gsap, isReducedMotion } from "../../lib/animations";

export default function AboutSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-reveal",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
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
      className="py-24 bg-surface border-b border-border text-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Official Ministry Banner Header Card - Clean Institutional Integration */}
        <div className="about-reveal bg-slate-50/90 border border-slate-200/90 rounded-xl p-5 sm:p-7 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <img
              src={`${process.env.PUBLIC_URL}/images/nss-horizontal.png`}
              alt="Government of India - National Service Scheme"
              className="h-12 sm:h-16 w-auto object-contain"
              onError={(e) => {
                if (!e.currentTarget.dataset.fallback) {
                  e.currentTarget.dataset.fallback = "true";
                  e.currentTarget.src = `${process.env.PUBLIC_URL}/nss-horizontal.png`;
                }
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm text-slate-700 font-medium">
            <span className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-primary shrink-0" />
              <span>Ministry of Youth Affairs & Sports</span>
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span>Founded 24th September 1969</span>
            </span>
            <span className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-accent shrink-0" />
              <span>Central Sector Scheme</span>
            </span>
          </div>
        </div>

        {/* Editorial Storytelling Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Institutional Metadata */}
          <div className="lg:col-span-5 about-reveal">
            <div className="text-xs font-bold tracking-wider text-accent uppercase mb-3">
              Institutional Heritage & Purpose
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-5">
              About <br />
              <span className="text-primary font-sans">NSS MIT</span>
            </h2>
            <div className="w-14 h-1 bg-accent mb-6" />

            <p className="text-base text-slate-600 leading-relaxed mb-6 font-normal">
              The National Service Scheme is an initiative of the Government of India under the Ministry of Youth Affairs and Sports. Launched on 24th September 1969 during Mahatma Gandhi's centenary year, it develops personality and civic consciousness through voluntary community action.
            </p>

            {/* Official Contact Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
              <Mail className="w-4 h-4 text-accent shrink-0" />
              <span className="text-muted">Official Inquiries:</span>
              <a
                href="mailto:nssmit7@gmail.com"
                className="font-semibold text-primary hover:underline"
              >
                nssmit7@gmail.com
              </a>
            </div>
          </div>

          {/* Right Column: Lead Narrative & 3 Institutional Pillars */}
          <div className="lg:col-span-7 about-reveal space-y-6">
            <div className="border-l-2 border-primary/40 pl-6 py-1">
              <p className="font-display italic text-lg sm:text-xl text-slate-800 leading-relaxed">
                "Nurturing empathetic engineering minds through dedicated social engagement and grassroots community partnership."
              </p>
            </div>

            <p className="text-base text-slate-600 leading-relaxed font-normal">
              At Madras Institute of Technology (Anna University), NSS operates across seven active units (Unit I through Unit VII), each guided by dedicated Programme Officers. Our volunteers bridge technical education with social empathy, working directly with adopted rural communities, schools, health authorities, and civic bodies.
            </p>

            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Through residential 7-day Special Camps, regular blood donation drives, village empowerment programs, environmental conservation walks, literacy drives, and disaster response support, NSS MIT inculcates democratic attitudes, group responsibility, and proactive leadership among engineering scholars.
            </p>

            {/* Restrained Institutional Pillars (Clean, non-dashboard style) */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-lg bg-slate-50/70 border border-slate-200">
                <span className="block font-bold text-base text-foreground mb-1.5">Democratic Living</span>
                <span className="text-sm text-muted leading-relaxed">Emphasizing selfless service and shared societal responsibility.</span>
              </div>
              <div className="p-5 rounded-lg bg-slate-50/70 border border-slate-200">
                <span className="block font-bold text-base text-foreground mb-1.5">Rural Engagement</span>
                <span className="text-sm text-muted leading-relaxed">Structured village adoption and infrastructure improvement camps.</span>
              </div>
              <div className="p-5 rounded-lg bg-slate-50/70 border border-slate-200">
                <span className="block font-bold text-base text-foreground mb-1.5">Youth Leadership</span>
                <span className="text-sm text-muted leading-relaxed">Cultivating crisis readiness, civic duty, and community mobilization.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
