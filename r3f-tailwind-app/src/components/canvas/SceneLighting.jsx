/**
 * SceneLighting — dynamic lighting system based on light preset.
 *
 * Renders ambient light, directional light with shadows, and
 * environment mapping based on the active preset.
 */
import React, { useMemo } from 'react';
import { Environment } from '@react-three/drei';
import useStore from '../../store/useStore';
import { LIGHT_PRESETS } from '../../constants';

export default function SceneLighting() {
  const lightPreset = useStore((s) => s.lightPreset);

  const config = useMemo(
    () => LIGHT_PRESETS[lightPreset] || LIGHT_PRESETS.midday,
    [lightPreset]
  );

  const sunPosition = useMemo(() => {
    const { azimuth = 218, elevation = 62 } = config.directional;
    const azimuthRadians = (azimuth * Math.PI) / 180;
    const elevationRadians = (elevation * Math.PI) / 180;
    const radius = 12;
    const horizontal = Math.cos(elevationRadians) * radius;

    return [
      Math.sin(azimuthRadians) * horizontal,
      Math.sin(elevationRadians) * radius,
      Math.cos(azimuthRadians) * horizontal,
    ];
  }, [config]);

  return (
    <>
      {/* Ambient fill light */}
      <ambientLight
        intensity={config.ambient.intensity * 0.82}
        color={config.ambient.color}
      />

      {/* Primary directional light with shadows */}
      <directionalLight
        position={sunPosition}
        intensity={config.directional.intensity}
        color={config.directional.color}
        castShadow={false}
      />

      {/* Secondary fill light */}
      <directionalLight
        position={[-3, 4, -2]}
        intensity={config.ambient.intensity * 0.22}
        color={config.ambient.color}
      />

      {/* Hemisphere light for natural sky/ground color blending */}
      <hemisphereLight
        args={['#d9e4ec', '#55463a', 0.32]}
      />

      {/* Environment light is used for reflections and soft ambient fill. */}
      <Environment preset={config.environment} blur={0.72} />
    </>
  );
}
