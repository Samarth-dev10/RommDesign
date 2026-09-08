/**
 * CameraManager — smooth camera transitions between preset views.
 *
 * When cameraMode changes, animates the camera to the new position.
 */
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { CAMERA_MODES } from '../../constants';

const _targetPos = new THREE.Vector3();
const _currentPos = new THREE.Vector3();

export default function CameraManager() {
  const cameraMode = useStore((s) => s.cameraMode);
  const { camera } = useThree();
  const isTransitioning = useRef(false);
  const targetPosition = useRef(new THREE.Vector3(10.8, 8.2, 10.8));
  const prevMode = useRef(cameraMode);

  useEffect(() => {
    if (prevMode.current !== cameraMode) {
      const preset = CAMERA_MODES[cameraMode];
      if (preset) {
        targetPosition.current.set(...preset.position);
        isTransitioning.current = true;
        if (camera.fov !== preset.fov) {
          camera.fov = preset.fov;
          camera.updateProjectionMatrix();
        }
      }
      prevMode.current = cameraMode;
    }
  }, [cameraMode, camera]);

  useFrame(() => {
    if (!isTransitioning.current) return;

    camera.position.lerp(targetPosition.current, 0.05);

    const dist = camera.position.distanceTo(targetPosition.current);
    if (dist < 0.01) {
      camera.position.copy(targetPosition.current);
      isTransitioning.current = false;
    }

    camera.lookAt(0, 0.75, 0);
  });

  return null;
}
