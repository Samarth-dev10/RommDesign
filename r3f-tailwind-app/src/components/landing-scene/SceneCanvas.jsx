import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraRig from './CameraRig.jsx';
import RoomStage from './RoomStage.jsx';
import FurnitureStage from './FurnitureStage.jsx';
import MaterialStage from './MaterialStage.jsx';
import CatalogOrbit from './CatalogOrbit.jsx';
import SceneLighting from './SceneLighting.jsx';

export default function SceneCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0, 1.6, 9] }}
    >
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 12, 26]} />
      <Suspense fallback={null}>
        <CameraRig>
          <SceneLighting />
          <RoomStage />
          <MaterialStage />
          <FurnitureStage />
          <CatalogOrbit />
        </CameraRig>
      </Suspense>
    </Canvas>
  );
}