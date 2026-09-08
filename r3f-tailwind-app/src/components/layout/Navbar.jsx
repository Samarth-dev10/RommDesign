/**
 * Navbar — top navigation bar.
 *
 * Contains: logo, template selector, camera mode, light preset,
 * save indicator, undo/redo, export/import, settings toggles.
 */
import React from 'react';
import useStore from '../../store/useStore';
import { TEMPLATE_LIST } from '../../data/roomTemplates';
import { CAMERA_MODES, LIGHT_PRESETS } from '../../constants';
import SaveIndicator from '../ui/SaveIndicator';
import { motion } from 'framer-motion';
import { Magnet, Grid, Map as MapIcon, Ruler, Undo, Redo, Cuboid } from 'lucide-react';

export default function Navbar() {
  const currentTemplate = useStore((s) => s.currentTemplate);
  const cameraMode = useStore((s) => s.cameraMode);
  const lightPreset = useStore((s) => s.lightPreset);
  const history = useStore((s) => s.history);
  const future = useStore((s) => s.future);
  const setTemplate = useStore((s) => s.setTemplate);
  const setCameraMode = useStore((s) => s.setCameraMode);
  const setLightPreset = useStore((s) => s.setLightPreset);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const snapEnabled = useStore((s) => s.snapEnabled);
  const toggleSnap = useStore((s) => s.toggleSnap);
  const showGrid = useStore((s) => s.showGrid);
  const toggleGrid = useStore((s) => s.toggleGrid);
  const showMinimap = useStore((s) => s.showMinimap);
  const toggleMinimap = useStore((s) => s.toggleMinimap);
  const showMeasurements = useStore((s) => s.showMeasurements);
  const toggleMeasurements = useStore((s) => s.toggleMeasurements);

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-none flex items-center gap-4 px-5 bg-panel border-b border-line z-50 h-14 shadow-[0_8px_24px_rgba(0,0,0,0.18)]" 
      id="main-navbar"
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3 mr-4">
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg shadow-sm shadow-indigo-500/20"
        >
          <span className="text-xl">🛋️</span>
        </motion.div>
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none mb-1">RoomCraft</h1>
          <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase leading-none">3D Room Designer</span>
        </div>
      </div>

      {/* Template Selector */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Template</label>
        <select
          className="bg-panel-raised border border-line text-ink px-3 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 hover:border-slate-300 transition-colors min-w-32 cursor-pointer shadow-sm"
          value={currentTemplate}
          onChange={(e) => setTemplate(e.target.value)}
          id="template-selector"
        >
          {TEMPLATE_LIST.map((t) => (
            <option key={t.id} value={t.id} className="bg-white text-slate-900 font-medium">
              {t.icon} {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-px h-5 bg-slate-200" />

      {/* Camera Mode */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Camera</label>
        <select
          className="bg-panel-raised border border-line text-ink px-3 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 hover:border-slate-300 transition-colors min-w-28 cursor-pointer shadow-sm"
          value={cameraMode}
          onChange={(e) => setCameraMode(e.target.value)}
          id="camera-selector"
        >
          {Object.entries(CAMERA_MODES).map(([key, mode]) => (
            <option key={key} value={key} className="bg-white text-slate-900 font-medium">
              {mode.icon} {mode.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-px h-5 bg-slate-200" />

      {/* Light Preset */}
      <div className="flex items-center gap-2">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Lighting</label>
        <select
          className="bg-panel-raised border border-line text-ink px-3 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 hover:border-slate-300 transition-colors min-w-28 cursor-pointer shadow-sm"
          value={lightPreset}
          onChange={(e) => setLightPreset(e.target.value)}
          id="light-selector"
        >
          {Object.entries(LIGHT_PRESETS).map(([key, preset]) => (
            <option key={key} value={key} className="bg-white text-slate-900 font-medium">
              {preset.icon} {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Toggles */}
      <div className="flex gap-1 bg-slate-50 border border-slate-200/60 rounded-xl p-1 shadow-sm ml-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${snapEnabled ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/50 shadow-sm' : 'text-slate-400 hover:bg-slate-200/50 hover:text-slate-700 border border-transparent'}`}
          onClick={toggleSnap}
          title="Toggle Snap"
        >
          <span className="text-sm">🧲</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${showGrid ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/50 shadow-sm' : 'text-slate-400 hover:bg-slate-200/50 hover:text-slate-700 border border-transparent'}`}
          onClick={toggleGrid}
          title="Toggle Grid"
        >
          <span className="text-sm">📏</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${showMinimap ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/50 shadow-sm' : 'text-slate-400 hover:bg-slate-200/50 hover:text-slate-700 border border-transparent'}`}
          onClick={toggleMinimap}
          title="Toggle Minimap"
        >
          <span className="text-sm">🗺️</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${showMeasurements ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/50 shadow-sm' : 'text-slate-400 hover:bg-slate-200/50 hover:text-slate-700 border border-transparent'}`}
          onClick={toggleMeasurements}
          title="Toggle Measurements"
        >
          <span className="text-sm">📐</span>
        </motion.button>
      </div>

      {/* Save Indicator */}
      <SaveIndicator />

      {/* Actions */}
      <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-4">
        <motion.button
          whileHover={history.length > 0 ? { scale: 1.05 } : {}}
          whileTap={history.length > 0 ? { scale: 0.95 } : {}}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${history.length > 0 ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer' : 'bg-transparent border border-transparent text-slate-400 opacity-40 cursor-not-allowed'}`}
          onClick={undo}
          disabled={history.length === 0}
          title="Undo (Ctrl+Z)"
          id="btn-undo"
        >
          <span className="text-sm">↩</span>
        </motion.button>
        <motion.button
          whileHover={future.length > 0 ? { scale: 1.05 } : {}}
          whileTap={future.length > 0 ? { scale: 0.95 } : {}}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${future.length > 0 ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer' : 'bg-transparent border border-transparent text-slate-400 opacity-40 cursor-not-allowed'}`}
          onClick={redo}
          disabled={future.length === 0}
          title="Redo (Ctrl+Y)"
          id="btn-redo"
        >
          <span className="text-sm">↪</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
