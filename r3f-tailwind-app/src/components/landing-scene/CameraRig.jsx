import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liveProgress } from '../../store/useSceneProgress.js';

// Defines the camera path across the narrative stages (0..1 scroll).
// Each keyframe: [scrollT, camPos(xyz), lookAt(xyz), fov]
const KEYFRAMES = [
  { t: 0.0, pos: [0, 1.55, 9.2], look: [0, 1.2, 0], fov: 42 },
  { t: 0.14, pos: [3.4, 1.7, 6.4], look: [0, 1.1, -0.5], fov: 40 },
  { t: 0.28, pos: [-3.2, 2.0, 5.6], look: [0.3, 1.0, -0.8], fov: 40 },
  { t: 0.42, pos: [-4.4, 1.5, 2.6], look: [-0.6, 0.9, -1.2], fov: 38 },
  { t: 0.56, pos: [3.6, 1.6, 2.2], look: [0.2, 0.9, -1], fov: 38 },
  { t: 0.70, pos: [2.6, 2.4, 4.8], look: [-0.4, 0.8, -1.4], fov: 36 },
  { t: 0.84, pos: [0, 1.35, 6.8], look: [0, 1.0, -1.6], fov: 34 },
  { t: 1.0, pos: [0, 1.5, 5.6], look: [0, 1.0, -1.8], fov: 32 },
];

function lerpKeyframes(t) {
  let a = KEYFRAMES[0];
  let b = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (t >= KEYFRAMES[i].t && t <= KEYFRAMES[i + 1].t) {
      a = KEYFRAMES[i];
      b = KEYFRAMES[i + 1];
      break;
    }
  }
  const span = b.t - a.t || 1;
  const local = THREE.MathUtils.clamp((t - a.t) / span, 0, 1);
  const eased = local * local * (3 - 2 * local);

  return {
    pos: [
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], eased),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], eased),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], eased),
    ],
    look: [
      THREE.MathUtils.lerp(a.look[0], b.look[0], eased),
      THREE.MathUtils.lerp(a.look[1], b.look[1], eased),
      THREE.MathUtils.lerp(a.look[2], b.look[2], eased),
    ],
    fov: THREE.MathUtils.lerp(a.fov, b.fov, eased),
  };
}

export default function CameraRig({ children }) {
  const targetPos = useRef(new THREE.Vector3(0, 1.6, 9));
  const targetLook = useRef(new THREE.Vector3(0, 1.2, 0));
  const currentLook = useRef(new THREE.Vector3(0, 1.2, 0));
  const smoothMouseX = useRef(0);
  const smoothMouseY = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const { scroll, mouseX, mouseY } = liveProgress;

    const kf = lerpKeyframes(scroll);

    // Slow, cinematic lerp toward the raw mouse target - never snaps
    smoothMouseX.current = THREE.MathUtils.lerp(smoothMouseX.current, mouseX, 1 - Math.pow(0.0015, dt));
    smoothMouseY.current = THREE.MathUtils.lerp(smoothMouseY.current, mouseY, 1 - Math.pow(0.0015, dt));

    // The room is the protagonist: parallax is felt but restrained
    const parallaxX = smoothMouseX.current * 0.6;
    const parallaxY = smoothMouseY.current * -0.32;

    targetPos.current.set(
      kf.pos[0] + parallaxX,
      kf.pos[1] + parallaxY,
      kf.pos[2]
    );
    targetLook.current.set(
      kf.look[0] + smoothMouseX.current * 0.5,
      kf.look[1] + smoothMouseY.current * -0.28,
      kf.look[2]
    );

    // Scroll position moves at a measured, deliberate pace; mouse look is silkier
    state.camera.position.lerp(targetPos.current, 1 - Math.pow(0.0006, dt));
    currentLook.current.lerp(targetLook.current, 1 - Math.pow(0.0012, dt));
    state.camera.lookAt(currentLook.current);

    if (Math.abs(state.camera.fov - kf.fov) > 0.01) {
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, kf.fov, 1 - Math.pow(0.001, dt));
      state.camera.updateProjectionMatrix();
    }
  });

  return <>{children}</>;
}