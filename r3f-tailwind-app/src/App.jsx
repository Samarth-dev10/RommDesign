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
import { FLOORING_MATERIAL_OPTIONS, FLOORING_MATERIALS, WALL_MATERIAL_OPTIONS, WALL_MATERIALS } from './constants';
import { TEMPLATE_LIST } from './data/roomTemplates';
import { Box, ChevronDown, ChevronLeft, ChevronRight, Download, Expand, Grid2X2, Home, Layers3, Lightbulb, MousePointer2, Move, RotateCw, Ruler, Save, Settings2, Sun, Undo2, Redo2, X } from 'lucide-react';

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

function LayoutContent({ room, setRoomAppearance }) {
  const setTemplate = useStore((s) => s.setTemplate);
  const currentTemplate = useStore((s) => s.currentTemplate);
  const [tab, setTab] = useState('Room Types');
  const [applied, setApplied] = useState(false);
  const [structure, setStructure] = useState(null);
  const updateDimension = (key, value) => setRoomAppearance({ [key]: Math.max(key === 'height' ? 2.4 : 3, Number(value) || 0) });
  const area = (room.width * room.depth).toFixed(2);
  const volume = (room.width * room.depth * room.height).toFixed(2);
  const structures = ['Partition Wall', 'Column', 'Room Opening', 'Niche'];
  return <div className="layout-content">
    <div className="intelli-section-title"><div><h3>Layout</h3><p>Design your space structure</p></div></div>
    <div className="intelli-tabs layout-tabs">{['Room Types', 'Dimensions', 'Structures'].map((item) => <button key={item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === 'Room Types' && <>
      <div className="layout-subheading"><strong>Room Templates</strong><button>See All <ChevronRight size={13} /></button></div>
      <div className="room-template-grid">{TEMPLATE_LIST.slice(0, 6).map((template, index) => <button key={template.id} className={`room-template-card ${currentTemplate === template.id ? 'is-selected' : ''}`} onClick={() => setTemplate(template.id)}><span className={`room-template-preview preview-${index}`}><Home size={30} strokeWidth={1.1} /></span><span>{template.name.replace('Modern ', '').replace('Scandinavian ', '')}</span>{currentTemplate === template.id && <b>✓</b>}</button>)}</div>
      <div className="layout-tools"><h4>Layout Tools</h4><div className="layout-tool-grid">{['Add Room', 'Remove Wall', 'Split Room', 'Merge Room'].map((label) => <button key={label} onClick={() => setApplied(true)}><strong>{label === 'Add Room' ? '+' : label === 'Remove Wall' ? '⌁' : label === 'Split Room' ? '⊞' : '▥'}</strong><span>{label}</span></button>)}</div></div>
    </>}
    {tab === 'Dimensions' && <>
      <div className="layout-subheading"><strong>Room Dimensions</strong><select aria-label="Units"><option>Metric (m)</option></select></div>
      <p className="layout-helper">Adjust the size of your room</p>
      <div className="dimension-fields">{[['width', 'Length (X)'], ['depth', 'Width (Z)'], ['height', 'Height (Y)']].map(([key, label]) => <label key={key}><span>{label}</span><div><button onClick={() => updateDimension(key, room[key] - 0.1)}>−</button><input value={Number(room[key]).toFixed(2)} onChange={(event) => updateDimension(key, event.target.value)} /><b>m</b><button onClick={() => updateDimension(key, room[key] + 0.1)}>+</button></div></label>)}</div>
      <div className="dimension-summary"><div><strong>Interior area</strong><span>{area} m²</span></div><div><strong>Volume</strong><span>{volume} m³</span></div></div>
      <div className="size-presets"><span>Custom Size</span><div>{['Compact', 'Medium', 'Large', 'Custom'].map((label) => <button key={label} className={label === 'Custom' ? 'is-active' : ''} onClick={() => label !== 'Custom' && setRoomAppearance({ width: label === 'Compact' ? 6.2 : label === 'Medium' ? 8 : 10, depth: label === 'Compact' ? 4.8 : label === 'Medium' ? 6 : 8 })}>{label}</button>)}</div></div>
      <div className="layout-divider" /><h4 className="layout-section-label">Interior Structures</h4><p className="layout-helper">Add interior elements to refine your space</p><div className="structure-grid">{structures.map((label) => <button key={label} className={structure === label ? 'is-selected' : ''} onClick={() => setStructure(label)}><span>{label === 'Partition Wall' ? '▐' : label === 'Column' ? '▥' : label === 'Room Opening' ? '∩' : '□'}</span><small>{label}</small></button>)}</div>
      <div className="structure-properties"><strong>{structure || 'Select a structure element'}</strong><p>{structure ? `${structure} selected for editing` : 'Choose a wall, column, opening or niche to edit its properties'}</p></div>
    </>}
    {tab === 'Structures' && <div className="intelli-empty-state"><Grid2X2 size={24} /><strong>Interior Structures</strong><span>Select an element to refine the layout of your space.</span></div>}
    <div className="wall-settings"><h4>Wall Settings</h4><label>Wall Thickness <strong>{Number(room.wallThickness || 0.2).toFixed(2)} m</strong><input type="range" min="0.1" max="0.4" step="0.01" value={room.wallThickness || 0.2} onChange={(event) => setRoomAppearance({ wallThickness: Number(event.target.value) })} /></label><label>Wall Height <strong>{Number(room.height).toFixed(2)} m</strong><input type="range" min="2.4" max="3.3" step="0.1" value={room.height} onChange={(event) => updateDimension('height', event.target.value)} /></label></div>
    <button className="intelli-apply" onClick={() => { setApplied(true); window.setTimeout(() => setApplied(false), 1800); }}>{applied ? 'Layout Changes Applied' : 'Apply Layout Changes'}</button>
  </div>;
}

const WALL_PAINTS = [
  ['Pure White', '#f4f3ef'], ['Warm White', '#e9e0d2'], ['Ivory', '#ded5c8'], ['Sand Beige', '#cbb9a4'], ['Taupe', '#9d9182'],
  ['Sage Green', '#9aa991'], ['Olive', '#69725c'], ['Dusty Blue', '#8da0af'], ['Terracotta', '#bd735a'], ['Charcoal', '#3e4141'],
];
const WALL_TEXTURES = [
  ['Carrara Marble', 'linear-gradient(135deg,#f3f1ed 20%,#c9c4bd 22%,#fbfaf7 35%,#d3cdc5 60%,#f7f5f0 62%)', 'Premium'],
  ['Emperador Stone', 'linear-gradient(135deg,#302b2b,#756457 45%,#242326 70%,#968272)', 'Premium'],
  ['Travertine', 'repeating-linear-gradient(90deg,#c9b08e 0 16px,#dfc7a3 17px 22px)', 'Premium'],
  ['Limestone', 'linear-gradient(145deg,#e7e2d9,#bcb8ad 48%,#f2eee5)', 'Premium'],
  ['Concrete Textured', 'linear-gradient(145deg,#747676,#a8aaa5 45%,#676a69)', 'Modern'],
  ['Slate Grey', 'linear-gradient(135deg,#303338,#65666b 35%,#25272c 70%,#57585d)', 'Modern'],
  ['Sandstone', 'linear-gradient(145deg,#b9a187,#d8c1a0 45%,#a78e71)', 'Modern'],
  ['White Brick', 'repeating-linear-gradient(0deg,#e9e7e2 0 14px,#b9b8b4 15px 16px),repeating-linear-gradient(90deg,transparent 0 27px,#b9b8b4 28px 30px)', 'Modern'],
  ['Wood Slat', 'repeating-linear-gradient(90deg,#70462d 0 5px,#c18c5c 6px 10px,#4d3023 11px 13px)', 'Modern'],
  ['Textured Plaster', 'linear-gradient(145deg,#d5cec0,#9e9589 45%,#eee9df)', 'Modern'],
  ['Fabric Finish', 'repeating-linear-gradient(135deg,#b9b8b2 0 2px,#e1ded7 3px 5px)', 'Modern'],
  ['Geometric 3D', 'linear-gradient(135deg,#e6e3db 25%,#bcbab5 25% 50%,#eeeae3 50% 75%,#aaa9a7 75%)', 'Modern'],
];

function WallsContent({ room, setRoomAppearance }) {
  const [tab, setTab] = useState('Material');
  const [wallTab, setWallTab] = useState('Material');
  const [applied, setApplied] = useState(false);
  const [selectedPaint, setSelectedPaint] = useState('Warm White');
  const [selectedTexture, setSelectedTexture] = useState('Limestone');
  const selectedMaterial = room.wallMaterial || 'warmPaint';
  const apply = (updates) => { setRoomAppearance(updates); setApplied(true); window.setTimeout(() => setApplied(false), 1500); };
  return <div className="walls-content">
    <div className="walls-heading"><div><h3>Walls</h3><p>Customize wall materials, height and style</p></div></div>
    <div className="intelli-tabs walls-tabs">{['Material', 'Paint', 'Textures', 'Properties'].map((item) => <button key={item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === 'Material' && <>
      <div className="wall-selection"><div><strong>Wall Selection</strong><select aria-label="Wall selection"><option>Living Room - North Wall</option><option>Living Room - East Wall</option><option>Hallway - South Wall</option></select></div><span className="wall-mini-map">⌂</span></div>
      <div className="wall-subheading"><strong>Material Library</strong></div><div className="wall-filters">{['All', 'Paint', 'Wallpaper', 'Wood', 'Stone', 'Concrete'].map((filter) => <button key={filter} className={filter === 'All' ? 'is-active' : ''}>{filter}</button>)}</div><input className="wall-search" placeholder="Search wall materials..." />
      <div className="wall-card-grid">{WALL_MATERIAL_OPTIONS.map((id) => { const item = WALL_MATERIALS[id]; return <button key={id} className={`wall-card ${selectedMaterial === id ? 'is-selected' : ''}`} onClick={() => apply({ wallMaterial: id, wallColor: item.color })}><span className="wall-swatch" style={{ background: item.color }} /><strong>{item.label}</strong><small>{item.finish}</small>{selectedMaterial === id && <b>✓</b>}</button>; })}</div>
      <div className="wall-subheading wall-quick"><strong>Quick Presets</strong></div><div className="wall-presets">{['Modern', 'Minimal', 'Classic', 'Industrial', 'Scandinavian'].map((preset, index) => <button key={preset} onClick={() => apply({ wallMaterial: index === 0 ? 'warmPaint' : index === 3 ? 'concrete' : 'plaster' })}><span className={`preset-swatch preset-${index}`} /><small>{preset}</small></button>)}</div>
    </>}
    {tab === 'Paint' && <PaintWallContent selectedPaint={selectedPaint} setSelectedPaint={setSelectedPaint} apply={apply} />}
    {tab === 'Textures' && <TextureWallContent selectedTexture={selectedTexture} setSelectedTexture={setSelectedTexture} apply={apply} />}
    {tab === 'Properties' && <div className="wall-properties"><div className="wall-preview" /><h4>Wall Information</h4><label>Name<input value="North Wall" readOnly /></label><label>Type<select><option>Interior Wall</option></select></label><div className="wall-info-grid"><span>Area<strong>12.96 m²</strong></span><span>Length<strong>4.80 m</strong></span><span>Height<strong>{Number(room.height || 2.7).toFixed(2)} m</strong></span><span>Thickness<strong>{Number(room.wallThickness || 0.2).toFixed(2)} m</strong></span></div><div className="wall-toggle-list"><span>Visible <i className="intelli-switch is-on"><b /></i></span><span>Cast Shadows <i className="intelli-switch is-on"><b /></i></span><span>Collidable <i className="intelli-switch is-on"><b /></i></span></div></div>}
    <div className="wall-settings"><h4>Wall Settings</h4><label>Wall Height <strong>{Number(room.height || 2.7).toFixed(2)} m</strong><input type="range" min="2.4" max="3.3" step="0.1" value={room.height || 2.7} onChange={(event) => setRoomAppearance({ height: Number(event.target.value) })} /></label><label>Wall Thickness <strong>{Number(room.wallThickness || 0.2).toFixed(2)} m</strong><input type="range" min="0.1" max="0.4" step="0.01" value={room.wallThickness || 0.2} onChange={(event) => setRoomAppearance({ wallThickness: Number(event.target.value) })} /></label></div>
    <div className="wall-actions"><button className="intelli-apply" onClick={() => apply({})}>{applied ? 'Applied to Wall' : 'Apply to Wall'}</button><button onClick={() => apply({})}>Apply to All Walls</button></div>
  </div>;
}

function PaintWallContent({ selectedPaint, setSelectedPaint, apply }) { return <div className="wall-paint-content"><div className="wall-subheading"><strong>Color Palette</strong></div><div className="wall-filters">{['All', 'Neutrals', 'Warm', 'Cool', 'Earth', 'Pastels', 'Dark'].map((filter) => <button key={filter} className={filter === 'All' ? 'is-active' : ''}>{filter}</button>)}</div><input className="wall-search" placeholder="Search colors..." /><div className="paint-grid">{WALL_PAINTS.map(([name, color]) => <button key={name} className={selectedPaint === name ? 'is-selected' : ''} onClick={() => { setSelectedPaint(name); apply({ wallColor: color, wallMaterial: 'warmPaint' }); }}><span style={{ background: color }} /><strong>{name}</strong><small>{color.toUpperCase()}</small></button>)}</div><div className="wall-subheading"><strong>Finish</strong></div><div className="finish-grid">{['Matte', 'Eggshell', 'Satin', 'Semi-Gloss', 'Gloss'].map((finish, index) => <button key={finish} className={index === 0 ? 'is-selected' : ''}><span className={`finish-orb finish-${index}`} /><small>{finish}</small></button>)}</div><div className="wall-preview wide-preview" /></div>; }
function TextureWallContent({ selectedTexture, setSelectedTexture, apply }) { return <div className="wall-texture-content"><input className="wall-search" placeholder="Search textures (e.g. marble, wood, concrete...)" /><div className="wall-filters">{['All', 'Marble', 'Stone', 'Wood', 'Concrete', 'Fabric', 'Brick'].map((filter) => <button key={filter} className={filter === 'All' ? 'is-active' : ''}>{filter}</button>)}</div><div className="texture-grid">{WALL_TEXTURES.map(([name, background, tier]) => <button key={name} className={selectedTexture === name ? 'is-selected' : ''} onClick={() => { setSelectedTexture(name); apply({ wallMaterial: name === 'Limestone' ? 'stone' : 'wallpaper' }); }}><span style={{ background }} /><strong>{name}</strong><small>{tier}</small>{selectedTexture === name && <b>✓</b>}</button>)}</div><div className="texture-controls"><label>Texture Scale<strong>1.0x</strong><input type="range" min="0.5" max="2" step="0.1" defaultValue="1" /></label><label>Rotation<strong>0°</strong><input type="range" min="0" max="360" step="15" defaultValue="0" /></label></div><div className="wall-preview wide-preview texture-preview" /></div>; }

const FLOORING_PATTERNS = [
  ['Straight', 'repeating-linear-gradient(90deg,#a8794e 0 32px,#d2a777 33px 36px)'],
  ['Herringbone', 'linear-gradient(45deg,transparent 45%,#d3a372 46% 54%,transparent 55%),linear-gradient(-45deg,#936743 45%,#d0a172 46% 54%,#8c5e3f 55%)'],
  ['Chevron', 'repeating-linear-gradient(45deg,#b08357 0 18px,#d4ab7d 19px 22px)'],
  ['Diagonal', 'repeating-linear-gradient(135deg,#ad7b4e 0 20px,#d5aa7b 21px 25px)'],
  ['Basket Weave', 'repeating-linear-gradient(0deg,#a97c53 0 13px,#d0a276 14px 20px),repeating-linear-gradient(90deg,transparent 0 25px,#805439 26px 33px)'],
  ['Parquet', 'repeating-linear-gradient(45deg,#b78b5e 0 18px,#8b5b3c 19px 24px)'],
  ['Hexagon', 'radial-gradient(circle,#cab497 0 5px,transparent 6px),#777875'],
  ['Tile Grid', 'repeating-linear-gradient(0deg,#8f918f 0 3px,transparent 4px 32px),repeating-linear-gradient(90deg,#8f918f 0 3px,#c7c5bd 4px 32px)'],
];
const FLOORING_EXTENDED = [
  ['Oak Natural', '#b88857', '$32/m²', 'oakNatural'], ['Oak Grey', '#85877f', '$34/m²', 'oakGrey'], ['Walnut Premium', '#70442f', '$42/m²', 'walnutPremium'], ['Maple Light', '#cba77b', '$28/m²', 'oakNatural'],
  ['Herringbone Oak', '#a9774d', '$38/m²', 'oakNatural'], ['Marble Carrara', '#d9d5cc', '$56/m²', 'travertine'], ['Travertine', '#c5ad8e', '$48/m²', 'travertine'], ['Concrete Grey', '#898b87', '$30/m²', 'concreteLight'],
  ['Terrazzo Sand', '#c6b298', '$36/m²', 'travertine'], ['Porcelain Tile', '#a6a7a2', '$40/m²', 'porcelainTile'], ['Slate Black', '#37383a', '$44/m²', 'porcelainTile'], ['Custom', '#555b5b', 'Upload / Select', 'oakNatural'],
];

function FlooringContent({ room, setRoomAppearance }) {
  const [tab, setTab] = useState('Materials');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [pattern, setPattern] = useState('Herringbone');
  const [heating, setHeating] = useState(false);
  const [heatingType, setHeatingType] = useState('Electric');
  const [temperature, setTemperature] = useState(24);
  const [applied, setApplied] = useState(false);
  const apply = (updates = {}) => { setRoomAppearance(updates); setApplied(true); window.setTimeout(() => setApplied(false), 1500); };
  const current = FLOORING_EXTENDED.find(([name,,, id]) => id === room.floorMaterial) || FLOORING_EXTENDED[0];
  const filtered = FLOORING_EXTENDED.filter(([name]) => name.toLowerCase().includes(query.toLowerCase()) && (category === 'All' || (category === 'Wood' ? /oak|walnut|maple|herringbone/i.test(name) : category === 'Stone' ? /marble|travertine|slate/i.test(name) : category === 'Tile' ? /tile|terrazzo/i.test(name) : category === 'Concrete' ? /concrete/i.test(name) : true)));
  return <div className="flooring-content">
    <div className="flooring-heading"><h3>Flooring</h3><p>Choose materials and finishes for your floor</p></div>
    <div className="intelli-tabs flooring-tabs">{['Materials', 'Patterns', 'Properties', 'Heating'].map((item) => <button key={item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === 'Materials' && <>
      <div className="floor-filters">{['All', 'Wood', 'Tile', 'Stone', 'Concrete', 'Carpet'].map((item) => <button key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <input className="wall-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search flooring materials..." />
      <div className="floor-card-grid">{filtered.map(([name, color, price, id]) => <button key={name} className={`floor-card ${room.floorMaterial === id && current[0] === name ? 'is-selected' : ''}`} onClick={() => apply({ floorMaterial: id, floorColor: color })}><span style={{ background: color }} /><strong>{name}</strong><small>{price}</small>{room.floorMaterial === id && current[0] === name && <b>✓</b>}</button>)}</div>
      <div className="floor-feature"><span style={{ background: current[1] }} /><div><strong>{current[0]}</strong><small>Warm, timeless and versatile</small></div><button>View Details →</button></div>
    </>}
    {tab === 'Patterns' && <>
      <div className="floor-hero-preview pattern-hero"><strong>{pattern} Pattern</strong><small>A timeless pattern that adds elegance and depth to your space.</small></div>
      <div className="floor-pattern-grid">{FLOORING_PATTERNS.map(([name, background]) => <button key={name} className={pattern === name ? 'is-selected' : ''} onClick={() => { setPattern(name); apply({ floorPattern: name }); }}><span style={{ background }} /><small>{name}</small>{pattern === name && <b>✓</b>}</button>)}</div>
      <div className="floor-control-grid"><label>Pattern Scale<strong>1.0x</strong><input type="range" min="0.5" max="2" step="0.1" defaultValue="1" /></label><label>Direction<select><option>Auto (Room Orientation)</option><option>North / South</option><option>East / West</option></select></label><label>Rotation<strong>0°</strong><input type="range" min="0" max="360" defaultValue="0" /></label><label>Offset<input value="X 0.00 m   Y 0.00 m" readOnly /></label></div>
    </>}
    {tab === 'Properties' && <>
      <div className="selected-flooring"><span style={{ background: current[1] }} /><div><strong>{current[0]}</strong><small>{pattern} Pattern</small><button onClick={() => setTab('Materials')}>Change Material →</button></div></div>
      <div className="floor-property-section"><h4>Dimensions</h4><label>Thickness<strong>18 mm</strong><input type="range" min="8" max="30" defaultValue="18" /></label><div className="floor-input-row"><label>Plank Size (L × W)<input value="600 mm" readOnly /></label><span>×</span><input value="120 mm" readOnly /></div></div>
      <div className="floor-property-section"><h4>Pattern Settings</h4><label>Pattern Type<select value={pattern} onChange={(event) => setPattern(event.target.value)}>{FLOORING_PATTERNS.map(([name]) => <option key={name}>{name}</option>)}</select></label><label>Pattern Scale<strong>1.0x</strong><input type="range" min="0.5" max="2" defaultValue="1" /></label><label>Rotation<strong>0°</strong><input type="range" min="0" max="360" defaultValue="0" /></label></div>
    </>}
    {tab === 'Heating' && <>
      <div className="floor-hero-preview heating-hero"><strong>Underfloor Heating</strong><small>Comfort in every step. A warmer, smarter home.</small></div><div className="heating-toggle"><div><strong>Enable Heating</strong><small>Turn on to add underfloor heating to this floor</small></div><button className={`intelli-switch ${heating ? 'is-on' : ''}`} onClick={() => setHeating(!heating)}><span /></button></div><div className="heating-types"><button className={heatingType === 'Electric' ? 'is-selected' : ''} onClick={() => setHeatingType('Electric')}><strong>ϟ Electric</strong><small>Quick heating, ideal for apartments</small></button><button className={heatingType === 'Water-based' ? 'is-selected' : ''} onClick={() => setHeatingType('Water-based')}><strong>◌ Water-based</strong><small>Energy efficient, ideal for large spaces</small></button></div><label className="heating-range">Target Temperature<strong>{temperature} °C</strong><input type="range" min="16" max="30" value={temperature} onChange={(event) => setTemperature(event.target.value)} /></label><div className="coverage-buttons"><span>Coverage Area</span>{['This Room', 'All Rooms', 'Custom'].map((item) => <button key={item} className={item === 'This Room' ? 'is-selected' : ''}>{item}</button>)}</div><div className="heating-options"><span>Warm-up Time<strong>30 min</strong></span><span>Energy Consumption (Est.)<strong>120 W/m²</strong></span><span>Show Heating Pipes (Preview)<i className="intelli-switch is-on"><b /></i></span><span>Include in Cost<i className="intelli-switch is-on"><b /></i></span></div></>}
    <div className="floor-actions"><button className="intelli-apply" onClick={() => apply({ floorHeating: heating, heatingType, heatingTemperature: Number(temperature) })}>{applied ? 'Applied' : tab === 'Heating' ? 'Apply Heating' : tab === 'Patterns' ? 'Apply Pattern' : 'Apply to Floor'}</button><button onClick={() => apply({})}>{tab === 'Properties' ? 'Reset' : tab === 'Patterns' ? 'Apply to All Floors' : '◈'}</button></div>
  </div>;
}

function ConfigurationPanel() {
  const selectedIds = useStore((s) => s.selectedIds);
  const room = useStore((s) => s.room);
  const setRoomAppearance = useStore((s) => s.setRoomAppearance);
  const [activeSection, setActiveSection] = useState('Layout');
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
          {activeSection === 'Layout' ? <LayoutContent room={room} setRoomAppearance={setRoomAppearance} /> : activeSection === 'Walls' ? <WallsContent room={room} setRoomAppearance={setRoomAppearance} /> : activeSection === 'Flooring' ? <FlooringContent room={room} setRoomAppearance={setRoomAppearance} /> : <>
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
          </>}
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
