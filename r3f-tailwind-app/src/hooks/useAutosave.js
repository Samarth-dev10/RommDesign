/** Debounced browser-local persistence for the editor. */
import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/roomUtils';

export default function useAutosave() {
  const restored = useRef(false);
  const room = useStore((s) => s.room);
  const windows = useStore((s) => s.windows);
  const doors = useStore((s) => s.doors);
  const furniture = useStore((s) => s.furniture);
  const currentTemplate = useStore((s) => s.currentTemplate);
  const lightPreset = useStore((s) => s.lightPreset);
  const favorites = useStore((s) => s.favorites);
  const saveStatus = useStore((s) => s.saveStatus);
  const importRoom = useStore((s) => s.importRoom);
  const setSaveStatus = useStore((s) => s.setSaveStatus);

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
