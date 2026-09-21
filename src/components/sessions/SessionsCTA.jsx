import React from "react";
import { useNavigate } from "react-router-dom";
import { Flag, ArrowRight } from "lucide-react";

/**
 * SessionsCTA — Institutional call-to-action banner before the footer.
 */
export default function SessionsCTA() {
  const navigate = useNavigate();

  return (
    <section className="sessions-cta-section" aria-label="NSS Engagement Call to Action">
      <div className="sessions-cta-container">
        
        {/* Eyebrow */}
        <div className="sessions-cta-eyebrow">
          <span className="cta-dot" aria-hidden="true" />
          <span>JOIN THE MOVEMENT</span>
        </div>

        {/* Main Editorial Quote */}
        <h2 className="sessions-cta-quote">
          SERVICE IS NOT A MOMENT. <br className="hidden sm:inline" />
          IT IS A PRACTICE<span className="text-accent">.</span>
        </h2>

        {/* Supporting Text */}
        <p className="sessions-cta-desc">
          Follow the NSS journey through special camps, social welfare outreach programmes, and nation-building initiatives across Tamil Nadu.
        </p>

        {/* Action Button */}
        <div className="sessions-cta-actions">
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="sessions-cta-primary-btn"
          >
            <Flag className="w-4 h-4 text-accent" />
            <span>EXPLORE ALL EVENTS & CAMPS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
