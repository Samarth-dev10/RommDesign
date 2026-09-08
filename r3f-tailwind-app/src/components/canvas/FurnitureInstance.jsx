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

  // Keep invalid or legacy catalog entries visible as a stable primitive so a
  // malformed asset never breaks selection or transform workflows.
  if (!definition?.modelPath) return <PrimitiveFurnitureInstance item={item} />;

  return <LoadedFurnitureInstance item={item} definition={definition} />;
}

function PrimitiveFurnitureInstance({ item }) {
  const selectedIds = useStore((s) => s.selectedIds);
  const selectFurniture = useStore((s) => s.selectFurniture);
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedIds.includes(item.id);
  const size = item.bounds?.size ?? [1, 1, 1];

  return (
    <group
      userData={{ furnitureId: item.id, primitive: true }}
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onPointerDown={(event) => {
        if (item.isLocked) return;
        event.stopPropagation();
        selectFurniture(item.id, event.shiftKey);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={item.isColliding ? '#ef4444' : hovered || isSelected ? '#36d6c3' : '#64748b'}
          emissive={item.isColliding ? '#ef4444' : isSelected ? '#36d6c3' : '#000000'}
          emissiveIntensity={item.isColliding || isSelected ? 0.35 : 0}
          transparent={item.isLocked}
          opacity={item.isLocked ? 0.65 : 1}
        />
      </mesh>
      {isSelected && (
        <mesh>
          <boxGeometry args={size.map((value) => value + 0.04)} />
          <meshBasicMaterial color="#36d6c3" wireframe transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function LoadedFurnitureInstance({ item, definition }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  const selectedIds = useStore((s) => s.selectedIds);
  const selectFurniture = useStore((s) => s.selectFurniture);

  const isSelected = selectedIds.includes(item.id);

  const { scene } = useGLTF(definition.modelPath);
  const modelBounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return { size, center };
  }, [scene]);

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

  useEffect(() => () => {
    if (gl.domElement.style.cursor === 'pointer') gl.domElement.style.cursor = 'auto';
  }, [gl]);

  const handlePointerDown = (e) => {
    if (item.isLocked) return;
    e.stopPropagation();
    selectFurniture(item.id, e.shiftKey);
  };

  return (
    <group
      ref={ref}
      userData={{ furnitureId: item.id, modelBounds: { size: modelBounds.size.toArray(), center: modelBounds.center.toArray() } }}
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        if (item.isLocked) e.stopPropagation();
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

      {/* Selection outline box uses measured native model bounds. */}
      {isSelected && (
          <mesh
            position={[modelBounds.center.x, modelBounds.center.y, modelBounds.center.z]}
            raycast={() => null}
          >
          <boxGeometry args={[modelBounds.size.x, modelBounds.size.y, modelBounds.size.z]} />
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
