/**
 * Keyboard Shortcuts Hook — handles all global keyboard interactions.
 *
 * W = Translate, E/R = Rotate, S = Scale
 * Delete = Remove, Ctrl+D = Duplicate, Ctrl+C = Copy, Ctrl+V = Paste
 * Ctrl+Z = Undo, Ctrl+Y = Redo, Ctrl+A = Select All
 */
import { useEffect } from 'react';
import useStore from '../store/useStore';

export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in input fields
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT'
      ) {
        return;
      }

      const {
        selectedIds,
        setTransformMode,
        removeFurniture,
        duplicateFurniture,
        copySelected,
        paste,
        undo,
        redo,
        selectAll,
        clearSelection,
        rotateSelected,
      } = useStore.getState();

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            if (selectedIds.length > 0) duplicateFurniture(selectedIds);
            break;
          case 'c':
            e.preventDefault();
            copySelected();
            break;
          case 'v':
            e.preventDefault();
            paste();
            break;
          case 'z':
            e.preventDefault();
            undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'a':
            e.preventDefault();
            selectAll();
            break;
          default:
            break;
        }
        return;
      }

      // Plain key shortcuts
      switch (e.key.toLowerCase()) {
        case 'w':
          setTransformMode('translate');
          break;
        case 'e':
          setTransformMode('rotate');
          break;
          case 'r':
            e.preventDefault();
            rotateSelected(Math.PI / 2);
            break;
        case 's':
          setTransformMode('scale');
          break;
        case 'delete':
        case 'backspace':
          if (selectedIds.length > 0) {
            removeFurniture(selectedIds);
          }
          break;
        case 'escape':
          clearSelection();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
