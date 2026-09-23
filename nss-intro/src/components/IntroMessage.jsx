import React from 'react';

export default function IntroMessage({ config, onFinishMessage }) {
  const { prologue, branding } = config;

  return (
    <div className="prologue-container">
      <div className="prologue-tag">{branding.organizationName}</div>
      <h1 className="prologue-headline">{prologue.line1}</h1>
      <p className="prologue-subline">{prologue.line2}</p>
      <div className="prologue-pulse-dot" />
    </div>
  );
}
