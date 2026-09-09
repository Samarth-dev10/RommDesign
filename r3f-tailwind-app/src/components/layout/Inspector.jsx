import React, { useCallback } from 'react';
import useStore from '../../store/useStore';
import { getFurnitureById } from '../../data/furnitureRegistry';
import { Copy, Lock, Move, RotateCw, Expand, Trash2, Unlock, X } from 'lucide-react';

function NumberField({ label, value, onChange }) {
  return <label className="intelli-transform-field"><span>{label}</span><input type="number" step="0.01" value={Number(value).toFixed(2)} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export default function Inspector() {
  const selectedIds = useStore((s) => s.selectedIds);
  const furniture = useStore((s) => s.furniture);
  const updateFurnitureWithHistory = useStore((s) => s.updateFurnitureWithHistory);
  const updateFurniture = useStore((s) => s.updateFurniture);
  const removeFurniture = useStore((s) => s.removeFurniture);
  const duplicateFurniture = useStore((s) => s.duplicateFurniture);
  const transformMode = useStore((s) => s.transformMode);
  const setTransformMode = useStore((s) => s.setTransformMode);
  const selectedItem = selectedIds.length === 1 ? furniture.find((item) => item.id === selectedIds[0]) : null;
  const definition = selectedItem ? getFurnitureById(selectedItem.catalogItemId ?? selectedItem.registryId) : null;

  const updateTransform = useCallback((key, index, value) => {
    if (!selectedItem || selectedItem.isLocked || !Number.isFinite(value)) return;
    const next = [...selectedItem[key]];
    next[index] = value;
    updateFurnitureWithHistory(selectedItem.id, { [key]: next });
  }, [selectedItem, updateFurnitureWithHistory]);

  if (!selectedItem || !definition) return null;
  const position = selectedItem.position || [0, 0, 0];
  const rotation = selectedItem.rotation || [0, 0, 0];
  const scale = selectedItem.scale || [1, 1, 1];

  return <aside className="intelli-selection-panel" id="inspector-panel" aria-label="Selected furniture configuration">
    <header className="intelli-selection-head">
      <div><h2>{definition.name} <span>(Selected)</span></h2><p>{definition.category.replace('-', ' ')} · ID: {selectedItem.id.slice(0, 7).toUpperCase()}</p></div>
      <button className="intelli-icon-button" aria-label="Close selection" onClick={() => useStore.getState().clearSelection()}><X size={20} /></button>
    </header>
    <div className="intelli-selection-content">
      <div className="intelli-object-card"><div className="intelli-object-thumb"><Move size={22} /></div><div><strong>{definition.name}</strong><span>ID: {selectedItem.id.slice(0, 7).toUpperCase()}</span></div></div>
      <div className="intelli-object-tabs"><button className="is-active">Transform</button><button>Details</button><button>Material</button></div>
      <section className="intelli-transform-section"><h3>Position (m)</h3><div className="intelli-transform-grid">{['X','Y','Z'].map((axis, index) => <NumberField key={axis} label={axis} value={position[index]} onChange={(value) => updateTransform('position', index, value)} />)}</div></section>
      <section className="intelli-transform-section"><h3>Rotation (°)</h3><div className="intelli-transform-grid">{['X','Y','Z'].map((axis, index) => <NumberField key={axis} label={axis} value={(rotation[index] * 180) / Math.PI} onChange={(value) => updateTransform('rotation', index, (value * Math.PI) / 180)} />)}</div></section>
      <section className="intelli-transform-section"><h3>Scale</h3><div className="intelli-transform-grid">{['X','Y','Z'].map((axis, index) => <NumberField key={axis} label={axis} value={scale[index]} onChange={(value) => updateTransform('scale', index, value)} />)}</div></section>
      <section className="intelli-transform-section"><h3>Dimensions (m)</h3><div className="intelli-transform-grid intelli-readonly-grid">{[['W', selectedItem.bounds?.width || 0], ['D', selectedItem.bounds?.depth || 0], ['H', selectedItem.bounds?.height || 0]].map(([label, value]) => <NumberField key={label} label={label} value={value} onChange={() => {}} />)}</div></section>
      <div className="intelli-selection-options"><div><span><Lock size={15} /> Lock Position</span><button className={`intelli-switch ${selectedItem.isLocked ? 'is-on' : ''}`} onClick={() => updateFurniture(selectedItem.id, { isLocked: !selectedItem.isLocked })}><span /></button></div><div><span>{selectedItem.isLocked ? <Lock size={15} /> : <Unlock size={15} />} Visible</span><button className="intelli-switch is-on"><span /></button></div><div><span><Move size={15} /> Cast Shadow</span><button className="intelli-switch is-on"><span /></button></div></div>
      <div className="intelli-selection-actions"><button onClick={() => duplicateFurniture(selectedIds)}><Copy size={15} /> Duplicate</button><button className="danger" onClick={() => removeFurniture(selectedIds)}><Trash2 size={15} /> Delete</button></div>
    </div>
  </aside>;
}

export function MovePalette() {
  const selectedIds = useStore((s) => s.selectedIds);
  const transformMode = useStore((s) => s.transformMode);
  const setTransformMode = useStore((s) => s.setTransformMode);
  if (selectedIds.length !== 1) return null;
  return <div className="intelli-move-palette"><div className="intelli-move-heading"><Move size={28} /><div><strong>{transformMode === 'translate' ? 'Move' : transformMode === 'rotate' ? 'Rotate' : 'Scale'}</strong><span>Drag to move · Hold Shift for precise movement</span></div></div><div className="intelli-move-actions">{[['translate', Move, 'Move'], ['rotate', RotateCw, 'Rotate'], ['scale', Expand, 'Scale']].map(([mode, Icon, label]) => <button key={mode} className={transformMode === mode ? 'is-active' : ''} onClick={() => setTransformMode(mode)}><Icon size={20} /><span>{label}</span></button>)}<button><span className="intelli-more">•••</span><span>More</span></button></div></div>;
} 
