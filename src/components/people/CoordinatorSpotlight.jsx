import React from "react";
import { Phone, Mail, Award } from "lucide-react";
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
    dept = "Dept. of Applied Science and Humanities",
    phone = "04422516142",
    email = "kmveera@mitindia.edu",
    image = null,
  } = coordinator;

  return (
    <div className="coordinator-spotlight">
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
          <div className="coordinator-spotlight__dept">{dept}</div>

          <div className="coordinator-spotlight__divider" />

          <div className="coordinator-spotlight__contacts">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="coordinator-spotlight__contact-item"
                title="Call office phone"
              >
                <Phone size={14} />
                <span>{phone}</span>
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="coordinator-spotlight__contact-item"
                title="Send official email"
              >
                <Mail size={14} />
                <span>{email}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
