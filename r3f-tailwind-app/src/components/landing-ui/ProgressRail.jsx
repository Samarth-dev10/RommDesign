import React, { useEffect, useState } from 'react';
import { useSceneProgress } from '../../store/useSceneProgress.js';

export default function ProgressRail({ sectionCount }) {
  const activeSection = useSceneProgress((s) => s.activeSection);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`progress-rail ${visible ? 'visible' : ''}`}>
      {Array.from({ length: sectionCount }).map((_, i) => (
        <div key={i} className={`rail-dot ${i === activeSection ? 'active' : ''}`} />
      ))}
    </div>
  );
}