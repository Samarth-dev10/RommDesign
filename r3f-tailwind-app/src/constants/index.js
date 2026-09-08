/**
 * Application-wide constants for the 3D Room Design Playground.
 */

// ─── Furniture Categories ───────────────────────────────────
export const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏠' },
  { id: 'living-room', label: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { id: 'office', label: 'Office', icon: '💼' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { id: 'plants', label: 'Plants', icon: '🌿' },
  { id: 'decor', label: 'Decor', icon: '🖼️' },
  { id: 'lighting', label: 'Lighting', icon: '💡' },
  { id: 'tables', label: 'Tables', icon: '🪑' },
  { id: 'chairs', label: 'Chairs', icon: '🪑' },
  { id: 'storage', label: 'Storage', icon: '🗄️' },
];

// ─── Camera Presets ─────────────────────────────────────────
export const CAMERA_MODES = {
  perspective: {
    label: 'Perspective',
    icon: '🎥',
    position: [10.8, 8.2, 10.8],
    target: [0, 0.75, 0],
    fov: 46,
  },
  top: {
    label: 'Top View',
    icon: '⬆️',
    position: [0, 12, 0.01],
    target: [0, 0, 0],
    fov: 50,
  },
  front: {
    label: 'Front View',
    icon: '👁️',
    position: [0, 3, 10],
    target: [0, 1.5, 0],
    fov: 50,
  },
  side: {
    label: 'Side View',
    icon: '👈',
    position: [10, 3, 0],
    target: [0, 1.5, 0],
    fov: 50,
  },
  isometric: {
    label: 'Isometric',
    icon: '🔷',
    position: [8, 8, 8],
    target: [0, 0, 0],
    fov: 35,
  },
  orbit: {
    label: 'Orbit',
    icon: '🔄',
    position: [6, 5, 6],
    target: [0, 0, 0],
    fov: 50,
  },
};

// ─── Light Presets ──────────────────────────────────────────
export const LIGHT_PRESETS = {
  day: {
    label: 'Day',
    icon: '☀️',
    ambient: { intensity: 0.6, color: '#ffffff' },
    directional: { intensity: 1.2, color: '#fff5e6', position: [5, 8, 3] },
    environment: 'apartment',
    background: '#87CEEB',
  },
  evening: {
    label: 'Evening',
    icon: '🌅',
    ambient: { intensity: 0.3, color: '#ffd4a3' },
    directional: { intensity: 0.8, color: '#ff8c42', position: [2, 4, -3] },
    environment: 'sunset',
    background: '#2d1b4e',
  },
  night: {
    label: 'Night',
    icon: '🌙',
    ambient: { intensity: 0.15, color: '#4a5568' },
    directional: { intensity: 0.3, color: '#a0aec0', position: [-3, 6, -2] },
    environment: 'night',
    background: '#0a0a1a',
  },
  warm: {
    label: 'Warm Interior',
    icon: '🔥',
    ambient: { intensity: 0.5, color: '#ffe0b2' },
    directional: { intensity: 0.9, color: '#ffcc80', position: [3, 6, 2] },
    environment: 'apartment',
    background: '#1a1410',
  },
  studio: {
    label: 'Bright Studio',
    icon: '💡',
    ambient: { intensity: 0.8, color: '#f5f5f5' },
    directional: { intensity: 1.5, color: '#ffffff', position: [0, 10, 0] },
    environment: 'studio',
    background: '#e0e0e0',
  },
};

// ─── Snap Settings ──────────────────────────────────────────
export const GRID_SIZES = [
  { value: 0.05, label: '5 cm' },
  { value: 0.1, label: '10 cm' },
  { value: 0.25, label: '25 cm' },
  { value: 0.5, label: '50 cm' },
];

export const ROTATION_SNAPS = [
  { value: Math.PI / 12, label: '15°' },
  { value: Math.PI / 6, label: '30°' },
  { value: Math.PI / 4, label: '45°' },
  { value: Math.PI / 2, label: '90°' },
];

// ─── Transform Modes ───────────────────────────────────────
export const TRANSFORM_MODES = {
  translate: { label: 'Move', icon: '↔️', shortcut: 'W' },
  rotate: { label: 'Rotate', icon: '🔄', shortcut: 'E' },
  scale: { label: 'Scale', icon: '↗️', shortcut: 'R' },
};

// ─── Undo/Redo Limits ──────────────────────────────────────
export const MAX_HISTORY_SIZE = 50;

// ─── Autosave ───────────────────────────────────────────────
export const AUTOSAVE_DELAY_MS = 1000;
export const LOCAL_STORAGE_KEY = 'room-designer-state';
