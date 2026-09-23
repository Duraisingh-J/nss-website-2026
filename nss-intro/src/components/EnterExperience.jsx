import React, { useState, useRef } from 'react';
import { ArrowRight, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function EnterExperience({ config, phase, onTriggerPortal, onReplay }) {
  const { branding, interactiveEnter } = config;
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.2;
    const distanceY = (e.clientY - centerY) * 0.2;
    setBtnOffset({ x: distanceX, y: distanceY });
  };

  const handleMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
  };

  const isPortalActive = phase === 'portal';
  const isCompleted = phase === 'completed';

  return (
    <>
      {/* Interactive Ready State */}
      {phase === 'ready' && (
        <div className="enter-cta-container">
          <div style={{ position: 'relative' }}>
            <div className="enter-ripple-ring" />
            <button
              ref={buttonRef}
              className="magnetic-enter-btn"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={onTriggerPortal}
              style={{
                transform: `translate3d(${btnOffset.x}px, ${btnOffset.y}px, 0)`
              }}
            >
              <span>{interactiveEnter.buttonLabel || "ENTER EXPERIENCE"}</span>
              <ArrowRight className="btn-arrow-icon" />
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
            Click to activate portal sequence
          </span>
        </div>
      )}

      {/* Portal Aperture Overlay */}
      <div className={`portal-aperture-overlay ${isPortalActive ? 'portal-active' : ''}`} />

      {/* Showcase / Completed Modal */}
      {isCompleted && (
        <div className="portal-reveal-card">
          <div className="portal-icon-badge">
            <Sparkles size={32} color="#FFFFFF" />
          </div>

          <div>
            <div style={{ 
              color: 'var(--nss-gold)', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              letterSpacing: '0.25em', 
              textTransform: 'uppercase', 
              marginBottom: 6 
            }}>
              {branding.unitTagline}
            </div>
            <h2 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '2rem', 
              fontWeight: 700, 
              color: '#FFF',
              marginBottom: 10
            }}>
              {interactiveEnter.portalHeadline}
            </h2>
            <p style={{ 
              color: 'var(--text-muted)', 
              fontSize: '0.95rem', 
              lineHeight: 1.6, 
              maxWidth: 480, 
              margin: '0 auto' 
            }}>
              {interactiveEnter.portalSubtext}
            </p>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '12px 20px', 
            background: 'rgba(230, 57, 70, 0.1)', 
            borderRadius: 12,
            border: '1px solid rgba(230, 57, 70, 0.25)' 
          }}>
            <CheckCircle2 size={18} color="var(--nss-red)" />
            <span style={{ fontSize: '0.8rem', color: '#E2E8F0', textAlign: 'left' }}>
              Standalone intro sequence successfully executed without touching main app routes.
            </span>
          </div>

          <button className="replay-btn" onClick={onReplay}>
            <RotateCcw size={16} />
            <span>Replay Intro Sequence</span>
          </button>
        </div>
      )}
    </>
  );
}
