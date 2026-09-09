import React, { useState } from 'react';
import './App.css';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Inspector, { MovePalette } from './components/layout/Inspector';
import Toolbar from './components/layout/Toolbar';
import SceneCanvas from './components/canvas/SceneCanvas';
import Minimap from './components/ui/Minimap';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useAutosave from './hooks/useAutosave';
import { useDropTarget } from './hooks/useDragDrop';
import useStore from './store/useStore';
import { FLOORING_MATERIAL_OPTIONS, FLOORING_MATERIALS } from './constants';
import { Box, ChevronDown, ChevronLeft, Download, Expand, Grid2X2, Home, Layers3, Lightbulb, MousePointer2, Move, RotateCw, Ruler, Save, Settings2, Sun, Undo2, Redo2, X } from 'lucide-react';

const tools = [
  { label: 'Select', icon: MousePointer2 },
  { label: 'Move', icon: Move },
  { label: 'Rotate', icon: RotateCw },
  { label: 'Scale', icon: Expand },
  { label: 'Measure', icon: Ruler },
];

const configSections = [
  { label: 'Layout', icon: Grid2X2 },
  { label: 'Walls', icon: Layers3 },
  { label: 'Flooring', icon: Grid2X2 },
  { label: 'Ceiling', icon: Home },
  { label: 'Windows', icon: Box },
  { label: 'Lighting', icon: Sun },
  { label: 'Furniture', icon: Home },
  { label: 'Engineering', icon: Settings2 },
];

function ConfigurationPanel() {
  const selectedIds = useStore((s) => s.selectedIds);
  const room = useStore((s) => s.room);
  const setRoomAppearance = useStore((s) => s.setRoomAppearance);
  const [activeSection, setActiveSection] = useState('Flooring');
  const [activeTab, setActiveTab] = useState('Materials');
  const [heating, setHeating] = useState(true);

  if (selectedIds.length > 0) return null;
  return (
    <aside className="intelli-config" aria-label="Configuration">
      <div className="intelli-config-head">
        <div>
          <h2>Configuration</h2>
          <p>Customize your space</p>
        </div>
        <button className="intelli-icon-button" aria-label="Close configuration"><X size={18} /></button>
      </div>
      <div className="intelli-config-body">
        <nav className="intelli-config-nav" aria-label="Configuration sections">
          {configSections.map(({ label, icon: Icon }) => (
            <button key={label} className={activeSection === label ? 'is-active' : ''} onClick={() => setActiveSection(label)}>
              <Icon size={18} strokeWidth={1.6} />
              <span>{label}</span>
            </button>
          ))}
          <button className="intelli-config-nav-bottom"><Settings2 size={18} strokeWidth={1.6} /><span>Settings</span></button>
        </nav>
        <div className="intelli-config-content">
          <div className="intelli-section-title">
            <div><h3>{activeSection}</h3><p>{activeSection === 'Flooring' ? 'Select material and finish' : 'Configure this layer'}</p></div>
          </div>
          <div className="intelli-tabs">
            {['Materials', 'Patterns', 'Properties'].map((tab) => <button key={tab} className={activeTab === tab ? 'is-active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </div>
          {activeSection === 'Flooring' && activeTab === 'Materials' ? (
            <div className="intelli-material-list">
              {FLOORING_MATERIAL_OPTIONS.map((materialId) => {
                const material = FLOORING_MATERIALS[materialId];
                const selected = room.floorMaterial === materialId;
                return (
                  <button key={materialId} className={`intelli-material-card ${selected ? 'is-selected' : ''}`} onClick={() => setRoomAppearance({ floorMaterial: materialId, floorColor: material.color })}>
                    <span className="intelli-material-swatch" style={{ backgroundColor: material.color }} />
                    <span className="intelli-material-copy"><strong>{material.label}</strong><small>{material.price ? `+₹${material.price.toLocaleString('en-IN')}` : 'Included'}</small></span>
                    <span className="intelli-radio">{selected ? '✓' : ''}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="intelli-empty-state"><Box size={24} /><strong>{activeTab}</strong><span>Fine tune your {activeSection.toLowerCase()} configuration.</span></div>
          )}
          <div className="intelli-setting-row"><div><strong>Floor Heating</strong><small>Included</small></div><button className={`intelli-switch ${heating ? 'is-on' : ''}`} onClick={() => setHeating(!heating)} aria-pressed={heating}><span /></button></div>
          <button className="intelli-apply">Apply Selection</button>
        </div>
      </div>
    </aside>
  );
}

function WorkspaceOverlay() {
  const selectedIds = useStore((s) => s.selectedIds);
  const transformMode = useStore((s) => s.transformMode);
  const setTransformMode = useStore((s) => s.setTransformMode);
  const lightPreset = useStore((s) => s.lightPreset);
  const history = useStore((s) => s.history);
  const future = useStore((s) => s.future);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const setLightPreset = useStore((s) => s.setLightPreset);
  const [view, setView] = useState('3D View');
  return <>
    <div className="intelli-view-tabs"><button className={view === '3D View' ? 'is-active' : ''} onClick={() => setView('3D View')}>3D View</button><button className={view === 'Apartment Plan' ? 'is-active' : ''} onClick={() => setView('Apartment Plan')}>Apartment Plan</button><button className={view === 'Floor Plan' ? 'is-active' : ''} onClick={() => setView('Floor Plan')}>Floor Plan</button></div>
    <div className="intelli-canvas-actions"><button onClick={undo} disabled={!history.length} aria-label="Undo"><Undo2 size={17} /></button><button onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 size={17} /></button><button className="sun-action" onClick={() => setLightPreset(lightPreset === 'night' ? 'midday' : 'night')} aria-label="Toggle sunlight"><Sun size={18} /></button><button className="shadow-action">Shadows <ChevronDown size={14} /></button></div>
    <div className="intelli-tool-rail">{tools.map(({ label, icon: Icon }, index) => { const mode = label === 'Move' ? 'translate' : label === 'Rotate' ? 'rotate' : label === 'Scale' ? 'scale' : null; return <button key={label} className={(mode ? transformMode === mode : index === 0) ? 'is-active' : ''} onClick={() => mode && selectedIds.length === 1 && setTransformMode(mode)}><Icon size={20} strokeWidth={1.6} /><span>{label}</span></button>; })}</div>
    <MovePalette />
    <div className="intelli-bottom-dock"><button className="is-active"><Sun size={21} /><span>Sunlight</span></button><button><Box size={21} /><span>Camera</span></button><button><Lightbulb size={21} /><span>Environment</span></button><button><Grid2X2 size={21} /><span>Materials</span></button><button><Layers3 size={21} /><span>View Modes</span></button><button><Expand size={21} /><span>Presentation</span></button></div>
    <div className="intelli-zoom"><button>−</button><span>90%</span><button>+</button></div><button className="intelli-fit"><Expand size={15} /> Fit to Screen</button><div className="intelli-view-toggle"><button>2D</button><button className="is-active">3D</button><button aria-label="Fullscreen"><Expand size={15} /></button></div>
  </>;
}

export default function App() {
  useKeyboardShortcuts();
  useAutosave();
  const dropTargetProps = useDropTarget();
  return <div className="intelli-app">
    <Navbar />
    <main className="intelli-workspace">
      <Sidebar />
      <section className="intelli-viewport" {...dropTargetProps}>
        <div className="intelli-viewport-glow" aria-hidden="true" /><SceneCanvas /><Minimap /><WorkspaceOverlay />
      </section>
      <ConfigurationPanel />
      <Inspector />
    </main>
    <Toolbar />
  </div>;
}
