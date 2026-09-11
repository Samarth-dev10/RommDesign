import React from 'react';

export default function IntelligenceOverlay() {
  return (
    <div className="overlay-inner">
      <div className="max-w-copy">
        <div className="eyebrow">02 — INTELLIGENCE</div>
        <h2 className="headline-lg">Recommendations grounded in your space.</h2>
        <p className="body-text">
          Describe your requirements — style, room and budget. IntelliSpace's
          recommendation engine is designed to understand them and ground every
          suggestion in real, structured design data.
        </p>
        <div className="flow-diagram">
          <div>ROOM + STYLE + BUDGET</div>
          <div className="flow-arrow">↓</div>
          <div className="flow-result">INTELLIGENT RECOMMENDATIONS</div>
        </div>
      </div>
    </div>
  );
}