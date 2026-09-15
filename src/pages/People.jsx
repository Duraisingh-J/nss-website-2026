import React, { useState, useEffect, useMemo, useCallback } from "react";
import Footer from "../components/Footer";
import { getPublicPeople } from "../services/peopleService";

import PeopleHero from "../components/people/PeopleHero";
import CoordinatorSpotlight from "../components/people/CoordinatorSpotlight";
import PeopleSection from "../components/people/PeopleSection";
import PeopleDepthCarousel from "../components/people/PeopleDepthCarousel";
import UnitSelector from "../components/people/UnitSelector";

import "./People.css";

export default function People() {
  const [selectedUnit, setSelectedUnit] = useState("Unit I");
  const [yearFilter, setYearFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [peopleData, setPeopleData] = useState({
    all: [],
    nssCoordinator: null,
    programOfficers: [],
    treasurers: [],
    sessionCoordinators: [],
    reportHeads: [],
    designHeads: [],
    unitIncharges: [],
    volunteers: [],
  });

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicPeople();
      setPeopleData(data);
    } catch (err) {
      console.error("People page fetch error:", err);
      setError("Unable to load the personnel directory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  // Unit Incharges filtered by selected unit & year
  const filteredUnitIncharges = useMemo(() => {
    return (peopleData.unitIncharges || [])
      .filter((p) => p.unit === selectedUnit)
      .filter((p) => {
        if (yearFilter === "finalYear") return p.year === "Final Year";
        if (yearFilter === "preFinalYear") return p.year === "Pre-Final Year";
        return true;
      });
  }, [peopleData.unitIncharges, selectedUnit, yearFilter]);

  const hasAnyPeople = peopleData.all && peopleData.all.length > 0;

  return (
    <div className="page-wrapper people-page">
      {/* ── 1. Hero Section ── */}
      <PeopleHero />

      <main className="people-main-container">
        {/* ── LOADING STATE ── */}
        {loading && (
          <div className="people-status-container" role="status" aria-live="polite">
            <div className="people-loading-spinner" />
            <div className="people-status-title">Loading Personnel Directory</div>
            <p className="people-status-text">
              Retrieving verified NSS MIT members and coordinators...
            </p>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {!loading && error && (
          <div className="people-status-container" role="alert">
            <div className="people-status-title">Directory Unavailable</div>
            <p className="people-status-text">{error}</p>
            <button
              type="button"
              onClick={fetchPeople}
              className="people-retry-button"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !error && !hasAnyPeople && (
          <div className="people-status-container">
            <div className="people-status-title">Personnel Directory Under Update</div>
            <p className="people-status-text">
              There are currently no active personnel records published in the system.
              Please check back shortly.
            </p>
          </div>
        )}

        {/* ── CONTENT SECTIONS (Rendered only when active data exists) ── */}
        {!loading && !error && hasAnyPeople && (
          <>
            {/* ── 2. NSS Coordinator Spotlight ── */}
            {peopleData.nssCoordinator && (
              <section
                className="coordinator-section-wrapper"
                aria-label="NSS Coordinator Spotlight"
              >
                <PeopleSection
                  eyebrow="Campus Leadership"
                  title="NSS Coordinator"
                  subtitle="Guiding the vision and service initiatives across all NSS MIT units."
                >
                  <CoordinatorSpotlight coordinator={peopleData.nssCoordinator} />
                </PeopleSection>
              </section>
            )}

            {/* ── 3. Program Officers ── */}
            {peopleData.programOfficers.length > 0 && (
              <PeopleSection
                eyebrow="Faculty Incharges"
                title="Program Officers"
                subtitle="Faculty members supervising and coordinating civic service across Units I through VII."
                id="program-officers"
              >
                <PeopleDepthCarousel
                  people={peopleData.programOfficers}
                  fallbackRole="Program Officer"
                />
              </PeopleSection>
            )}

            {/* ── 4. Treasurers ── */}
            {peopleData.treasurers.length > 0 && (
              <PeopleSection
                eyebrow="Student Leadership"
                title="Treasurers"
                subtitle="Managing financial integrity, resource budgeting, and event accounts."
                id="treasurers"
              >
                <PeopleDepthCarousel
                  people={peopleData.treasurers}
                  fallbackRole="Treasurer"
                />
              </PeopleSection>
            )}

            {/* ── 5. Session Coordinators ── */}
            {peopleData.sessionCoordinators.length > 0 && (
              <PeopleSection
                eyebrow="Operational Management"
                title="Session Coordinators"
                subtitle="Orchestrating weekly sessions, training modules, and social service drives."
                id="session-coordinators"
              >
                <PeopleDepthCarousel
                  people={peopleData.sessionCoordinators}
                  fallbackRole="Session Coordinator"
                />
              </PeopleSection>
            )}

            {/* ── 6. Report Heads ── */}
            {peopleData.reportHeads.length > 0 && (
              <PeopleSection
                eyebrow="Documentation & Editorial"
                title="Report Heads"
                subtitle="Documenting community initiatives, annual reports, and impact audits."
                id="report-heads"
              >
                <PeopleDepthCarousel
                  people={peopleData.reportHeads}
                  fallbackRole="Report Head"
                />
              </PeopleSection>
            )}

            {/* ── 7. Design Heads ── */}
            {peopleData.designHeads.length > 0 && (
              <PeopleSection
                eyebrow="Creative & Media"
                title="Design Heads"
                subtitle="Crafting visual identities, campaign materials, and public outreach designs."
                id="design-heads"
              >
                <PeopleDepthCarousel
                  people={peopleData.designHeads}
                  fallbackRole="Design Head"
                />
              </PeopleSection>
            )}

            {/* ── 8. Unit Incharges ── */}
            {peopleData.unitIncharges.length > 0 && (
              <PeopleSection
                eyebrow="Student Units"
                title="Unit Incharges"
                subtitle="Explore the dedicated student coordinators leading individual units across final and pre-final batches."
                id="unit-incharges"
              >
                <UnitSelector
                  selectedUnit={selectedUnit}
                  onSelectUnit={setSelectedUnit}
                  yearFilter={yearFilter}
                  onSelectYear={setYearFilter}
                />

                {filteredUnitIncharges.length > 0 ? (
                  <PeopleDepthCarousel
                    key={`${selectedUnit}-${yearFilter}`}
                    people={filteredUnitIncharges}
                    fallbackRole="Unit Incharge"
                  />
                ) : (
                  <div className="people-empty-notice">
                    <p>
                      No members registered under{" "}
                      {yearFilter === "finalYear" ? "Final Year" : "Pre-Final Year"}{" "}
                      for {selectedUnit}.
                    </p>
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
            )}

            {/* ── 9. Volunteers / Additional Team Members ── */}
            {peopleData.volunteers.length > 0 && (
              <PeopleSection
                eyebrow="Student Volunteers"
                title="NSS Volunteers"
                subtitle="Dedicated student volunteers serving across community welfare and outreach initiatives."
                id="volunteers"
              >
                <PeopleDepthCarousel
                  people={peopleData.volunteers}
                  fallbackRole="Volunteer"
                />
              </PeopleSection>
            )}
          </>
        )}
      </main>

      {/* Global Footer (Preserved untouched) */}
      <Footer />
    </div>
  );
}