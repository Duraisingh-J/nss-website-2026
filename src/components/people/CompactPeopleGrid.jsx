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

        const roleText = role || badge || fallbackRole;

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

              {roleText && (
                <div className="compact-person-card__badge">{roleText}</div>
              )}
            </div>

            <div className="compact-person-card__body">
              <div className="compact-person-card__role">{roleText}</div>
              <h3 className="compact-person-card__name">{name}</h3>
              {dept && (
                <div className="compact-person-card__dept">
                  {year && `${year} · `}
                  {dept.startsWith("Dept.") ? dept : `${dept}`}
                </div>
              )}
              {reg && (
                <div className="compact-person-card__reg">Reg: {reg}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
