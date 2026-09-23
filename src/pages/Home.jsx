import React from "react";
import Hero from "../components/home/Hero";
import AboutSection from "../components/home/AboutSection";
import StatsSection from "../components/home/StatsSection";
import ObjectivesSection from "../components/home/ObjectivesSection";
import MottoSection from "../components/home/MottoSection";
import ImpactSection from "../components/home/ImpactSection";
import Footer from "../components/Footer";
import "./Home.css";

/**
 * Merged NSS MIT Home Experience
 * Unifies Identity, Institutional Context, Cardinal Objectives,
 * Key Statistics, Guiding Motto, and Impact Domains.
 */
export default function Home() {
  return (
    <div className="page-wrapper min-h-screen bg-canvas text-foreground">
      {/* 1. Hero: Identity & Purpose */}
      <Hero />

      {/* 2. Institutional Overview & Founding Heritage */}
      <AboutSection />

      {/* 3. Authoritative Statistics at a Glance */}
      <StatsSection />

      {/* 4. Cardinal Objectives (10-Point Numbered System) */}
      <ObjectivesSection />

      {/* 5. Guiding Motto: "Not Me But You" */}
      <MottoSection />

      {/* 6. Domains of Community Impact */}
      <ImpactSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}