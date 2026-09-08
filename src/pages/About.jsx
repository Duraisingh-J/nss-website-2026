import React from "react";
import Footer from "../components/Footer";
import "./About.css";

export default function About() {
  return (
    <div className="page-wrapper">

      {/* ===== GOVERNMENT BANNER ===== */}
      <div className="gov-banner">
        <img src={`${process.env.PUBLIC_URL}/images/nss-horizontal.png`} alt="NSS Government Banner" />
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="about-hero">
        {/* <div className="about-logo-wrapper">
          <img src="/images/nss.png" alt="NSS Logo" />
        </div> */}

        <div className="about-hero-text">
          <h1>National Service Scheme</h1>
          <div className="motto-badge">Not Me But You</div>
          <p>
            The National Service Scheme (NSS) is a Central Sector Scheme of the
            Government of India under the Ministry of Youth Affairs and Sports.
            Launched on 24th September 1969, it aims at developing the personality
            and character of students through voluntary community service.
          </p>
        </div>
      </section>

      {/* ===== OBJECTIVES ===== */}
      <section className="objectives-section section-pad">
        <h2 className="section-title">
          Main <span>Objectives</span> of NSS
        </h2>

        <div className="objectives-grid">
          <ul>
            <li>Understand the community in which they work</li>
            <li>Understand themselves in relation to their community</li>
            <li>Identify the needs and problems of the community and involve them in problem-solving</li>
            <li>Develop among themselves a sense of social and civic responsibility</li>
            <li>Utilise their knowledge in finding practical solutions to individual and community problems</li>
          </ul>

          <ul>
            <li>Develop competence required for group-living and sharing of responsibilities</li>
            <li>Gain skills in mobilising community participation</li>
            <li>Acquire leadership qualities and democratic attitudes</li>
            <li>Develop capacity to meet emergencies and natural disasters</li>
            <li>Practise national integration and social harmony</li>
          </ul>
        </div>
      </section>

      {/* ===== MOTTO SECTION ===== */}
      <section className="motto-section">
        <h2>Our Motto</h2>
        <div className="motto-text">"Not Me But You"</div>
        <p>
          The motto of NSS reflects the essence of democratic living and upholds
          the need for selfless service. It emphasizes that the welfare of an
          individual is ultimately dependent on the welfare of society as a whole.
        </p>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section className="contact-section section-pad">
        <h2 className="section-title">
          Contact <span>Information</span>
        </h2>
        <div className="contact-card">
          <p><strong>Email:</strong> nssmit7@gmail.com</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}