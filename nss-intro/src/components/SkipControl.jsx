import React from 'react';
import { FastForward } from 'lucide-react';

export default function SkipControl({ visible, onSkip }) {
  if (!visible) return null;

  return (
    <button 
      className="skip-control" 
      onClick={onSkip}
      title="Skip intro animation and jump to interaction"
    >
      <span>Skip Intro</span>
      <FastForward size={14} />
    </button>
  );
}
