import React, { useState, useMemo } from "react";
import Footer from "../components/Footer";
import { PEOPLE } from "../data/data";

import PeopleHero from "../components/people/PeopleHero";
import CoordinatorSpotlight from "../components/people/CoordinatorSpotlight";
import PeopleSection from "../components/people/PeopleSection";
import PeopleDepthCarousel from "../components/people/PeopleDepthCarousel";
import UnitSelector from "../components/people/UnitSelector";

import "./People.css";

export default function People() {
  const [selectedUnit, setSelectedUnit] = useState("Unit I");
  const [yearFilter, setYearFilter] = useState("all");

  // Format Program Officers (7 members)
  const programOfficers = useMemo(() => {
    return (PEOPLE.programOfficers || []).map((p) => ({
      ...p,
      badge: `PO · ${p.unit}`,
      role: `Program Officer – ${p.unit}`,
      dept: p.dept ? (p.dept.startsWith("Dept.") ? p.dept : `Dept. of ${p.dept}`) : null,
    }));
  }, []);

  // Format Treasurers (2 members)
  const treasurers = useMemo(() => {
    return (PEOPLE.treasurers || []).map((p) => ({
      ...p,
      badge: p.role || "Treasurer",
      role: p.role,
      dept: `${p.year || "Final Year"} · ${p.dept || ""}`,
    }));
  }, []);

  // Format Session Coordinators (3 members)
  const sessionCoordinators = useMemo(() => {
    return (PEOPLE.sessionCoordinators || []).map((p) => ({
      ...p,
      badge: p.role || "Session Coordinator",
      role: p.role,
      dept: `${p.year || "Final Year"} · ${p.dept || ""}`,
    }));
  }, []);

  // Format Report Heads (2 members)
  const reportHeads = useMemo(() => {
    return (PEOPLE.reportHeads || []).map((p) => ({
      ...p,
      badge: p.role || "Report Head",
      role: p.role,
      dept: `${p.year || "Final Year"} · ${p.dept || ""}`,
    }));
  }, []);

  // Format Design Heads (3 members)
  const designHeads = useMemo(() => {
    return (PEOPLE.designHeads || []).map((p) => ({
      ...p,
      badge: p.role || "Design Head",
      role: p.role,
      dept: `${p.year || "Final Year"} · ${p.dept || ""}`,
    }));
  }, []);

  // Format Unit Incharges (All Units)
  const allUnitIncharges = useMemo(() => {
    const finalYears = (PEOPLE.unitIncharges?.finalYear || []).map((p) => ({
      ...p,
      year: "Final Year",
      badge: `Final Year · ${p.unit}`,
      role: `Unit Incharge – ${p.unit}`,
    }));

    const preFinalYears = (PEOPLE.unitIncharges?.preFinalYear || []).map((p) => ({
      ...p,
      year: "Pre-Final Year",
      badge: `Pre-Final · ${p.unit}`,
      role: `Unit Incharge – ${p.unit}`,
    }));

    return [...finalYears, ...preFinalYears];
  }, []);

  // Filter incharges by unit & year filter
  const filteredUnitIncharges = useMemo(() => {
    return allUnitIncharges
      .filter((p) => p.unit === selectedUnit)
      .filter((p) => {
        if (yearFilter === "finalYear") return p.year === "Final Year";
        if (yearFilter === "preFinalYear") return p.year === "Pre-Final Year";
        return true;
      });
  }, [allUnitIncharges, selectedUnit, yearFilter]);

  return (
    <div className="page-wrapper people-page">
      {/* ── 1. Hero Section ── */}
      <PeopleHero />

      <main className="people-main-container">
        {/* ── 2. NSS Coordinator Spotlight ── */}
        <section className="coordinator-section-wrapper" aria-label="NSS Coordinator Spotlight">
          <PeopleSection
            eyebrow="Campus Leadership"
            title="NSS Coordinator"
            subtitle="Guiding the vision and service initiatives across all NSS MIT units."
          >
            <CoordinatorSpotlight coordinator={PEOPLE.nssCoordinator} />
          </PeopleSection>
        </section>

        {/* ── 3. Program Officers DepthCarousel ── */}
        <PeopleSection
          eyebrow="Faculty Incharges"
          title="Program Officers"
          subtitle="Faculty members supervising and coordinating civic service across Units I through VII."
          id="program-officers"
        >
          <PeopleDepthCarousel
            people={programOfficers}
            fallbackRole="Program Officer"
          />
        </PeopleSection>

        {/* ── 4. Treasurers DepthCarousel ── */}
        <PeopleSection
          eyebrow="Student Leadership"
          title="Treasurers"
          subtitle="Managing financial integrity, resource budgeting, and event accounts."
          id="treasurers"
        >
          <PeopleDepthCarousel
            people={treasurers}
            fallbackRole="Treasurer"
          />
        </PeopleSection>

        {/* ── 5. Session Coordinators DepthCarousel ── */}
        <PeopleSection
          eyebrow="Operational Management"
          title="Session Coordinators"
          subtitle="Orchestrating weekly sessions, training modules, and social service drives."
          id="session-coordinators"
        >
          <PeopleDepthCarousel
            people={sessionCoordinators}
            fallbackRole="Session Coordinator"
          />
        </PeopleSection>

        {/* ── 6. Report Heads DepthCarousel ── */}
        <PeopleSection
          eyebrow="Documentation & Editorial"
          title="Report Heads"
          subtitle="Documenting community initiatives, annual reports, and impact audits."
          id="report-heads"
        >
          <PeopleDepthCarousel
            people={reportHeads}
            fallbackRole="Report Head"
          />
        </PeopleSection>

        {/* ── 7. Design Heads DepthCarousel ── */}
        <PeopleSection
          eyebrow="Creative & Media"
          title="Design Heads"
          subtitle="Crafting visual identities, campaign materials, and public outreach designs."
          id="design-heads"
        >
          <PeopleDepthCarousel
            people={designHeads}
            fallbackRole="Design Head"
          />
        </PeopleSection>

        {/* ── 8. Unit Incharges DepthCarousel ── */}
        <PeopleSection
          eyebrow="Student Units"
          title="Unit Incharges"
          subtitle="Explore the dedicated student coordinators leading individual units across final and pre-final batches."
          id="unit-incharges"
        >
          {/* Modern Editorial Unit Selector with Sliding Underline */}
          <UnitSelector
            selectedUnit={selectedUnit}
            onSelectUnit={setSelectedUnit}
            yearFilter={yearFilter}
            onSelectYear={setYearFilter}
          />

          {/* Unit Members DepthCarousel */}
          {filteredUnitIncharges.length > 0 ? (
            <PeopleDepthCarousel
              key={`${selectedUnit}-${yearFilter}`}
              people={filteredUnitIncharges}
              fallbackRole="Unit Incharge"
            />
          ) : (
            <div className="people-empty-notice">
              <p>No members registered under {yearFilter === "finalYear" ? "Final Year" : "Pre-Final Year"} for {selectedUnit}.</p>
              <button
                type="button"
                className="unit-year-pill unit-year-pill--active"
                style={{ marginTop: "10px" }}
                onClick={() => setYearFilter("all")}
              >
                View All {selectedUnit} Incharges
              </button>
            </div>
          )}
        </PeopleSection>
      </main>

      {/* Global Footer (Preserved untouched) */}
      <Footer />
    </div>
  );
}