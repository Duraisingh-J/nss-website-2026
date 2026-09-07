import React, { useState } from "react";
import Footer from "../components/Footer";
import PersonCard from "../components/PersonCard";
import { PEOPLE } from "../data/data";
import "./People.css";

function SectionHeading({ title }) {
  return (
    <div className="people-section-heading">
      <h2>{title}</h2>
      <div className="people-section-line" />
    </div>
  );
}

export default function People() {
  const [unitTab, setUnitTab] = useState("finalYear");

  return (
    <div className="page-wrapper">

      <section className="people-header">
        <div className="people-header-text">
          <div className="eyebrow">The Team</div>
          <h1>Our People</h1>
          <p>The dedicated faculty and student leaders driving NSS at our institution.</p>
        </div>
      </section>

      <div className="people-body section-pad">

       
        {/* ── 2. NSS Coordinator ── */}
        <SectionHeading title="NSS Coordinator" />
        <div className="people-grid people-grid--wide">
          <PersonCard
            size="lg"
            image={PEOPLE.nssCoordinator.image}
            initials={PEOPLE.nssCoordinator.initials}
            name={PEOPLE.nssCoordinator.name}
            role={PEOPLE.nssCoordinator.role}
            dept={PEOPLE.nssCoordinator.dept}
            post={PEOPLE.nssCoordinator.post}
            phone={PEOPLE.nssCoordinator.phone}
            email={PEOPLE.nssCoordinator.email}
            badge="NSS Coordinator"
          />
        </div>

        {/* ── 3. Program Officers ── */}
        <SectionHeading title="Program Officers" />
        <div className="people-grid">
          {PEOPLE.programOfficers.map((p, i) => (
            <PersonCard
              key={i}
              image={p.image}
              initials={p.initials}
              name={p.name}
              role={`Program Officer – ${p.unit}`}
              dept={`Dept.of ${p.dept}`}
              post={p.post}
              phone={p.phone}
              badge={`PO · ${p.unit}`}
            />
          ))}
        </div>

        {/* ── 4. Treasurers ── */}
        <SectionHeading title="Treasurers" />
        <div className="people-grid people-grid--narrow">
          {PEOPLE.treasurers.map((p, i) => (
            <PersonCard
              key={i}
              image={p.image}
              initials={p.initials}
              name={p.name}
              reg={p.reg}
              dept={`${p.year} · ${p.dept}`}
              badge={p.role}
            />
          ))}
        </div>

        {/* ── 5. Session Coordinators ── */}
        <SectionHeading title="Session Coordinators" />
        <div className="people-grid people-grid--narrow">
          {PEOPLE.sessionCoordinators.map((p, i) => (
            <PersonCard
              key={i}
              image={p.image}
              initials={p.initials}
              name={p.name}
              reg={p.reg}
              dept={`${p.year} · ${p.dept}`}
              badge={p.role}
            />
          ))}
        </div>

        {/* ── 6. Report Heads ── */}
        <SectionHeading title="Report Heads" />
        <div className="people-grid people-grid--narrow">
          {PEOPLE.reportHeads.map((p, i) => (
            <PersonCard
              key={i}
              image={p.image}
              initials={p.initials}
              name={p.name}
              reg={p.reg}
              dept={`${p.year} · ${p.dept}`}
              badge={p.role}
            />
          ))}
        </div>

        {/* ── 7. Design Heads ── */}
        <SectionHeading title="Design Heads" />
        <div className="people-grid people-grid--narrow">
          {PEOPLE.designHeads.map((p, i) => (
            <PersonCard
              key={i}
              image={p.image}
              initials={p.initials}
              name={p.name}
              reg={p.reg}
              dept={`${p.year} · ${p.dept}`}
              badge={p.role}
            />
          ))}
        </div>

        {/* ── 8. Unit Incharges ── */}
        <SectionHeading title="Unit Incharges" />

        <div className="unit-tabs">
          <button
            className={`unit-tab${unitTab === "finalYear" ? " unit-tab--active" : ""}`}
            onClick={() => setUnitTab("finalYear")}
          >
            Final Year
          </button>
          <button
            className={`unit-tab${unitTab === "preFinalYear" ? " unit-tab--active" : ""}`}
            onClick={() => setUnitTab("preFinalYear")}
          >
            Pre‑Final Year
          </button>
        </div>

        <div className="people-grid">
          {PEOPLE.unitIncharges[unitTab].map((p, i) => (
            <PersonCard
              key={i}
              image={p.image}
              initials={p.initials}
              name={p.name}
              reg={p.reg}
              dept={`${unitTab === "finalYear" ? "Final" : "Pre‑Final"} Year · ${p.dept}`}
              badge={p.unit}
            />
          ))}
        </div>

      </div>

      <Footer />
    </div>
  );
}