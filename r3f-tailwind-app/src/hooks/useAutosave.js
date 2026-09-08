/** Debounced browser-local persistence for the editor. */
import { useEffect, useRef, useSyncExternalStore } from 'react';
import useStore from '../store/useStore';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/roomUtils';

export default function useAutosave() {
  const restored = useRef(false);
  const state = useSyncExternalStore(
    useStore.subscribe,
    useStore.getState,
    useStore.getState,
  );
  const room = state.room;
  const windows = state.windows;
  const doors = state.doors;
  const furniture = state.furniture;
  const currentTemplate = state.currentTemplate;
  const lightPreset = state.lightPreset;
  const favorites = state.favorites;
  const saveStatus = state.saveStatus;
  const importRoom = state.importRoom;
  const setSaveStatus = state.setSaveStatus;

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const saved = loadFromLocalStorage();
    if (saved?.furniture && Array.isArray(saved.furniture)) importRoom(saved);
  }, [importRoom]);

  useEffect(() => {
    if (!restored.current) return;
    setSaveStatus('saving');
    const timer = window.setTimeout(() => {
      const ok = saveToLocalStorage({
        currentTemplate,
        room,
        windows,
        doors,
        furniture,
        lightPreset,
        favorites,
      });
      setSaveStatus(ok ? 'saved' : 'error');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [room, windows, doors, furniture, currentTemplate, lightPreset, favorites, setSaveStatus]);

  useEffect(() => {
    if (saveStatus !== 'saved') return undefined;
    const timer = window.setTimeout(() => setSaveStatus('idle'), 1800);
    return () => window.clearTimeout(timer);
  }, [saveStatus, setSaveStatus]);
}
