import React, { useRef, useLayoutEffect } from "react";
import { gsap, isReducedMotion } from "../../lib/animations";

const OBJECTIVES = [
  {
    num: "01",
    title: "Community Understanding",
    desc: "Understand the community in which they work and recognize their relationship with societal needs.",
  },
  {
    num: "02",
    title: "Self in Relation to Society",
    desc: "Understand themselves in relation to their community and evaluate their role in civic progress.",
  },
  {
    num: "03",
    title: "Problem Identification",
    desc: "Identify the authentic needs and problems of the community and involve local stakeholders in problem-solving.",
  },
  {
    num: "04",
    title: "Social & Civic Responsibility",
    desc: "Develop among themselves an enduring sense of social responsibility, civic consciousness, and empathy.",
  },
  {
    num: "05",
    title: "Practical Knowledge Application",
    desc: "Utilise their engineering and academic knowledge in finding practical solutions to individual and community problems.",
  },
  {
    num: "06",
    title: "Group Living Competence",
    desc: "Develop the competence required for group-living, sharing of responsibilities, and team collaboration.",
  },
  {
    num: "07",
    title: "Community Mobilisation",
    desc: "Gain essential skills in mobilising community participation and fostering grassroots civic action.",
  },
  {
    num: "08",
    title: "Democratic Leadership",
    desc: "Acquire mature leadership qualities, ethical democratic attitudes, and reasoned decision-making skills.",
  },
  {
    num: "09",
    title: "Disaster Preparedness",
    desc: "Develop operational capacity to meet civil emergencies, humanitarian crises, and natural disasters.",
  },
  {
    num: "10",
    title: "National Integration",
    desc: "Practise national integration, communal harmony, and inclusive social unity in all spheres of life.",
  },
];

export default function ObjectivesSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".objective-item",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
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
      id="objectives"
      ref={sectionRef}
      className="py-24 bg-slate-50/70 border-b border-border text-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-bold tracking-wider text-accent uppercase mb-2">
            Institutional Purpose & Tenets
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Main Objectives of <span className="text-primary font-sans">NSS</span>
          </h2>
          <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
            Framed by the Ministry of Youth Affairs and Sports, these ten cardinal objectives guide every outreach drive, training camp, and community initiative led by NSS MIT volunteers.
          </p>
        </div>

        {/* 2-Column Numbered Editorial System (Desktop: 2 cols, Mobile: 1 col, 100% visible) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
          {OBJECTIVES.map((item) => (
            <div
              key={item.num}
              className="objective-item group relative flex items-start gap-5 sm:gap-6 pt-5 pb-6 border-t border-slate-200/90 transition-colors"
            >
              {/* Numbering */}
              <span className="font-display text-2xl sm:text-3xl font-bold text-accent/85 group-hover:text-primary transition-colors shrink-0 leading-tight">
                {item.num}
              </span>

              {/* Text content with readable typography */}
              <div className="flex-1 min-w-0">
                <h3 className="font-sans font-bold text-base sm:text-lg text-foreground mb-1.5 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-[15px] sm:text-base text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              {/* Desktop-only subtle horizontal line expansion indicator */}
              <div className="hidden sm:block absolute top-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300 ease-out" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
