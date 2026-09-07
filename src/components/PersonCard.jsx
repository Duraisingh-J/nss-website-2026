import React from "react";
import "./PersonCard.css";

export default function PersonCard({ image, initials, name, reg,post, dept, phone, email, badge, size = "md" }) {
  return (
    <div className={`person-card person-card--${size}`}>
      <div className="person-avatar">
        {image ? (
          <img
            src={image}
            alt={name}
            className="person-photo"
          />
        ) : (
          <span className="person-initials">{initials}</span>
        )}
        {badge && <div className="person-badge">{badge}</div>}
      </div>
      <div className="person-info">
        <h4 className="person-name">{name}</h4>
      
        
        {reg  && <p className="person-role">{reg}</p>}
        {dept  && <p className="person-dept">{dept}</p>}
        {post  && <p className="person-dept">{post}</p>}
        {phone && <p className="person-contact">📞 {phone}</p>}
        {email && <p className="person-contact">✉️ {email}</p>}
      </div>
    </div>
  );
}