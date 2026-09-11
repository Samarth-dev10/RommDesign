import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liveProgress } from '../../store/useSceneProgress.js';

// Visualizes "semantic search -> catalog retrieval" during the Catalog
// stage: small representative furniture objects orbit into view near the
// room, evoking retrieval rather than static cards.

const ITEMS = [
  { shape: 'box', color: '#9a8c78', args: [0.24, 0.24, 0.24] },
  { shape: 'sphere', color: '#7d95a8', args: [0.15, 20, 20] },
  { shape: 'cylinder', color: '#b0714f', args: [0.13, 0.13, 0.3, 16] },
  { shape: 'cone', color: '#8a8478', args: [0.16, 0.3, 16] },
  { shape: 'torus', color: '#6f7d92', args: [0.14, 0.05, 12, 24] },
];

function OrbitItem({ index, total, shape, color, args }) {
  const ref = useRef();
  const angleOffset = (index / total) * Math.PI * 2;

  useFrame((state) => {
    const s = liveProgress.scroll;
    const visibility = THREE.MathUtils.smoothstep(s, 0.3, 0.38) * (1 - THREE.MathUtils.smoothstep(s, 0.44, 0.5));
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const radius = 1.4;
    const angle = angleOffset + t * 0.25;
    ref.current.position.set(
      Math.cos(angle) * radius,
      1.3 + Math.sin(t * 0.6 + angleOffset) * 0.12,
      -1.5 + Math.sin(angle) * radius * 0.6
    );
    ref.current.rotation.y = angle;
    ref.current.scale.setScalar(visibility);
    ref.current.visible = visibility > 0.01;
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case 'sphere': return <sphereGeometry args={args} />;
      case 'cylinder': return <cylinderGeometry args={args} />;
      case 'cone': return <coneGeometry args={args} />;
      case 'torus': return <torusGeometry args={args} />;
      default: return <boxGeometry args={args} />;
    }
  }, [shape, args]);

  return (
    <mesh ref={ref} castShadow>
      {geometry}
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.15} />
    </mesh>
  );
}

export default function CatalogOrbit() {
  return (
    <group>
      {ITEMS.map((item, i) => (
        <OrbitItem key={i} index={i} total={ITEMS.length} {...item} />
      ))}
    </group>
  );
}