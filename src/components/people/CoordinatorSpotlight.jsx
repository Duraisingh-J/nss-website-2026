import React from "react";
import { Phone, Mail, Award } from "lucide-react";
import { getStaffProfileUrl } from "../../data/staffProfileLinks.js";
import "./CoordinatorSpotlight.css";

/**
 * CoordinatorSpotlight
 * Premium spotlight card for the NSS Campus Coordinator establishing visual hierarchy.
 */
export default function CoordinatorSpotlight({ coordinator }) {
  if (!coordinator) return null;

  const {
    name = "Dr. K.M. VEERABADRAN",
    role = "NSS CAMPUS COORDINATOR",
    post = "Assistant Professor (Sr. Gr.)",
    dept = "Department of Applied Science and Humanities",
    phone = "04422516142",
    email = "kmveera@mitindia.edu",
    image = null,
    profileUrl: rawProfileUrl,
  } = coordinator;

  const cleanDept = dept
    ? dept
        .replace(/^Dept\.\s*of\s+/i, "")
        .replace(/^Dept\.\s*/i, "")
        .replace(/^Department\s*of\s+/i, "")
        .replace(/^Department\s*/i, "")
        .trim()
    : null;
  const deptText = cleanDept ? `Department of ${cleanDept}` : null;

  const profileUrl = (rawProfileUrl || getStaffProfileUrl(coordinator) || "").trim();
  const isClickable = Boolean(profileUrl);

  return (
    <div
      className={`coordinator-spotlight ${
        isClickable ? "coordinator-spotlight--clickable" : ""
      }`}
    >
      {/* External profile link overlay when URL exists */}
      {isClickable && (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="coordinator-spotlight__card-link-overlay"
          aria-label={`View external profile of ${name}`}
        />
      )}

      <div className="coordinator-spotlight__card">
        {/* Large Portrait / Initials Avatar */}
        <div className="coordinator-spotlight__portrait">
          {image ? (
            <img
              src={image}
              alt={name}
              className="coordinator-spotlight__img"
              loading="lazy"
            />
          ) : (
            <div className="coordinator-spotlight__avatar-fallback">
              <div className="coordinator-spotlight__initials">
                KMV
              </div>
              <div className="coordinator-spotlight__portrait-crest">
                <Award size={13} />
                MIT Campus
              </div>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="coordinator-spotlight__content">
          <div className="coordinator-spotlight__badge-row">
            <span className="coordinator-spotlight__badge">{role}</span>
          </div>

          <h2 className="coordinator-spotlight__name">{name}</h2>
          <div className="coordinator-spotlight__post">{post}</div>
          {deptText && <div className="coordinator-spotlight__dept">{deptText}</div>}

          <div className="coordinator-spotlight__divider" />

          <div className="coordinator-spotlight__contacts">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="coordinator-spotlight__contact-item"
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
                className="coordinator-spotlight__contact-item"
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
    </div>
  );
}
