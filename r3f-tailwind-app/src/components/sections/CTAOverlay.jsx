import React from 'react';
import { navigateTo } from '../../App.jsx';

export default function CTAOverlay() {
  return (
    <div className="overlay-inner center-col">
      <div className="eyebrow">ENTER INTELLISPACE</div>
      <h2 className="headline-lg cta-headline">Your room is waiting.</h2>
      <button onClick={() => navigateTo('/editor')} className="btn-primary">
        Enter IntelliSpace
      </button>
    </div>
  );
}