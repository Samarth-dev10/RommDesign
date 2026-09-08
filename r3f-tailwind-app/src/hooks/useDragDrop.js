/**
 * Drag and Drop Hook — enables sidebar-to-canvas furniture placement.
 *
 * Usage:
 *   In sidebar: set draggable with data-registry-id attribute
 *   In canvas wrapper: use onDragOver/onDrop handlers
 */
import { useCallback } from 'react';
import useStore from '../store/useStore';
import { applySnapping } from '../utils/snapUtils';

/**
 * Hook for making sidebar items draggable.
 */
export function useDragSource(registryId) {
  const onDragStart = useCallback(
    (e) => {
      e.dataTransfer.setData('text/plain', registryId);
      e.dataTransfer.effectAllowed = 'copy';
    },
    [registryId]
  );

  return { onDragStart, draggable: true };
}

/**
 * Hook for the canvas drop target.
 */
export function useDropTarget() {
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const registryId = e.dataTransfer.getData('text/plain');
    if (!registryId) return;

    const room = useStore.getState().room;
    const rect = e.currentTarget.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const normalizedZ = (e.clientY - rect.top) / Math.max(rect.height, 1);
    const rawPosition = [
      (normalizedX - 0.5) * room.width,
      0,
      (normalizedZ - 0.5) * room.depth,
    ];
    const position = applySnapping(rawPosition, {
      snapEnabled: useStore.getState().snapEnabled,
      gridSize: useStore.getState().gridSize,
      snapHeight: 0,
      roomWidth: room.width,
      roomDepth: room.depth,
    });

    useStore.getState().addFurniture(registryId, position);
  }, []);

  return { onDragOver, onDrop };
}
