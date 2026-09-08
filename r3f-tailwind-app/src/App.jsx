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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#101110] text-[#eee9df] font-sans antialiased selection:bg-[#c7a66a]/20">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative min-w-0 overflow-hidden bg-[#101110]" {...dropTargetProps}>
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_42%,rgba(199,166,106,0.045),transparent_58%)]" aria-hidden="true" />
          <SceneCanvas />
          <Minimap />
        </div>
        <Inspector />
      </div>
      <Toolbar />
    </div>
  );
}
