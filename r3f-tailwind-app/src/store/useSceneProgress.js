import { create } from 'zustand';

// Lightweight store holding ONLY the values that must be read outside the
// animation loop (React UI). Per-frame camera/scene updates happen via a
// mutable ref bridge (liveProgress) to avoid per-frame React re-renders.
export const useSceneProgress = create((set) => ({
  activeSection: 0,
  setActiveSection: (i) => set({ activeSection: i }),
}));

// Mutable, non-reactive bridge for high-frequency values (0..1 scroll
// progress, mouse position). R3F components read this every frame via
// useFrame instead of subscribing to React state.
export const liveProgress = {
  scroll: 0, // 0..1 across entire experience
  mouseX: 0, // -1..1
  mouseY: 0, // -1..1
};