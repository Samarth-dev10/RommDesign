import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { liveProgress } from '../../store/useSceneProgress.js';

export default function SceneLighting() {
  const keyLight = useRef();
  const rimLight = useRef();
  const warmLight = useRef();

  useFrame(() => {
    const s = liveProgress.scroll;
    if (keyLight.current) keyLight.current.intensity = 1.1 + s * 0.6;
    if (warmLight.current) warmLight.current.intensity = Math.max(0, (s - 0.55) * 2.2);
    if (rimLight.current) rimLight.current.intensity = 0.6 + s * 0.4;
  });

  return (
    <>
      <ambientLight intensity={0.25} color="#dfe6ef" />
      <directionalLight
        ref={keyLight}
        position={[4, 6, 3]}
        intensity={1.1}
        color="#eef2ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight ref={rimLight} position={[-5, 3, -4]} intensity={0.6} color="#7ea0ff" />
      <pointLight ref={warmLight} position={[-1.5, 2.2, -2]} intensity={0} color="#ffb87a" distance={8} />
    </>
  );
}