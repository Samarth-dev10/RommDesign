import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liveProgress } from '../../store/useSceneProgress.js';

// Demonstrates material/finish switching directly inside the 3D scene
// during the "Customization" stage (approx scroll 0.62 - 0.86).

const FLOOR_PRESETS = [
  { color: new THREE.Color('#151515'), roughness: 0.85 },
  { color: new THREE.Color('#6b4a34'), roughness: 0.55 },
  { color: new THREE.Color('#d9d3c7'), roughness: 0.4 },
];

export default function MaterialStage() {
  const floorOverlayRef = useRef();
  const wallAccentRef = useRef();
  const tmpColor = useRef(new THREE.Color());

  useFrame(() => {
    const s = liveProgress.scroll;
    const stageT = THREE.MathUtils.smoothstep(s, 0.62, 0.86);

    if (floorOverlayRef.current) {
      const total = FLOOR_PRESETS.length - 1;
      const scaled = stageT * total;
      const idx = Math.min(total - 1, Math.floor(scaled));
      const localT = scaled - idx;
      tmpColor.current.copy(FLOOR_PRESETS[idx].color).lerp(FLOOR_PRESETS[idx + 1].color, localT);
      floorOverlayRef.current.material.color.copy(tmpColor.current);
      floorOverlayRef.current.material.roughness = THREE.MathUtils.lerp(
        FLOOR_PRESETS[idx].roughness,
        FLOOR_PRESETS[idx + 1].roughness,
        localT
      );
      floorOverlayRef.current.material.opacity = THREE.MathUtils.smoothstep(s, 0.6, 0.68);
    }

    if (wallAccentRef.current) {
      const warmth = THREE.MathUtils.smoothstep(s, 0.65, 0.85);
      wallAccentRef.current.material.opacity = warmth * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={floorOverlayRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0.5]} receiveShadow>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial transparent opacity={0} roughness={0.7} />
      </mesh>
      <mesh ref={wallAccentRef} position={[0, 1.6, -3.98]}>
        <planeGeometry args={[8, 3.2]} />
        <meshBasicMaterial color="#8a6a4a" transparent opacity={0} />
      </mesh>
    </group>
  );
}