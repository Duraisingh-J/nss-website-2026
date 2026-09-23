import React, { useState } from 'react';
import { Sliders, X, RotateCcw } from 'lucide-react';

export default function ConfigPanel({ currentPhase, setPhase, onReset, config, setCountdownSec }) {
  const [isOpen, setIsOpen] = useState(false);

  const phases = [
    { id: 'prologue', label: '1. Prologue' },
    { id: 'photo-field', label: '2. Photo Field' },
    { id: 'converging', label: '3. Convergence' },
    { id: 'logo-reveal', label: '4. Official Logo' },
    { id: 'motto', label: '5. Motto (Not Me But You)' },
    { id: 'countdown', label: '6. Countdown' },
    { id: 'ready', label: '7. Ready to Enter' },
    { id: 'completed', label: '8. Portal Completed' }
  ];

  return (
    <>
      <button 
        className="dev-drawer-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        title="Developer / Tester Preview Controls"
      >
        <Sliders size={14} />
        <span>Dev Controls</span>
      </button>

      {isOpen && (
        <div className="dev-drawer-panel">
          <div className="dev-drawer-title">
            <span>INTRO SEQUENCE PREVIEW</span>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Jump to Stage:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
              {phases.map((p) => (
                <button
                  key={p.id}
                  className={`dev-phase-btn ${currentPhase === p.id ? 'active' : ''}`}
                  onClick={() => setPhase(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Countdown Duration:
            </span>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {[3, 6, 10].map((sec) => (
                <button
                  key={sec}
                  className={`dev-phase-btn ${config.countdown.durationSeconds === sec ? 'active' : ''}`}
                  style={{ flex: 1, textAlign: 'center' }}
                  onClick={() => setCountdownSec(sec)}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <button 
            className="replay-btn" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              onReset();
              setIsOpen(false);
            }}
          >
            <RotateCcw size={14} />
            <span>Restart From Beginning</span>
          </button>
        </div>
      )}
    </>
  );
}
