/**
 * Grid — visible snap grid on the floor plane.
 * Uses drei's Grid component with dynamic sizing from snap settings.
 */
import React from 'react';
import { Grid as DreiGrid } from '@react-three/drei';
import useStore from '../../store/useStore';

export default function Grid() {
  const showGrid = useStore((s) => s.showGrid);
  const gridSize = useStore((s) => s.gridSize);
  const room = useStore((s) => s.room);

  if (!showGrid) return null;

  const cellSize = gridSize;
  const sectionSize = gridSize * 4;

  return (
    <DreiGrid
      position={[0, 0.005, 0]}
      args={[room.width, room.depth]}
      cellSize={cellSize}
      sectionSize={sectionSize}
      cellColor="#6366f1"
      sectionColor="#818cf8"
      cellThickness={0.5}
      sectionThickness={1}
      fadeDistance={15}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
    />
  );
}
