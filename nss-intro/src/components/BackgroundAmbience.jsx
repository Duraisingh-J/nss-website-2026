import React from 'react';

export default function BackgroundAmbience({ phase }) {
  const isWarping = phase === 'portal';

  return (
    <div className={`ambient-lighting ${isWarping ? 'portal-active' : ''}`}>
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />
      <div 
        className="ambient-center-flare" 
        style={{
          opacity: phase === 'converging' || phase === 'countdown' || phase === 'ready' ? 0.9 : 0.4,
          transform: isWarping ? 'translate(-50%, -50%) scale(3)' : 'translate(-50%, -50%) scale(1)'
        }} 
      />
      <div className="ambient-grid" />
      <div className="noise-overlay" />
    </div>
  );
}
