import React from 'react';

export default function MottoSection({ config }) {
  const { branding } = config;

  return (
    <div className="motto-reveal-container">
      <div className="motto-eyebrow">{branding.organizationName}</div>
      <h2 className="motto-hero-text">{branding.motto}</h2>
      <p className="motto-sub-statement">{branding.movementStatement}</p>
    </div>
  );
}
