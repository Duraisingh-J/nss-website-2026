import React from "react";
import { getStaffProfileUrl } from "../data/staffProfileLinks.js";
import "./PersonCard.css";

export default function PersonCard({
  id,
  image,
  initials,
  name,
  reg,
  post,
  dept,
  phone,
  email,
  badge,
  profileUrl: rawProfileUrl,
  size = "md",
}) {
  const profileUrl = (
    rawProfileUrl ||
    getStaffProfileUrl({ id, name, reg }) ||
    ""
  ).trim();
  const isClickable = Boolean(profileUrl);

  return (
    <div
      className={`person-card person-card--${size} ${isClickable ? "person-card--clickable" : ""
        }`}
    >
      {isClickable && (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="person-card__link-overlay"
          aria-label={`View profile of ${name}`}
        />
      )}
      <div className="person-avatar">
        <ProfileImage
          src={image}
          alt={name}
          className="person-photo"
          personInfo={{ name, originalSrc: image }}
          fallback={<span className="person-initials">{initials}</span>}
        />
      </div>
      <div className="person-info">
        {badge && <div className="person-badge-inline">{badge}</div>}
        <h4 className="person-name">{name}</h4>

        {reg && (
          <div className="person-reg-badge" title={`Registration Number: ${reg}`}>
            <span className="person-reg-label">REG</span>
            <span className="person-reg-dot">·</span>
            <span className="person-reg-val">{reg}</span>
          </div>
        )}
        {dept && <p className="person-dept">{dept}</p>}
        {post && <p className="person-dept">{post}</p>}
        {phone && (
          <p className="person-contact">
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              style={{ position: "relative", zIndex: 2 }}
            >
              📞 {phone}
            </a>
          </p>
        )}
        {email && (
          <p className="person-contact">
            <a
              href={`mailto:${email}`}
              onClick={(e) => e.stopPropagation()}
              style={{ position: "relative", zIndex: 2 }}
            >
              ✉️ {email}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}