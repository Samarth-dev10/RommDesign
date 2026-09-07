/**
 * SceneControls — OrbitControls and TransformControls gizmo.
 *
 * Attaches a TransformControls gizmo to the selected furniture object,
 * supporting translate, rotate, and scale modes.
 * Disables orbit when the gizmo is being dragged.
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { OrbitControls, TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { getFurnitureById } from '../../data/furnitureRegistry';
import { applySnapping, clampToRoomFootprint } from '../../utils/snapUtils';

export default function SceneControls() {
  const orbitRef = useRef();
  const transformRef = useRef();
  const targetRef = useRef(new THREE.Object3D());
  const { scene } = useThree();

  const selectedIds = useStore((s) => s.selectedIds);
  const furniture = useStore((s) => s.furniture);
  const transformMode = useStore((s) => s.transformMode);
  const snapEnabled = useStore((s) => s.snapEnabled);
  const gridSize = useStore((s) => s.gridSize);
  const rotationSnap = useStore((s) => s.rotationSnap);
  const updateFurniture = useStore((s) => s.updateFurniture);
  const updateFurnitureWithHistory = useStore((s) => s.updateFurnitureWithHistory);

  // The currently selected furniture item data
  const selectedItem = useMemo(
    () =>
      selectedIds.length === 1
        ? furniture.find((f) => f.id === selectedIds[0])
        : null,
    [selectedIds, furniture]
  );

  // Add the invisible target object to the scene once
  useEffect(() => {
    const obj = targetRef.current;
    obj.visible = false;
    scene.add(obj);
    return () => {
      scene.remove(obj);
    };
  }, [scene]);

  // Sync the target object's transform to match selected furniture
  useEffect(() => {
    if (!selectedItem) return;
    const obj = targetRef.current;
    obj.position.set(...selectedItem.position);
    obj.rotation.set(...selectedItem.rotation);
    obj.scale.set(...selectedItem.scale);
  }, [selectedItem]);

  // Handle dragging-changed: disable orbit, commit transform on drop
  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;

    const onDraggingChanged = (e) => {
      if (orbitRef.current) orbitRef.current.enabled = !e.value;
    };

    controls.addEventListener('dragging-changed', onDraggingChanged);
    return () => {
      controls.removeEventListener('dragging-changed', onDraggingChanged);
    };
  }, []);

  // Live-update store while gizmo is being dragged (with boundary clamping)
  const room = useStore((s) => s.room);
  const selectedDefinition = selectedItem
    ? getFurnitureById(selectedItem.catalogItemId ?? selectedItem.registryId)
    : null;

  const constrainTarget = (obj) => {
    const snapHeight = selectedDefinition?.snapHeight ?? 0;
    const position = applySnapping(
      [obj.position.x, obj.position.y, obj.position.z],
      {
        snapEnabled,
        gridSize,
        snapHeight,
        roomWidth: room.width,
        roomDepth: room.depth,
      },
    );
    const halfExtent = selectedItem?.bounds?.halfExtent ?? [0.5, 0, 0.5];
    const boundedPosition = clampToRoomFootprint(
      position,
      room.width,
      room.depth,
      [halfExtent[0] * Math.abs(obj.scale.x), 0, halfExtent[2] * Math.abs(obj.scale.z)],
    );
    obj.position.set(...boundedPosition);

    // Furniture spins on the floor around its Y axis only.
    obj.rotation.x = 0;
    obj.rotation.z = 0;
  };

  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;

    const onChange = () => {
      if (!selectedItem) return;
      const obj = targetRef.current;
      constrainTarget(obj);
      updateFurniture(selectedItem.id, {
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: [obj.scale.x, obj.scale.y, obj.scale.z],
      });
    };

    const onMouseUp = () => {
      if (!selectedItem) return;
      const obj = targetRef.current;
      constrainTarget(targetRef.current);
      updateFurnitureWithHistory(selectedItem.id, {
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: [obj.scale.x, obj.scale.y, obj.scale.z],
      });
    };

    controls.addEventListener('change', onChange);
    controls.addEventListener('mouseUp', onMouseUp);
    return () => {
      controls.removeEventListener('change', onChange);
      controls.removeEventListener('mouseUp', onMouseUp);
    };
  }, [selectedItem, updateFurniture, updateFurnitureWithHistory, room, transformMode, snapEnabled, gridSize, selectedDefinition]);

  // Compute snap values
  const translationSnap = snapEnabled ? gridSize : null;
  const rotSnap = snapEnabled ? rotationSnap : null;
  const scaleSnap = snapEnabled ? 0.1 : null;

  return (
    <>
      <OrbitControls
        ref={orbitRef}
        makeDefault
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={1}
        maxDistance={40}
        enableDamping
        dampingFactor={0.1}
        target={[0, 0, 0]}
      />

      {selectedItem && (
        <TransformControls
          ref={transformRef}
          object={targetRef.current}
          mode={transformMode}
          translationSnap={translationSnap}
          rotationSnap={rotSnap}
          scaleSnap={scaleSnap}
          size={0.7}
        />
      )}
    </>
  );
}
