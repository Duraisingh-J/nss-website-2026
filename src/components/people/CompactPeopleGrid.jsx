import React from "react";
import "./CompactPeopleGrid.css";

/**
 * CompactPeopleGrid
 * Elegant centered layout for small teams (2-3 members) like Report Heads / Design Heads,
 * preventing awkward empty 3D spaces while maintaining rich institutional design.
 */
export default function CompactPeopleGrid({ people = [], fallbackRole = "Head" }) {
  if (!people || people.length === 0) return null;

  return (
    <div className="compact-people-grid">
      {people.map((person, idx) => {
        const {
          name,
          role,
          badge,
          dept,
          year,
          reg,
          image,
          initials,
        } = person;

        const baseRole = role || badge || fallbackRole;
        const roleWithYear = year && !baseRole.toLowerCase().includes("year")
          ? `${baseRole} · ${year}`
          : baseRole;

        const cleanDept = dept
          ? dept
              .replace(/^Dept\.\s*of\s+/i, "")
              .replace(/^Dept\.\s*/i, "")
              .replace(/^Department\s*of\s+/i, "")
              .replace(/^Department\s*/i, "")
              .trim()
          : null;
        const deptText = cleanDept ? `Department of ${cleanDept}` : null;

        return (
          <div key={reg || name || idx} className="compact-person-card">
            <div className="compact-person-card__media">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="compact-person-card__img"
                  loading="lazy"
                />
              ) : (
                <div className="compact-person-card__initials">
                  {initials ||
                    name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                </div>
              )}

              {baseRole && (
                <div className="compact-person-card__badge">{baseRole}</div>
              )}
            </div>

            <div className="compact-person-card__body">
              <div className="compact-person-card__role">{roleWithYear}</div>
              <h3 className="compact-person-card__name">{name}</h3>
              {deptText && (
                <div className="compact-person-card__dept">
                  {deptText}
                </div>
              )}
              {reg && (
                <div
                  className="compact-person-card__reg"
                  title={`Registration Number: ${reg}`}
                >
                  <span className="compact-person-card__reg-label">REG</span>
                  <span className="compact-person-card__reg-dot">·</span>
                  <span className="compact-person-card__reg-val">{reg}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
