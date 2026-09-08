/**
 * SceneCanvas — the main R3F Canvas wrapper.
 *
 * Brings together all 3D scene elements: room, furniture, lighting,
 * controls, grid, measurements, and camera management.
 */
import React, { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
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
  return null;
}

class SceneErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.warn('[v0] Scene asset failed to load; showing fallback scene.', error);
    }
  }

  render() {
    return this.state.hasError ? <SceneFallback /> : this.props.children;
  }
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
      camera={{
        position: [8.8, 6.6, 8.8],
        fov: 46,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      dpr={[1, 1.75]}
      onCreated={({ gl }) => {
        gl.setClearColor('#121313', 1);
      }}
      onPointerMissed={() => useStore.getState().clearSelection()}
      style={{ background: 'transparent' }}
    >
      <SceneErrorBoundary>
        <Suspense fallback={<SceneFallback />}>
        <color attach="background" args={['#121313']} />
        <fog attach="fog" args={['#121313', 18, 42]} />
        <SceneLighting />
        <Room />
        <FurnitureManager />
        <CollisionAdvisoryEngine />
        <Grid />
        <MeasurementOverlay />
        <DeselectPlane />

        {/* Directional lighting and room materials provide the grounding. */}
        </Suspense>
      </SceneErrorBoundary>

      <SceneControls />
      <CameraManager />
    </Canvas>
  );
}
