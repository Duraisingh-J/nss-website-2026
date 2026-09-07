import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import ImagePlaceholder from "../components/ImagePlaceholder";
import { STATS, GALLERY } from "../data/data";
import "./Home.css";

/* ---------------- Counter Hook ---------------- */
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const stepTime = duration / steps;
          let current = 0;
          const increment = Math.ceil(target / steps);

          const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setCount(current);
            if (current >= target) clearInterval(timer);
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ---------------- Stat Block ---------------- */
function StatBlock({ label, target }) {
  const { count, ref } = useCounter(target);
  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-number">{count.toLocaleString()}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ---------------- HOME ---------------- */
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-text fade-up">
          <div className="eyebrow">
            National Service Scheme · MIT Campus · Anna University
          </div>

          <h1>
            NSS MIT <br />
            <em>Serving Society</em>
          </h1>

          <p>
            The National Service Scheme (NSS) unit of Madras Institute of Technology
            nurtures socially responsible engineers by engaging students in
            meaningful community service, rural development initiatives,
            environmental conservation, and nation-building activities.
          </p>

          <button className="hero-cta" onClick={() => navigate("/about")}>
            Learn More About NSS →
          </button>
        </div>

        <div className="hero-emblem fade-up delay-2">
          <div className="emblem-ring">
            <div className="emblem-inner">
              <span className="emblem-star">✦</span>
              <span className="emblem-motto">
                Not Me,<br />But You
              </span>
              <span className="emblem-year">
                Government of India Initiative
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT PREVIEW ================= */}
      <section className="intro-section section-pad">
        <div className="intro-content">
          <h2 className="section-title">
            About <span>NSS MIT</span>
          </h2>
          <p>
            Established under the Ministry of Youth Affairs & Sports,
            Government of India, NSS at MIT operates through seven active units
            led by dedicated Program Officers. Our volunteers work tirelessly
            to serve rural and urban communities through structured camps,
            awareness drives, and outreach programmes.
          </p>

          <p>
            Through participation in blood donation camps, village adoption
            programmes, literacy initiatives, Swachh Bharat drives, disaster
            relief efforts, and environmental campaigns, NSS MIT aims to
            cultivate leadership, empathy, and civic responsibility.
          </p>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <div className="stats-bar">
        {STATS.map((s) => (
          <StatBlock key={s.id} label={s.label} target={s.target} />
        ))}
      </div>

      {/* ================= GALLERY ================= */}
      <div className="gallery-section section-pad">
        <div className="gallery-header">
          <h2 className="section-title">
            Our <span>Recent Activities</span>
          </h2>
          <p>
            Highlights from camps, awareness programmes, social drives, and
            community development initiatives conducted by NSS MIT volunteers.
          </p>
        </div>

        <div className="gallery-grid">
          {GALLERY.map((item) => (
            <div
              key={item.id}
              className={`gallery-item${
                item.featured ? " gallery-item--featured" : ""
              }`}
            >
              <ImagePlaceholder
                label={item.label}
                size={item.featured ? "lg" : "md"}
              />
              <div className="gallery-overlay">
                <span className="gallery-caption">
                  {item.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CALL TO ACTION ================= */}
      <section className="home-cta">
        <button onClick={() => navigate("/events")}>
          Explore Our Events →
        </button>
      </section>

      <Footer />
    </div>
  );
}