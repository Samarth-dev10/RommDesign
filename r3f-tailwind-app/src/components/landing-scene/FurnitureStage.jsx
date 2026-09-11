import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liveProgress } from '../../store/useSceneProgress.js';

// Placeholder procedural furniture - structured so each item can later be
// swapped for a real GLB catalog asset without touching the animation logic.

function useEntrance(appearAt, fullyAt) {
  const groupRef = useRef();
  useFrame(() => {
    if (!groupRef.current) return;
    const s = liveProgress.scroll;
    const t = THREE.MathUtils.smoothstep(s, appearAt, fullyAt);
    groupRef.current.scale.setScalar(0.001 + t * 0.999);
    groupRef.current.position.y = (1 - t) * -0.4;
    groupRef.current.traverse((obj) => {
      if (obj.material) {
        obj.material.transparent = true;
        obj.material.opacity = t;
      }
    });
  });
  return groupRef;
}

function Sofa() {
  const ref = useEntrance(0.44, 0.58);
  return (
    <group ref={ref} position={[-1.6, 0, -2.2]}>
      <mesh castShadow receiveShadow position={[0, 0.32, 0]}>
        <boxGeometry args={[2.2, 0.5, 0.9]} />
        <meshStandardMaterial color="#3a3a3f" roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 0.72, -0.32]}>
        <boxGeometry args={[2.2, 0.55, 0.25]} />
        <meshStandardMaterial color="#333338" roughness={0.75} />
      </mesh>
      <mesh castShadow position={[-1.02, 0.55, 0]}>
        <boxGeometry args={[0.16, 0.45, 0.9]} />
        <meshStandardMaterial color="#333338" roughness={0.75} />
      </mesh>
      <mesh castShadow position={[1.02, 0.55, 0]}>
        <boxGeometry args={[0.16, 0.45, 0.9]} />
        <meshStandardMaterial color="#333338" roughness={0.75} />
      </mesh>
    </group>
  );
}

function CoffeeTable() {
  const ref = useEntrance(0.48, 0.6);
  return (
    <group ref={ref} position={[-1.6, 0, -0.8]}>
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.55]} />
        <meshStandardMaterial color="#c9a877" roughness={0.4} metalness={0.1} />
      </mesh>
      {[[-0.42, -0.22], [0.42, -0.22], [-0.42, 0.22], [0.42, 0.22]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.1, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function TVConsole() {
  const ref = useEntrance(0.5, 0.62);
  return (
    <group ref={ref} position={[0, 0, -3.35]}>
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[2.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.05, -0.02]}>
        <boxGeometry args={[1.7, 0.95, 0.05]} />
        <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  );
}

function Rug() {
  const ref = useEntrance(0.46, 0.56);
  return (
    <group ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[-1.2, 0.01, -1.5]}>
      <mesh receiveShadow>
        <circleGeometry args={[1.6, 48]} />
        <meshStandardMaterial color="#5c4b3a" roughness={0.95} />
      </mesh>
    </group>
  );
}

function FloorLamp() {
  const ref = useEntrance(0.52, 0.64);
  return (
    <group ref={ref} position={[1.8, 0, -2.6]}>
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.7, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <coneGeometry args={[0.28, 0.35, 24, 1, true]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.6, 0]} intensity={0.5} color="#ffd9a8" distance={3.5} />
    </group>
  );
}

function DecorObjects() {
  const ref = useEntrance(0.58, 0.68);
  return (
    <group ref={ref} position={[-1.6, 0.28, -0.8]}>
      <mesh castShadow position={[0.25, 0.08, 0.1]}>
        <cylinderGeometry args={[0.06, 0.08, 0.16, 16]} />
        <meshStandardMaterial color="#8a8578" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.2, 0.05, -0.1]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#b8763f" roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function FurnitureStage() {
  return (
    <group>
      <Sofa />
      <CoffeeTable />
      <TVConsole />
      <Rug />
      <FloorLamp />
      <DecorObjects />
    </group>
  );
}