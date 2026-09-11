import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liveProgress } from '../../store/useSceneProgress.js';

const ROOM_W = 8;
const ROOM_D = 7;
const ROOM_H = 3.2;

export default function RoomStage() {
  const floorRef = useRef();
  const backWallMat = useRef();
  const sideWallMat = useRef();
  const ceilingRef = useRef();
  const windowGlowRef = useRef();
  const gridRef = useRef();

  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    const step = size / 8;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(size, i * step);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
  }, []);

  useFrame(() => {
    const s = liveProgress.scroll;

    const gridVisibility = THREE.MathUtils.smoothstep(s, 0.05, 0.22) * (1 - THREE.MathUtils.smoothstep(s, 0.3, 0.4));
    if (gridRef.current) gridRef.current.material.opacity = gridVisibility * 0.5;

    if (windowGlowRef.current) {
      windowGlowRef.current.intensity = 0.15 + THREE.MathUtils.smoothstep(s, 0.5, 0.9) * 0.9;
    }
  });

  return (
    <group>
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -ROOM_D / 2 + 3]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#151515" roughness={0.85} metalness={0.05} />
      </mesh>

      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -ROOM_D / 2 + 3]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshBasicMaterial map={gridTexture} transparent opacity={0} />
      </mesh>

      <mesh position={[0, ROOM_H / 2, -ROOM_D + 3]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial ref={backWallMat} color="#111113" roughness={0.95} />
      </mesh>

      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 3 - ROOM_D / 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial ref={sideWallMat} color="#0d0d0f" roughness={0.95} />
      </mesh>

      <mesh position={[ROOM_W / 2, ROOM_H / 2, 3 - ROOM_D / 2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.95} />
      </mesh>

      <mesh position={[ROOM_W / 2 - 0.02, 1.7, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 1.6]} />
        <meshBasicMaterial color="#9fb4d8" transparent opacity={0.18} />
      </mesh>
      <pointLight ref={windowGlowRef} position={[ROOM_W / 2 - 1, 1.8, 0.5]} intensity={0.15} color="#ffcf9e" distance={6} />

      <mesh ref={ceilingRef} position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {[-2, 0, 2].map((x) => (
        <mesh key={x} position={[x, ROOM_H - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 3.5]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}