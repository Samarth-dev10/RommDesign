import React from 'react';
import { navigateTo } from '../../utils/navigation.js';

export default function HeroOverlay() {
  return (
    <div className="overlay-inner hero-inner">
      <div className="max-w-hero">
        <div className="hero-kicker"><span className="hero-kicker-line" /> INTELLIGENT 3D INTERIOR DESIGN <span>01 / 08</span></div>
        <h1 className="headline-xl">
          Make room
          <br />
          for <em>possibility.</em>
        </h1>
        <p className="body-text max-w-md">
          Design your space in 3D, customize every detail, and discover intelligent
          recommendations built around your room, style and budget.
        </p>
        <div className="cta-row">
          <button onClick={() => navigateTo('/register')} className="btn-primary">
            Enter IntelliSpace
          </button>
          <button className="btn-link">Explore the workspace</button>
        </div>
      </div>
      <div className="scroll-hint">Scroll</div>
    </div>
  );
}
