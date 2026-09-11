import React from 'react';
import Navigation from '../components/landing-ui/Navigation.jsx';
import ScrollExperience from '../components/scroll/ScrollExperience.jsx';
import SceneCanvas from '../components/landing-scene/SceneCanvas.jsx';
import HeroOverlay from '../components/sections/HeroOverlay.jsx';
import DefineOverlay from '../components/sections/DefineOverlay.jsx';
import IntelligenceOverlay from '../components/sections/IntelligenceOverlay.jsx';
import CatalogOverlay from '../components/sections/CatalogOverlay.jsx';
import WorkspaceOverlay from '../components/sections/WorkspaceOverlay.jsx';
import CustomizationOverlay from '../components/sections/CustomizationOverlay.jsx';
import FinalOverlay from '../components/sections/FinalOverlay.jsx';
import CTAOverlay from '../components/sections/CTAOverlay.jsx';
import Footer from '../components/landing-ui/Footer.jsx';
import ProgressRail from '../components/landing-ui/ProgressRail.jsx';

const SECTION_COUNT = 8;

export default function LandingPage() {
  return (
    <div className="landing-root">
      <Navigation />
      <ProgressRail sectionCount={SECTION_COUNT} />

      <div className="fixed-canvas">
        <SceneCanvas />
      </div>

      <ScrollExperience sectionCount={SECTION_COUNT}>
        <HeroOverlay />
        <DefineOverlay />
        <IntelligenceOverlay />
        <CatalogOverlay />
        <WorkspaceOverlay />
        <CustomizationOverlay />
        <FinalOverlay />
        <CTAOverlay />
      </ScrollExperience>

      <Footer />
    </div>
  );
}
