import React, { useState, useEffect } from 'react';

export default function PhotoFieldConvergence({ phase, photos, config }) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isVisible = phase === 'photo-field' || phase === 'converging';
  const isConverging = phase === 'converging';

  if (!isVisible && phase !== 'logo-reveal') {
    return null;
  }

  // Filter or scale photos for mobile if necessary
  const activePhotos = isMobile ? photos.slice(0, 16) : photos;

  return (
    <div 
      className={`photo-space-canvas ${isConverging ? 'converging-active' : ''}`}
      style={{
        opacity: (phase === 'logo-reveal') ? 0 : 1,
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none'
      }}
    >
      <div className="photo-space-anchor">
        {activePhotos.map((item) => {
          // Responsive coordinate scaling
          const coordMultiplier = isMobile ? 0.75 : 1.0;
          const targetX = item.x * coordMultiplier;
          const targetY = item.y * coordMultiplier;

          // Depth-based parameters
          let baseScale = 1.0;
          let blurAmount = 0;
          let baseOpacity = 0.9;
          let zIndex = 20;

          if (item.depth === 'near') {
            baseScale = isMobile ? 0.85 : 1.15;
            blurAmount = 0;
            baseOpacity = 0.98;
            zIndex = 30;
          } else if (item.depth === 'middle') {
            baseScale = isMobile ? 0.65 : 0.9;
            blurAmount = 0;
            baseOpacity = 0.85;
            zIndex = 20;
          } else if (item.depth === 'far') {
            baseScale = isMobile ? 0.45 : 0.65;
            blurAmount = 1.5;
            baseOpacity = 0.55;
            zIndex = 10;
          }

          // Calculate transform based on phase
          let transformStyle = '';
          let currentOpacity = baseOpacity;

          if (isConverging) {
            // Converging: All photos glide toward center (0, 0)
            // Near photos glide quickly, outer photos compress inward
            transformStyle = `translate3d(${targetX * 0.12}vw, ${targetY * 0.12}vh, 0) rotate(${item.rotate * 0.2}deg) scale(${baseScale * 0.35})`;
            currentOpacity = 0.15; // Soft concentration dissolve
          } else {
            // Space field initial placement with natural drift
            transformStyle = `translate3d(${targetX}vw, ${targetY}vh, 0) rotate(${item.rotate}deg) scale(${baseScale})`;
            currentOpacity = baseOpacity;
          }

          // Staggered inward timing during convergence: outer photos drift first
          const distFromCenter = Math.sqrt(item.x * item.x + item.y * item.y);
          const convergenceDelay = isConverging ? `${Math.min(distFromCenter * 15, 600)}ms` : `${item.delay * 0.8}s`;

          return (
            <div
              key={item.id}
              className={`photo-space-card depth-${item.depth} ${isConverging ? 'inward-glide' : ''}`}
              style={{
                transform: transformStyle,
                opacity: currentOpacity,
                filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
                zIndex: zIndex,
                transitionDelay: convergenceDelay,
                aspectRatio: item.aspectRatio || '4/3'
              }}
            >
              <img
                src={item.url}
                alt={item.title}
                loading="eager"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="photo-card-sheen" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
