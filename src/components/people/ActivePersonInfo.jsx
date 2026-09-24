import React, { useState, useEffect, useRef } from "react";
import { Phone, Mail } from "lucide-react";
import { getStaffProfileUrl } from "../../data/staffProfileLinks.js";
import "./ActivePersonInfo.css";

/**
 * ActivePersonInfo
 * Reusable editorial typography component displaying the active person's details.
 * Supports 'left' (desktop two-column) and 'center' (mobile/standalone) alignments.
 * Animates text smoothly on active slide change (opacity: 0 -> 1, translateY: 8px -> 0).
 */
export default function ActivePersonInfo({
  person,
  fallbackRole = "Member",
  align = "left",
}) {
  const [displayedPerson, setDisplayedPerson] = useState(person);
  const [animState, setAnimState] = useState("active"); // 'active' | 'exiting' | 'entering'
  const prevPersonRef = useRef(person);

  useEffect(() => {
    if (!person) return;
    if (
      prevPersonRef.current &&
      prevPersonRef.current.name === person.name &&
      prevPersonRef.current.unit === person.unit &&
      prevPersonRef.current.role === person.role
    ) {
      return;
    }

    prevPersonRef.current = person;

    // Trigger subtle exit animation (100ms)
    setAnimState("exiting");

    const timer1 = setTimeout(() => {
      setDisplayedPerson(person);
      setAnimState("entering");

      // Animate into active state (180ms)
      const timer2 = setTimeout(() => {
        setAnimState("active");
      }, 40);

      return () => clearTimeout(timer2);
    }, 120);

    return () => clearTimeout(timer1);
  }, [person]);

  if (!displayedPerson) return null;

  const {
    name,
    role,
    dept,
    post,
    unit,
    reg,
    phone,
    email,
    badge,
    year,
    profileUrl: rawProfileUrl,
  } = displayedPerson;

  const profileUrl = (rawProfileUrl || getStaffProfileUrl(displayedPerson) || "").trim();
  const isClickable = Boolean(profileUrl);

  // Derive full Role · Unit label (e.g. "PROGRAM OFFICER · UNIT I" or "UNIT INCHARGE · UNIT I")
  const getRoleUnitText = () => {
    // 1. If badge already combines role & unit with '·'
    if (badge && unit && badge.includes("·")) {
      return badge;
    }
    // 2. If role and unit both exist and role doesn't already contain unit
    if (role && unit && !role.toLowerCase().includes(unit.toLowerCase())) {
      return `${role} · ${unit}`;
    }
    // 3. Fallbacks
    if (badge) return badge;
    if (role) return role;
    if (unit) return `${fallbackRole} · ${unit}`;
    return fallbackRole || null;
  };

  const roleText = getRoleUnitText();

  // Include year after the role/post text (e.g. "Senior Volunteer · Final Year")
  const displayPost = post
    ? (year && !post.toLowerCase().includes("year") ? `${post} · ${year}` : post)
    : (year || null);

  // Standardize department to "Department of ..." (replacing "Dept.")
  const cleanDeptName = dept
    ? dept
        .replace(/^Dept\.\s*of\s+/i, "")
        .replace(/^Dept\.\s*/i, "")
        .replace(/^Department\s*of\s+/i, "")
        .replace(/^Department\s*/i, "")
        .trim()
    : null;
  const deptText = cleanDeptName ? `Department of ${cleanDeptName}` : null;

  return (
    <div
      className={`active-person-info active-person-info--${align}`}
      aria-live="polite"
    >
      <div
        className={`active-person-info__content active-person-info__content--${animState}`}
      >
        {/* Profile Content Area - clickable if profileUrl exists */}
        {isClickable ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="active-person-info__header-link"
            aria-label={`View external profile of ${name}`}
          >
            {/* Role Pill */}
            {roleText && (
              <div className="active-person-info__role">{roleText}</div>
            )}

            {/* Person Name */}
            <h3 className="active-person-info__name active-person-info__name--link">
              {name}
            </h3>

            {/* Academic / Staff Post / Designation + Year */}
            {displayPost && (
              <div className="active-person-info__post">{displayPost}</div>
            )}

            {/* Department Highlight Chip */}
            {deptText && (
              <div className="active-person-info__dept">
                {deptText}
              </div>
            )}

            {/* Institutional Unit */}
            <div className="active-person-info__institution">
            </div>
          </a>
        ) : (
          <>
            {/* Role Pill */}
            {roleText && (
              <div className="active-person-info__role">{roleText}</div>
            )}

            {/* Person Name */}
            <h3 className="active-person-info__name">{name}</h3>

            {/* Academic / Staff Post / Designation + Year */}
            {displayPost && (
              <div className="active-person-info__post">{displayPost}</div>
            )}

            {/* Department Highlight Chip */}
            {deptText && (
              <div className="active-person-info__dept">
                {deptText}
              </div>
            )}

            {/* Institutional Unit */}
            <div className="active-person-info__institution">
  
            </div>
          </>
        )}

        {/* Subtle separator rule */}
        <div className="active-person-info__rule" />

        {/* Contact info or Registration ID */}
        <div className="active-person-info__meta">
          {reg && (
            <div
              className="active-person-info__reg-badge"
              title={`Registration Number: ${reg}`}
            >
              <span className="active-person-info__reg-label">REG</span>
              <span className="active-person-info__reg-dot">·</span>
              <span className="active-person-info__reg-val">{reg}</span>
            </div>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="active-person-info__meta-item active-person-info__link"
              title={`Call ${phone}`}
              aria-label="Call"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone size={13} strokeWidth={2} />
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="active-person-info__meta-item active-person-info__link"
              title={`Send email to ${email}`}
              aria-label="Send email"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail size={13} strokeWidth={2} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
