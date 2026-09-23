import React, { useState, useEffect, useRef, useCallback } from 'react';
import { introConfig } from './config/introConfig';
import BackgroundAmbience from './components/BackgroundAmbience';
import IntroMessage from './components/IntroMessage';
import PhotoFieldConvergence from './components/PhotoFieldConvergence';
import OfficialLogoReveal from './components/OfficialLogoReveal';
import MottoSection from './components/MottoSection';
import CountdownSection from './components/CountdownSection';
import EnterExperience from './components/EnterExperience';
import SkipControl from './components/SkipControl';
import ConfigPanel from './components/ConfigPanel';

/**
 * NSS Intro Experience - Main Sequence Coordinator
 * Full Flow:
 * prologue -> photo-field -> converging -> logo-reveal -> motto -> countdown -> ready -> portal -> completed
 */
export default function App() {
  const [config, setConfig] = useState(introConfig);
  const [phase, setPhase] = useState('prologue');
  const timerRef = useRef(null);

  const scheduleNext = useCallback((nextPhase, delayMs) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPhase(nextPhase);
    }, delayMs);
  }, []);

  // Sequence state machine
  useEffect(() => {
    if (phase === 'prologue') {
      scheduleNext('photo-field', config.timings.prologueDuration);
    } else if (phase === 'photo-field') {
      scheduleNext('converging', config.timings.photoFieldDuration);
    } else if (phase === 'converging') {
      scheduleNext('logo-reveal', config.timings.convergenceDuration);
    } else if (phase === 'logo-reveal') {
      scheduleNext('motto', config.timings.logoHoldDuration);
    } else if (phase === 'motto') {
      scheduleNext('countdown', config.timings.mottoHoldDuration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, config.timings, scheduleNext]);

  const handleCountdownComplete = () => {
    setPhase('ready');
  };

  const handleTriggerPortal = () => {
    setPhase('portal');
    setTimeout(() => {
      setPhase('completed');
    }, config.interactiveEnter.portalTransitionDurationMs);
  };

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('ready');
  };

  const handleReplay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('prologue');
  };

  const handleSetCountdownSec = (sec) => {
    setConfig((prev) => ({
      ...prev,
      countdown: {
        ...prev.countdown,
        durationSeconds: sec
      }
    }));
  };

  const showSkipButton = config.skipEnabled && (
    phase === 'prologue' || 
    phase === 'photo-field' || 
    phase === 'converging' || 
    phase === 'logo-reveal' || 
    phase === 'motto' || 
    phase === 'countdown'
  );

  return (
    <main className="intro-viewport">
      {/* Background Atmosphere */}
      <BackgroundAmbience phase={phase} />

      {/* Skip Intro Button */}
      <SkipControl visible={showSkipButton} onSkip={handleSkip} />

      {/* 1. Opening Statement */}
      {phase === 'prologue' && <IntroMessage config={config} />}

      {/* 2 & 3. Photographic Space Field & Convergence */}
      <PhotoFieldConvergence 
        phase={phase} 
        photos={config.photos} 
        config={config} 
      />

      {/* 4. Official NSS Logo Reveal */}
      {(phase === 'logo-reveal' || phase === 'motto' || phase === 'countdown' || phase === 'ready') && (
        <OfficialLogoReveal phase={phase} config={config} />
      )}

      {/* 5. Motto Reveal ("NOT ME, BUT YOU") */}
      {phase === 'motto' && <MottoSection config={config} />}

      {/* 6. Countdown Section */}
      {phase === 'countdown' && (
        <div className="center-action-overlay">
          <CountdownSection 
            config={config} 
            onCountdownComplete={handleCountdownComplete} 
          />
        </div>
      )}

      {/* 7. Ready State (Interactive Enter CTA) */}
      {phase === 'ready' && (
        <div className="center-action-overlay">
          <EnterExperience 
            config={config} 
            phase={phase} 
            onTriggerPortal={handleTriggerPortal} 
            onReplay={handleReplay} 
          />
        </div>
      )}

      {/* 8 & 9. Portal Transition & Completed Showcase Modal */}
      {(phase === 'portal' || phase === 'completed') && (
        <EnterExperience 
          config={config} 
          phase={phase} 
          onTriggerPortal={handleTriggerPortal} 
          onReplay={handleReplay} 
        />
      )}

      {/* Developer / Tester Preview Controls */}
      {config.debugControlsEnabled && (
        <ConfigPanel 
          currentPhase={phase} 
          setPhase={setPhase} 
          onReset={handleReplay} 
          config={config}
          setCountdownSec={handleSetCountdownSec}
        />
      )}
    </main>
  );
}
