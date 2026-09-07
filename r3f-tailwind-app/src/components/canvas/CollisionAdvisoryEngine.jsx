import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { boxesIntersect } from '../../utils/collisionUtils';

const EPSILON = 0.0001;

export default function CollisionAdvisoryEngine() {
  const { scene } = useThree();
  const setCollisionStates = useStore((state) => state.setCollisionStates);
  const previousSignature = useRef('');
  const boxes = useRef(new Map());

  useEffect(() => () => setCollisionStates([]), [setCollisionStates]);

  useFrame(() => {
    const placedObjects = [];
    scene.traverse((object) => {
      if (!object.isGroup || !object.userData?.furnitureId || !object.visible) return;
      const box = new THREE.Box3().setFromObject(object);
      if (box.isEmpty()) return;
      placedObjects.push({ id: object.userData.furnitureId, box });
      boxes.current.set(object.userData.furnitureId, box);
    });

    const collisionIds = new Set();
    for (let index = 0; index < placedObjects.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < placedObjects.length; otherIndex += 1) {
        const current = placedObjects[index];
        const other = placedObjects[otherIndex];
        if (!boxesIntersect(current.box, other.box)) continue;
        const overlap = current.box.clone().intersect(other.box);
        if (overlap.getSize(new THREE.Vector3()).length() > EPSILON) {
          collisionIds.add(current.id);
          collisionIds.add(other.id);
        }
      }
    }

    const signature = [...collisionIds].sort().join('|');
    if (signature !== previousSignature.current) {
      previousSignature.current = signature;
      setCollisionStates(collisionIds);
    }
  });

  return null;
}

export function getCollisionBounds(object) {
  return new THREE.Box3().setFromObject(object);
}

export function createCollisionBox(position, size) {
  const halfSize = new THREE.Vector3(size[0] / 2, size[1] / 2, size[2] / 2);
  const center = new THREE.Vector3(...position);
  return new THREE.Box3(center.clone().sub(halfSize), center.clone().add(halfSize));
}

export function collisionBoxesOverlap(first, second) {
  return boxesIntersect(first, second);
}

export function collisionBoundsEqual(first, second) {
  return first.min.distanceToSquared(second.min) < EPSILON && first.max.distanceToSquared(second.max) < EPSILON;
}

