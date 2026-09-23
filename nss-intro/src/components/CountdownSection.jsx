import React, { useState, useEffect } from 'react';

export default function CountdownSection({ config, onCountdownComplete }) {
  const { countdown } = config;
  const initialSeconds = countdown.durationSeconds || 6;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!countdown.enabled) {
      onCountdownComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            onCountdownComplete?.();
          }, 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown.enabled, initialSeconds, onCountdownComplete]);

  // Find corresponding milestone from config
  const milestone = countdown.milestones.find((m) => m.atSecond === timeLeft) ||
                    countdown.milestones[countdown.milestones.length - 1] || {
                      keyword: "NSS",
                      subtext: "A Movement of Many"
                    };

  const progressPercent = ((initialSeconds - timeLeft) / initialSeconds) * 100;

  return (
    <div className="countdown-wrapper">
      <div className="countdown-digit-box">
        <span className="countdown-number">{timeLeft}</span>
        <span className="countdown-divider">—</span>
        <span className="countdown-keyword">{milestone.keyword}</span>
      </div>
      
      <p className="countdown-subtext">{milestone.subtext}</p>

      {/* Subtle Progress Bar */}
      <div className="countdown-progress-track">
        <div 
          className="countdown-progress-fill" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>
    </div>
  );
}
