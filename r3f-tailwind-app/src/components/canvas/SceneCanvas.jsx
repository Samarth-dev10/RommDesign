/**
 * SceneCanvas — the main R3F Canvas wrapper.
 *
 * Brings together all 3D scene elements: room, furniture, lighting,
 * controls, grid, measurements, and camera management.
 */
import React, { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import Room from './Room';
import FurnitureManager from './FurnitureManager';
import CollisionAdvisoryEngine from './CollisionAdvisoryEngine';
import SceneControls from './SceneControls';
import SceneLighting from './SceneLighting';
import CameraManager from './CameraManager';
import Grid from './Grid';
import MeasurementOverlay from './MeasurementOverlay';
import useStore from '../../store/useStore';

function SceneFallback() {
  return (
    <mesh position={[0, 0.75, 0]}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial color="#36d6c3" wireframe transparent opacity={0.7} />
    </mesh>
  );
}

function SceneErrorBoundary({ children }) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (event) => {
      if (event?.message?.toLowerCase?.().includes('could not load')) setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return hasError ? <SceneFallback /> : children;
}

/** Click on empty space to deselect */
function DeselectPlane() {
  const clearSelection = useStore((s) => s.clearSelection);
  const room = useStore((s) => s.room);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      onPointerDown={(e) => {
        // Only deselect if clicked directly on the floor
        if (e.object) {
          clearSelection();
        }
      }}
      visible={false}
    >
      <planeGeometry args={[room.width * 2, room.depth * 2]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export default function SceneCanvas() {
  return (
    <Canvas
      shadows
      camera={{
        position: [8, 6, 8],
        fov: 50,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        gl.setClearColor('#101318', 0);
      }}
      onPointerMissed={() => useStore.getState().clearSelection()}
      style={{ background: 'transparent' }}
    >
      <SceneErrorBoundary>
        <Suspense fallback={<SceneFallback />}>
        <SceneLighting />
        <Room />
        <FurnitureManager />
        <CollisionAdvisoryEngine />
        <Grid />
        <MeasurementOverlay />
        <DeselectPlane />

        {/* Contact shadows for grounding */}
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.4}
            scale={20}
            blur={2}
            far={4}
            color="#1a1a2e"
          />
        </Suspense>
      </SceneErrorBoundary>

      <SceneControls />
      <CameraManager />
    </Canvas>
  );
}
