/**
 * App — root component for the RoomCraft 3D Room Designer.
 *
 * Desktop layout: Navbar (top), Sidebar (left), Canvas (center),
 * Inspector (right), Toolbar (bottom).
 */
import React from 'react';
import './App.css';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Inspector from './components/layout/Inspector';
import Toolbar from './components/layout/Toolbar';
import SceneCanvas from './components/canvas/SceneCanvas';
import Minimap from './components/ui/Minimap';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useAutosave from './hooks/useAutosave';
import { useDropTarget } from './hooks/useDragDrop';

export default function App() {
  // Global hooks
  useKeyboardShortcuts();
  useAutosave();

  // Drop target for sidebar → canvas drag
  const dropTargetProps = useDropTarget();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#101318] text-slate-100 font-sans antialiased selection:bg-cyan-400/20">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative overflow-hidden bg-linear-to-br from-slate-100 to-slate-200/50" {...dropTargetProps}>
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(45,212,191,0.06),transparent_48%)]" aria-hidden="true" />
          <SceneCanvas />
          <Minimap />
        </div>
        <Inspector />
      </div>
      <Toolbar />
    </div>
  );
}
