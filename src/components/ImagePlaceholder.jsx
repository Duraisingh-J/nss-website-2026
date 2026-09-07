import React from "react";
import "./ImagePlaceholder.css";

export default function ImagePlaceholder({ label = "", aspectRatio = "4/3", size = "md" }) {
  return (
    <div className={`img-placeholder img-placeholder--${size}`} style={{ aspectRatio }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      {label && <span>{label}</span>}
    </div>
  );
}
