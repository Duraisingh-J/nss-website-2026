import React, { useState, useEffect, useRef } from "react";
import { Phone, Mail } from "lucide-react";
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
  } = displayedPerson;

  const roleText =
    role || (unit ? `Program Officer – ${unit}` : badge || fallbackRole);

  const deptText = dept
    ? dept.startsWith("Dept.")
      ? dept
      : `Department of ${dept}`
    : null;

  return (
    <div
      className={`active-person-info active-person-info--${align}`}
      aria-live="polite"
    >
      <div
        className={`active-person-info__content active-person-info__content--${animState}`}
      >
        {/* Role Pill */}
        {roleText && (
          <div className="active-person-info__role">{roleText}</div>
        )}

        {/* Person Name */}
        <h3 className="active-person-info__name">{name}</h3>

        {/* Academic / Staff Post / Designation */}
        {post && <div className="active-person-info__post">{post}</div>}

        {/* Department / Year */}
        {(deptText || year) && (
          <div className="active-person-info__dept">
            {year && `${year} · `}
            {deptText}
          </div>
        )}

        {/* Institutional Unit */}
        <div className="active-person-info__institution">
          <span className="active-person-info__institution-dot" />
          <span>NSS MIT Anna University</span>
        </div>

        {/* Subtle separator rule */}
        <div className="active-person-info__rule" />

        {/* Contact info or Registration ID */}
        <div className="active-person-info__meta">
          {reg && (
            <span className="active-person-info__meta-item">
              <span className="active-person-info__reg-badge">
                Reg: {reg}
              </span>
            </span>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="active-person-info__meta-item active-person-info__link"
              title="Call phone"
            >
              <Phone size={13} strokeWidth={2} />
              <span>{phone}</span>
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="active-person-info__meta-item active-person-info__link"
              title="Send email"
            >
              <Mail size={13} strokeWidth={2} />
              <span>{email}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
