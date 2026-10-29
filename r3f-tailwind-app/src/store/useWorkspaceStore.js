import { create } from 'zustand';
import { createWorkspace as createWorkspaceRequest, getWorkspace, listWorkspaces, updateWorkspace } from '../lib/apiClient.js';
import useStore from './useStore.js';

const ACTIVE_WORKSPACE_KEY = 'intellispace.activeWorkspaceId';
let queuedSnapshot = null;
let runningSave = null;

function readActiveWorkspaceId() {
  try { return localStorage.getItem(ACTIVE_WORKSPACE_KEY) || null; } catch { return null; }
}

function writeActiveWorkspaceId(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
    else localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
  } catch { /* cloud editing still works if storage is unavailable */ }
}

export function getEditorSnapshot() {
  const state = useStore.getState();
  return {
    version: 2,
    currentTemplate: state.currentTemplate,
    room: { ...state.room },
    windows: state.windows,
    doors: state.doors,
    // Keep editor IDs and local model registry slugs; the backend item UUID is a
    // separate field on each furniture instance.
    furniture: state.furniture,
    structures: state.structures,
    customTemplates: state.customTemplates,
    lightPreset: state.lightPreset,
    favorites: state.favorites,
    showMinimap: state.showMinimap,
    showMeasurements: state.showMeasurements,
    showGrid: state.showGrid,
    environmentPreset: state.environmentPreset,
    environmentSettings: state.environmentSettings,
    lightingSettings: state.lightingSettings,
    lightingFixtures: state.lightingFixtures,
  };
}

function roomPayload(snapshot) {
  const room = snapshot.room || {};
  return {
    width: Number(room.width),
    depth: Number(room.depth),
    height: Number(room.height),
    wallThickness: Number(room.wallThickness),
  };
}

function appearancePayload(snapshot) {
  const room = snapshot.room || {};
  return {
    wallColor: /^#[0-9a-f]{6}$/i.test(room.wallColor || '') ? room.wallColor : '#FFFFFF',
    floorColor: /^#[0-9a-f]{6}$/i.test(room.floorColor || '') ? room.floorColor : '#8B7355',
    ceilingColor: /^#[0-9a-f]{6}$/i.test(room.ceilingColor || '') ? room.ceilingColor : '#FFFFFF',
    lightPreset: snapshot.lightPreset || 'day',
  };
}

function updatePayload(snapshot, expectedVersion) {
  return {
    room: roomPayload(snapshot),
    appearance: appearancePayload(snapshot),
    editorState: snapshot,
    expectedVersion,
  };
}

function unwrapWorkspace(payload) {
  return payload?.workspace || payload?.data?.workspace || payload?.data || payload;
}

function normalizeWorkspaceSummary(workspace) {
  const item = unwrapWorkspace(workspace) || {};
  return {
    ...item,
    id: item.id || item.workspaceId || item.workspace_id,
    name: item.name || item.title || 'Untitled workspace',
    roomType: item.roomType || item.room_type,
    designStyle: item.designStyle || item.design_style,
  };
}

function hydrateFromDetail(rawDetail) {
  const detail = unwrapWorkspace(rawDetail);
  if (!detail?.id && !detail?.workspaceId && !detail?.workspace_id) return false;
  const normalizedDetail = normalizeWorkspaceSummary(detail);
  const workspaceId = normalizedDetail.id;
  const editorState = detail.editorState || detail.editor_state || detail.snapshot || detail.editorStateJson || detail.editor_state_json;
  const hasSnapshot = editorState && Array.isArray(editorState.furniture);
  if (hasSnapshot) {
    const snapshot = {
      ...editorState,
      room: {
        ...(editorState.room || {}),
        ...(detail.room || detail.room_config || {}),
        ...(detail.appearance ? {
          wallColor: detail.appearance.wallColor,
          floorColor: detail.appearance.floorColor,
          ceilingColor: detail.appearance.ceilingColor,
        } : {}),
      },
      lightPreset: editorState.lightPreset || detail.appearance?.lightPreset || 'day',
    };
    useStore.getState().importRoom(snapshot);
  }
  writeActiveWorkspaceId(workspaceId);
  useWorkspaceStore.setState({
    activeWorkspaceId: workspaceId,
    activeWorkspaceName: normalizedDetail.name,
    version: Number.isInteger(detail.version) ? detail.version : 0,
    cloudStatus: 'saved',
    cloudError: '',
    conflict: false,
  });
  return hasSnapshot;
}

const useWorkspaceStore = create((set, get) => ({
  activeWorkspaceId: readActiveWorkspaceId(),
  activeWorkspaceName: '',
  version: null,
  cloudStatus: 'idle',
  cloudError: '',
  conflict: false,
  managerOpen: false,
  workspaces: [],
  isListing: false,
  isWorking: false,
  openManager: () => set({ managerOpen: true, cloudError: '' }),
  closeManager: () => set({ managerOpen: false }),
  setCloudStatus: (cloudStatus, cloudError = '') => set({ cloudStatus, cloudError }),

  async refreshWorkspaces() {
    set({ isListing: true, cloudError: '' });
    try {
      const payload = await listWorkspaces();
      const rows = Array.isArray(payload)
        ? payload
        : payload?.workspaces || payload?.items || payload?.data?.workspaces || payload?.data?.items || [];
      const workspaces = Array.isArray(rows) ? rows.map(normalizeWorkspaceSummary).filter((workspace) => workspace.id) : [];
      set({ workspaces, isListing: false });
      return workspaces;
    } catch (error) {
      set({ isListing: false, cloudError: error.message, cloudStatus: 'error' });
      throw error;
    }
  },

  async createCurrentWorkspace(name) {
    const cleanName = String(name || '').trim();
    if (!cleanName) throw new Error('Enter a workspace name.');
    set({ isWorking: true, cloudError: '', cloudStatus: 'saving' });
    const snapshot = getEditorSnapshot();
    let created = null;
    try {
      created = await createWorkspaceRequest({
        name: cleanName,
        description: 'Created in IntelliSpace editor',
        roomType: snapshot.currentTemplate || 'custom',
        designStyle: 'custom',
        room: roomPayload(snapshot),
        appearance: appearancePayload(snapshot),
        editorState: snapshot,
        currency: 'INR',
      });
      created = normalizeWorkspaceSummary(created);
      const saved = await updateWorkspace(created.id, updatePayload(snapshot, created.version ?? 0));
      hydrateFromDetail(saved);
      set({ isWorking: false, cloudStatus: 'saved', cloudError: '', managerOpen: false });
      try { await get().refreshWorkspaces(); } catch { /* preserve the successful create/save result */ }
      return saved;
    } catch (error) {
      if (created?.id) {
        // Do not lose the just-created project if the follow-up snapshot patch
        // failed; keep it selected and surface the unsaved state explicitly.
        writeActiveWorkspaceId(created.id);
        set({ activeWorkspaceId: created.id, activeWorkspaceName: created.name || cleanName,
          version: Number.isInteger(created.version) ? created.version : 0 });
      }
      set({ isWorking: false, cloudStatus: error.status === 409 ? 'conflict' : 'error', cloudError: error.message });
      throw error;
    }
  },

  async openWorkspace(id) {
    set({ isWorking: true, cloudError: '', cloudStatus: 'loading' });
    try {
      const detail = await getWorkspace(id);
      hydrateFromDetail(detail);
      set({ isWorking: false, managerOpen: false, cloudError: '' });
      return detail;
    } catch (error) {
      set({ isWorking: false, cloudStatus: 'error', cloudError: error.message });
      throw error;
    }
  },

  async restoreActiveWorkspace() {
    const id = get().activeWorkspaceId || readActiveWorkspaceId();
    if (!id) return false;
    try {
      const detail = await getWorkspace(id);
      return hydrateFromDetail(detail);
    } catch (error) {
      set({ cloudStatus: 'error', cloudError: `Could not restore cloud workspace: ${error.message}` });
      return false;
    }
  },

  async saveEditorSnapshot(snapshot) {
    if (!get().activeWorkspaceId) return true;
    queuedSnapshot = snapshot;
    if (runningSave) return runningSave;
    runningSave = (async () => {
      let ok = true;
      while (queuedSnapshot) {
        const nextSnapshot = queuedSnapshot;
        queuedSnapshot = null;
        const current = get();
        if (!current.activeWorkspaceId || current.version == null || current.conflict) return false;
        set({ cloudStatus: 'saving', cloudError: '' });
        try {
          const updated = await updateWorkspace(
            current.activeWorkspaceId,
            updatePayload(nextSnapshot, current.version),
          );
          set({ version: updated.version, activeWorkspaceName: updated.name || current.activeWorkspaceName,
            cloudStatus: 'saved', cloudError: '', conflict: false });
        } catch (error) {
          const conflict = error.status === 409;
          set({ cloudStatus: conflict ? 'conflict' : 'error', conflict, cloudError: error.message });
          ok = false;
          queuedSnapshot = null;
          break;
        }
      }
      return ok;
    })().finally(() => { runningSave = null; });
    return runningSave;
  },

  async clearActiveWorkspace() {
    writeActiveWorkspaceId(null);
    set({ activeWorkspaceId: null, activeWorkspaceName: '', version: null, cloudStatus: 'idle', cloudError: '', conflict: false });
  },
}));

export default useWorkspaceStore;
