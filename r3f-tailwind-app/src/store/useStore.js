/**
 * Zustand Store — single source of truth for the 3D Room Design Playground.
 *
 * Manages all application state: room data, selection, camera, lighting,
 * transform modes, undo/redo history, clipboard, and autosave status.
 */
import { create } from 'zustand';
import { generateId } from '../utils/idUtils';
import { getFurnitureById } from '../data/furnitureRegistry';
import { instantiateTemplate } from '../data/roomTemplates';
import { MAX_HISTORY_SIZE } from '../constants';
import { cloneFurnitureState } from '../utils/coordinateTransformers';

const DEFAULT_TEMPLATE = 'modern-living-room';

function createInitialState() {
  const template = instantiateTemplate(DEFAULT_TEMPLATE);
  return {
    // ── Room & Template ──────────────────────────
    currentTemplate: DEFAULT_TEMPLATE,
    room: template.room,
    windows: template.windows,
    doors: template.doors,
    furniture: template.furniture,
    lastSavedState: cloneFurnitureState(template.furniture),

    // ── Selection ────────────────────────────────
    selectedIds: [],

    // ── Transform ────────────────────────────────
    transformMode: 'translate',

    // ── Camera ───────────────────────────────────
    cameraMode: 'perspective',

    // ── Lighting ─────────────────────────────────
    lightPreset: template.lightPreset || 'day',

    // ── Snapping ─────────────────────────────────
    snapEnabled: true,
    gridSize: 0.25,
    rotationSnap: Math.PI / 4,

    // ── History ──────────────────────────────────
    history: [],
    future: [],

    // ── Clipboard ────────────────────────────────
    clipboard: [],

    // ── UI State ─────────────────────────────────
    saveStatus: 'idle',
    searchQuery: '',
    selectedCategory: 'all',
    favorites: [],
    recentlyUsed: [],
    showMinimap: true,
    showMeasurements: true,
    showGrid: true,
  };
}

const useStore = create((set, get) => ({
  ...createInitialState(),

  // ═══════════════════════════════════════════════
  // History Helpers
  // ═══════════════════════════════════════════════

  /** Push current furniture state to history before a mutation. */
  _pushHistory: () => {
    const { furniture, history } = get();
    const snapshot = JSON.parse(JSON.stringify(furniture));
    const newHistory = [...history, snapshot];
    if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();
    set({ history: newHistory, future: [] });
  },

  // ═══════════════════════════════════════════════
  // Template Actions
  // ═══════════════════════════════════════════════

  setTemplate: (templateId) => {
    const template = instantiateTemplate(templateId);
    if (!template) return;
    set({
      currentTemplate: templateId,
      room: template.room,
      windows: template.windows,
      doors: template.doors,
      furniture: template.furniture,
      lightPreset: template.lightPreset || 'day',
      lastSavedState: cloneFurnitureState(template.furniture),
      selectedIds: [],
      history: [],
      future: [],
    });
  },

  // ═══════════════════════════════════════════════
  // Furniture Actions
  // ═══════════════════════════════════════════════

  addFurniture: (registryId, position = [0, 0, 0]) => {
    const definition = getFurnitureById(registryId);
    if (!definition) return;
    get()._pushHistory();

    const newItem = {
      id: generateId(),
      catalogItemId: registryId,
      position: [...position],
      rotation: [...definition.defaultRotation],
      scale: [...definition.defaultScale],
      isLocked: false,
      isVisible: true,
      isColliding: false,
    };

    // Apply snapHeight
    if (definition.snapHeight > 0) {
      newItem.position[1] = definition.snapHeight;
    }

    set((state) => ({
      furniture: [...state.furniture, newItem],
      selectedIds: [newItem.id],
      recentlyUsed: [
        registryId,
        ...state.recentlyUsed.filter((id) => id !== registryId),
      ].slice(0, 10),
    }));

    return newItem.id;
  },

  removeFurniture: (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    get()._pushHistory();
    set((state) => ({
      furniture: state.furniture.filter((f) => !idsArray.includes(f.id)),
      selectedIds: state.selectedIds.filter((id) => !idsArray.includes(id)),
    }));
  },

  updateFurniture: (id, updates) => {
    set((state) => ({
      furniture: state.furniture.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));
  },

  /** Update furniture and push to history (for completed transforms). */
  updateFurnitureWithHistory: (id, updates) => {
    get()._pushHistory();
    set((state) => ({
      furniture: state.furniture.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));
  },

  duplicateFurniture: (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    get()._pushHistory();

    const { furniture } = get();
    const newItems = [];

    idsArray.forEach((id) => {
      const original = furniture.find((f) => f.id === id);
      if (original) {
        const newItem = {
          ...JSON.parse(JSON.stringify(original)),
          id: generateId(),
          position: [
            original.position[0] + 0.5,
            original.position[1],
            original.position[2] + 0.5,
          ],
        };
        newItems.push(newItem);
      }
    });

    set((state) => ({
      furniture: [...state.furniture, ...newItems],
      selectedIds: newItems.map((item) => item.id),
    }));
  },

  // ═══════════════════════════════════════════════
  // Selection Actions
  // ═══════════════════════════════════════════════

  selectFurniture: (id, additive = false) => {
    set((state) => {
      if (additive) {
        const isSelected = state.selectedIds.includes(id);
        return {
          selectedIds: isSelected
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        };
      }
      return { selectedIds: [id] };
    });
  },

  clearSelection: () => set({ selectedIds: [] }),

  selectAll: () =>
    set((state) => ({
      selectedIds: state.furniture.map((f) => f.id),
    })),

  // ═══════════════════════════════════════════════
  // Transform Mode
  // ═══════════════════════════════════════════════

  setTransformMode: (mode) => set({ transformMode: mode }),

  // ═══════════════════════════════════════════════
  // Camera
  // ═══════════════════════════════════════════════

  setCameraMode: (mode) => set({ cameraMode: mode }),

  // ═══════════════════════════════════════════════
  // Lighting
  // ═══════════════════════════════════════════════

  setLightPreset: (preset) => set({ lightPreset: preset }),

  // ═══════════════════════════════════════════════
  // Snapping
  // ═══════════════════════════════════════════════

  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
  setGridSize: (size) => set({ gridSize: size }),
  setRotationSnap: (snap) => set({ rotationSnap: snap }),

  // ═══════════════════════════════════════════════
  // Undo / Redo
  // ═══════════════════════════════════════════════

  undo: () => {
    const { history, furniture, future } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set({
      history: history.slice(0, -1),
      future: [JSON.parse(JSON.stringify(furniture)), ...future].slice(
        0,
        MAX_HISTORY_SIZE
      ),
      furniture: previous,
      selectedIds: [],
    });
  },

  redo: () => {
    const { history, furniture, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      future: future.slice(1),
      history: [...history, JSON.parse(JSON.stringify(furniture))].slice(
        -MAX_HISTORY_SIZE
      ),
      furniture: next,
      selectedIds: [],
    });
  },

  // ═══════════════════════════════════════════════
  // Clipboard (Copy / Paste)
  // ═══════════════════════════════════════════════

  copySelected: () => {
    const { selectedIds, furniture } = get();
    const items = furniture.filter((f) => selectedIds.includes(f.id));
    set({ clipboard: JSON.parse(JSON.stringify(items)) });
  },

  paste: () => {
    const { clipboard } = get();
    if (clipboard.length === 0) return;
    get()._pushHistory();

    const newItems = clipboard.map((item) => ({
      ...JSON.parse(JSON.stringify(item)),
      id: generateId(),
      position: [
        item.position[0] + 0.5,
        item.position[1],
        item.position[2] + 0.5,
      ],
    }));

    set((state) => ({
      furniture: [...state.furniture, ...newItems],
      selectedIds: newItems.map((item) => item.id),
    }));
  },

  // ═══════════════════════════════════════════════
  // Save / Load
  // ═══════════════════════════════════════════════

  setSaveStatus: (status) => set({ saveStatus: status }),

  markFurnitureSaved: () =>
    set((state) => ({ lastSavedState: cloneFurnitureState(state.furniture) })),

  revertSceneObjects: () =>
    set((state) => ({
      furniture: cloneFurnitureState(state.lastSavedState),
      selectedIds: [],
      history: [],
      future: [],
      saveStatus: 'error',
    })),

  exportRoom: () => {
    const { currentTemplate, room, windows, doors, furniture, lightPreset } =
      get();
    return {
      version: 1,
      currentTemplate,
      room,
      windows,
      doors,
      furniture,
      lightPreset,
      exportedAt: new Date().toISOString(),
    };
  },

  importRoom: (data) => {
    if (!data || !data.furniture) return;
    set({
      currentTemplate: data.currentTemplate || 'custom',
      room: data.room,
      windows: data.windows || [],
      doors: data.doors || [],
      furniture: data.furniture.map((item) => ({
        ...item,
        catalogItemId: item.catalogItemId ?? item.registryId,
        isLocked: item.isLocked ?? item.locked ?? false,
        isVisible: item.isVisible ?? item.visible ?? true,
        isColliding: false,
      })),
      lastSavedState: cloneFurnitureState(data.furniture),
      lightPreset: data.lightPreset || 'day',
      selectedIds: [],
      history: [],
      future: [],
    });
  },

  resetRoom: () => {
    const { currentTemplate } = get();
    get().setTemplate(currentTemplate);
  },

  // ═══════════════════════════════════════════════
  // Search & Categories
  // ═══════════════════════════════════════════════

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  toggleFavorite: (registryId) =>
    set((state) => ({
      favorites: state.favorites.includes(registryId)
        ? state.favorites.filter((id) => id !== registryId)
        : [...state.favorites, registryId],
    })),

  // ═══════════════════════════════════════════════
  // UI Toggles
  // ═══════════════════════════════════════════════

  toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
  toggleMeasurements: () =>
    set((state) => ({ showMeasurements: !state.showMeasurements })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
}));

export default useStore;
