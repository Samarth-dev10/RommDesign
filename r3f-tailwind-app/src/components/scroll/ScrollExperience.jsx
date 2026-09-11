import React, { useEffect, useRef } from 'react';
import { useSceneProgress, liveProgress } from '../../store/useSceneProgress.js';

// Drives scroll-based storytelling. Renders tall stacked sections; as user
// scrolls, computes global progress (0..1) and stores it in the
// non-reactive liveProgress bridge for the 3D scene to consume, while
// updating the lightweight activeSection store for UI highlighting only.
export default function ScrollExperience({ sectionCount, children }) {
  const containerRef = useRef(null);
  const setActiveSection = useSceneProgress((s) => s.setActiveSection);
  const lastSection = useRef(-1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      liveProgress.scroll = progress;

      const sectionIndex = Math.min(sectionCount - 1, Math.floor(progress * sectionCount));
      if (sectionIndex !== lastSection.current) {
        lastSection.current = sectionIndex;
        setActiveSection(sectionIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionCount, setActiveSection]);

  useEffect(() => {
    const handleMouse = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      liveProgress.mouseX = x;
      liveProgress.mouseY = y;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div ref={containerRef} className="scroll-container">
      {React.Children.map(children, (child, i) => (
        <section className="scroll-section" key={i}>
          {child}
        </section>
      ))}
    </div>
  );
}