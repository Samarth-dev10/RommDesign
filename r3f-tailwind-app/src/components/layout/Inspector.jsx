/**
 * Inspector — right panel property editor for selected furniture.
 *
 * Shows object info, a scale slider for resizing, lock toggle,
 * model info, and action buttons. Position and rotation are
 * controlled exclusively via the 3D gizmo.
 */
import React, { useCallback } from 'react';
import useStore from '../../store/useStore';
import { getFurnitureById } from '../../data/furnitureRegistry';
import { motion } from 'framer-motion';
import { AlertTriangle, Copy, Lock, RotateCcw, Trash2, Unlock } from 'lucide-react';

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

function clampScale(value) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number.isFinite(value) ? value : MIN_SCALE));
}

export default function Inspector() {
  const selectedIds = useStore((s) => s.selectedIds);
  const furniture = useStore((s) => s.furniture);
  const updateFurnitureWithHistory = useStore((s) => s.updateFurnitureWithHistory);
  const removeFurniture = useStore((s) => s.removeFurniture);
  const duplicateFurniture = useStore((s) => s.duplicateFurniture);
  const updateFurniture = useStore((s) => s.updateFurniture);
  const transformMode = useStore((s) => s.transformMode);
  const setTransformMode = useStore((s) => s.setTransformMode);

  // Get selected item(s)
  const selectedItem =
    selectedIds.length === 1
      ? furniture.find((f) => f.id === selectedIds[0])
      : null;

  const definition = selectedItem
    ? getFurnitureById(selectedItem.catalogItemId)
    : null;

  const handleScaleSliderChange = useCallback(
    (e) => {
      if (!selectedItem) return;
      const val = clampScale(parseFloat(e.target.value));
      updateFurnitureWithHistory(selectedItem.id, { scale: [val, val, val] });
    },
    [selectedItem, updateFurnitureWithHistory]
  );

  const handleToggleLock = useCallback(() => {
    if (!selectedItem) return;
    updateFurniture(selectedItem.id, { isLocked: !selectedItem.isLocked });
  }, [selectedItem, updateFurniture]);

  const handleDelete = useCallback(() => {
    if (selectedIds.length > 0) removeFurniture(selectedIds);
  }, [selectedIds, removeFurniture]);

  const handleDuplicate = useCallback(() => {
    if (selectedIds.length > 0) duplicateFurniture(selectedIds);
  }, [selectedIds, duplicateFurniture]);

  const handleReset = useCallback(() => {
    if (!selectedItem || !definition) return;
    updateFurnitureWithHistory(selectedItem.id, {
      position: [0, definition.snapHeight || 0, 0],
      rotation: [...definition.defaultRotation],
      scale: [...definition.defaultScale],
    });
  }, [selectedItem, definition, updateFurnitureWithHistory]);

  const asideVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (selectedIds.length > 1) {
    return (
      <motion.aside 
        initial="hidden"
        animate="visible"
        variants={asideVariants}
        className="w-80 flex-none flex flex-col bg-white border-l border-slate-200/60 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden z-40" 
        id="inspector-panel"
      >
        <div className="py-4 px-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚙️</span>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Inspector</h2>
          </div>
          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm border border-indigo-100">{selectedIds.length} selected</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-5 custom-scrollbar">
          <div className="bg-slate-50 border border-black/10 rounded-md p-3 text-center mb-4">
            <p className="text-xs text-slate-600 font-medium">{selectedIds.length} objects selected</p>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 bg-slate-50 border border-black/10 text-slate-700 py-2 px-3 rounded-xl text-xs font-bold transition-colors hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200" 
              onClick={handleDelete}
            >
              <span className="text-sm leading-none">🗑️</span> Delete All
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 bg-slate-50 border border-black/10 text-slate-700 py-2 px-3 rounded-xl text-xs font-bold transition-colors hover:bg-slate-100 hover:border-black/20" 
              onClick={handleDuplicate}
            >
              <Copy className="size-3.5" aria-hidden="true" /> Duplicate All
            </motion.button>
          </div>
        </div>
      </motion.aside>
    );
  }

  // No selection
  if (!selectedItem || !definition) {
    return (
      <motion.aside 
        initial="hidden"
        animate="visible"
        variants={asideVariants}
        className="w-80 flex-none flex flex-col bg-white border-l border-slate-200/60 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden z-40" 
        id="inspector-panel"
      >
        <div className="py-4 px-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚙️</span>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Inspector</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
            <span className="text-[28px] opacity-60">🎯</span>
          </div>
          <h3 className="text-sm font-bold text-slate-700 mb-1">Nothing Selected</h3>
          <p className="text-xs text-slate-500 max-w-[200px]">
            Click on any furniture in the 3D room to inspect and edit its properties.
          </p>
        </div>
      </motion.aside>
    );
  }

  // Current uniform scale value
  const currentScale = selectedItem.scale[0];

  // Single selection
  return (
    <motion.aside 
      initial="hidden"
      animate="visible"
      variants={asideVariants}
      className="w-80 flex-none flex flex-col bg-white border-l border-slate-200/60 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden z-40" 
      id="inspector-panel"
    >
      <div className="py-4 px-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">⚙️</span>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Inspector</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6 custom-scrollbar">
        {/* Object info */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Object Details</h3>
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3 flex flex-col gap-2.5 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Name</span>
              <span className="text-slate-900 font-bold text-right max-w-[60%] truncate">{definition.name}</span>
            </div>
            <div className="w-full h-px bg-slate-200/50" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Category</span>
              <span className="text-indigo-700 font-semibold text-right max-w-[60%] truncate bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {definition.category}
              </span>
            </div>
            <div className="w-full h-px bg-slate-200/50" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">ID</span>
              <span className="text-slate-500 font-medium text-right max-w-[60%] truncate font-mono bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60 text-[10px]">
                {selectedItem.id.slice(0, 8)}…
              </span>
            </div>
          </div>
        </div>

        {/* Gizmo Mode Selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transform Mode</h3>
             <span className="text-[9px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Use 3D Gizmo</span>
          </div>
          <div className="flex bg-slate-50/80 rounded-xl p-1 border border-slate-200/60 shadow-sm">
            <button
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${transformMode === 'translate' ? 'bg-white text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
              onClick={() => setTransformMode('translate')}
              title="Move (W)"
            >
              <span className="text-sm">↔️</span> Move
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${transformMode === 'rotate' ? 'bg-white text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
              onClick={() => setTransformMode('rotate')}
              title="Rotate (E)"
            >
              <span className="text-sm">🔄</span> Rotate
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${transformMode === 'scale' ? 'bg-white text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
              onClick={() => setTransformMode('scale')}
              title="Scale (R)"
            >
              <span className="text-sm">↗️</span> Scale
            </button>
          </div>
        </div>

        {selectedItem.isColliding && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 shadow-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold">Collision detected</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-rose-600">This object overlaps another item. You can still move it freely.</p>
            </div>
          </div>
        )}

        {/* Scale Slider */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scale Tuning</h3>
          <div className="flex flex-col gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Uniform Scale</span>
              <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                {currentScale.toFixed(2)}×
              </span>
            </div>
            <input
              type="range"
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              min="0.1"
              max="5"
              step="0.05"
              value={currentScale}
              onChange={handleScaleSliderChange}
            />
          </div>
        </div>

        {/* Settings & Actions */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
           <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 shadow-sm">
            <span className="text-xs font-semibold text-slate-700">Lock Position</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 shadow-sm ${selectedItem.isLocked ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600 hover:bg-slate-50'}`}
              onClick={handleToggleLock}
              title={selectedItem.isLocked ? 'Unlock' : 'Lock'}
            >
              {selectedItem.isLocked ? <Lock className="size-4" aria-hidden="true" /> : <Unlock className="size-4" aria-hidden="true" />}
            </motion.button>
          </div>
          
          <div className="flex gap-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-slate-100 hover:border-slate-300 shadow-sm" 
              onClick={handleDuplicate}
            >
              <Copy className="size-3.5" aria-hidden="true" /> Duplicate
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-slate-100 hover:border-slate-300 shadow-sm" 
              onClick={handleReset}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Reset
            </motion.button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-rose-100 hover:text-rose-700 shadow-sm" 
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" aria-hidden="true" /> Delete Object
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
