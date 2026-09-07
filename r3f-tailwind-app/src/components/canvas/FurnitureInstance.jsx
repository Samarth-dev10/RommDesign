/**
 * FurnitureInstance — a single placed furniture object.
 *
 * Loads a GLB model, supports selection and hover highlighting.
 * Position/rotation/scale are fully controlled by the store (set via gizmo).
 */
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { getFurnitureById } from '../../data/furnitureRegistry';

export default function FurnitureInstance({ item }) {
  const definition = useMemo(
    () => getFurnitureById(item.catalogItemId ?? item.registryId),
    [item.catalogItemId, item.registryId],
  );

  // Keep invalid or legacy catalog entries out of the loader. Passing an empty
  // URL to GLTFLoader makes Vite return index.html, which then fails as JSON.
  if (!definition?.modelPath) return null;

  return <LoadedFurnitureInstance item={item} definition={definition} />;
}

function LoadedFurnitureInstance({ item, definition }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  const selectedIds = useStore((s) => s.selectedIds);
  const selectFurniture = useStore((s) => s.selectFurniture);

  const isSelected = selectedIds.includes(item.id);

  const { scene } = useGLTF(definition.modelPath);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
        }
      }
    });
    return clone;
  }, [scene]);

  // Highlight on hover/select
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (item.isColliding) {
          child.material.emissive = new THREE.Color('#ef4444');
          child.material.emissiveIntensity = 0.75;
        } else if (isSelected) {
          child.material.emissive = new THREE.Color('#6366f1');
          child.material.emissiveIntensity = 0.15;
        } else if (hovered) {
          child.material.emissive = new THREE.Color('#06b6d4');
          child.material.emissiveIntensity = 0.1;
        } else {
          child.material.emissive = new THREE.Color('#000000');
          child.material.emissiveIntensity = 0;
        }
      }
    });
  }, [clonedScene, isSelected, hovered, item.isColliding]);

  const { gl } = useThree();

  const handlePointerDown = (e) => {
    if (item.isLocked) return;
    e.stopPropagation();
    selectFurniture(item.id, e.shiftKey);
  };

  if (!definition) return null;

  return (
    <group
      ref={ref}
      userData={{ furnitureId: item.id }}
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        gl.domElement.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        gl.domElement.style.cursor = 'auto';
      }}
    >
      <primitive object={clonedScene} />

      {/* Selection outline box */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="#6366f1"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}
