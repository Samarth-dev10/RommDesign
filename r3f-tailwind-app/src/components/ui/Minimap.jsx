/**
 * Minimap — 2D top-down room overview rendered in an HTML canvas.
 *
 * Shows room outline, furniture positions (colored rectangles),
 * and highlights selected items.
 */
import React, { useRef, useEffect } from 'react';
import useStore from '../../store/useStore';

const MINIMAP_SIZE = 160;
const PADDING = 12;

export default function Minimap() {
  const canvasRef = useRef(null);
  const showMinimap = useStore((s) => s.showMinimap);
  const room = useStore((s) => s.room);
  const furniture = useStore((s) => s.furniture);
  const selectedIds = useStore((s) => s.selectedIds);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showMinimap) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Scale factor: map room to minimap
    const scale = Math.min(
      (w - PADDING * 2) / room.width,
      (h - PADDING * 2) / room.depth
    );
    const offsetX = w / 2;
    const offsetY = h / 2;

    // Room outline
    ctx.strokeStyle = '#4f46e5'; // indigo-600
    ctx.lineWidth = 2;
    ctx.strokeRect(
      offsetX - (room.width / 2) * scale,
      offsetY - (room.depth / 2) * scale,
      room.width * scale,
      room.depth * scale
    );

    // Floor fill
    ctx.fillStyle = 'rgba(79, 70, 229, 0.05)'; // indigo-600 with low opacity
    ctx.fillRect(
      offsetX - (room.width / 2) * scale,
      offsetY - (room.depth / 2) * scale,
      room.width * scale,
      room.depth * scale
    );

    // Furniture dots
    furniture.forEach((item) => {
      if (item.isVisible === false) return;
      const x = offsetX + item.position[0] * scale;
      const y = offsetY + item.position[2] * scale;
      const isSelected = selectedIds.includes(item.id);

      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#f59e0b' : '#64748b'; // amber-500 : slate-500
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [showMinimap, room, furniture, selectedIds]);

  if (!showMinimap) return null;

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1.5 pointer-events-none">
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        className="bg-white/80 backdrop-blur-md border border-black/10 rounded-lg shadow-sm w-40 h-40"
      />
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/80 backdrop-blur-md py-0.5 px-1.5 rounded border border-black/10">Minimap</span>
    </div>
  );
}
