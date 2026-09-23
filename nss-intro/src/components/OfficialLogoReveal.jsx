import React from 'react';

export default function OfficialLogoReveal({ phase, config }) {
  const { branding } = config;

  const isRevealed = phase === 'logo-reveal' || phase === 'motto' || phase === 'countdown' || phase === 'ready';
  const isDedicatedHold = phase === 'logo-reveal';

  if (!isRevealed) return null;

  return (
    <div 
      className={`official-logo-stage ${isDedicatedHold ? 'dedicated-hold' : 'integrated-header'}`}
    >
      <div className="official-logo-wrapper">
        <div className="official-logo-halo" />
        <img
          src={branding.officialLogoUrl || "/images/NSS_logo.png"}
          alt="Official National Service Scheme Emblem"
          className="official-nss-logo-img"
        />
      </div>

      <div className="official-logo-typography">
        <h1 className="official-org-title">{branding.organizationName}</h1>
        <p className="official-unit-subtitle">{branding.unitTagline}</p>
      </div>
    </div>
  );
}
