/**
 * Room — procedural room geometry (walls, floor, ceiling, windows, doors).
 *
 * Generates room geometry from template data. The room is centered at origin.
 * Walls have cutouts indicated by slightly different colored panels.
 */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import useStore from '../../store/useStore';

/** Create a wall mesh. */
function Wall({ position, size, color, rotation = [0, 0, 0] }) {
  return (
    <mesh
      position={position}
      rotation={rotation}

    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.72}
        metalness={0.04}
        envMapIntensity={0.38}
      />
    </mesh>
  );
}

/** Create a window opening */
function WindowPanel({ position, size, thickness, rotation = [0, 0, 0] }) {
  const depth = thickness + 0.05; // Slightly thicker than wall to prevent z-fighting
  return (
    <group position={position} rotation={rotation}>
      {/* Window frame */}
      <mesh >
        <boxGeometry args={[size[0] + 0.08, size[1] + 0.08, depth]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Blackout background to hide wall interior */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Glass pane */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[size[0], size[1], 0.01]} />
        <meshPhysicalMaterial
          color="#aaddff"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      {/* Cross bars */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[size[0], 0.04, 0.02]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.04, size[1], 0.02]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Create a door opening */
function DoorPanel({ position, size, thickness, rotation = [0, 0, 0] }) {
  const depth = thickness + 0.05;
  return (
    <group position={position} rotation={rotation}>
      {/* Door frame */}
      <mesh >
        <boxGeometry args={[size[0] + 0.1, size[1] + 0.05, depth]} />
        <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Door panel itself (simulated slightly open or just a solid block) */}
      <mesh position={[0, 0, 0.01]} >
        <boxGeometry args={[size[0], size[1], depth - 0.02]} />
        <meshStandardMaterial color="#4a3b2c" roughness={0.7} />
      </mesh>
      {/* Handle */}
      <mesh position={[size[0] / 2 - 0.1, 0, depth / 2 + 0.02]}>
        <boxGeometry args={[0.02, 0.15, 0.04]} />
        <meshStandardMaterial color="#dddddd" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export default function Room() {
  const room = useStore((s) => s.room);
  const windows = useStore((s) => s.windows);
  const doors = useStore((s) => s.doors);

  const { width, depth, height, wallColor, floorColor, ceilingColor, wallThickness } = room;
  const hw = width / 2;
  const hd = depth / 2;
  const hh = height / 2;
  const t = wallThickness;

  // Compute window positions in world coordinates
  const windowMeshes = useMemo(() => {
    return windows.map((win, i) => {
      let pos, rot;
      switch (win.wall) {
        case 'back':
          pos = [
            -hw + win.position * width,
            win.sillHeight + win.height / 2,
            -hd - t / 2,
          ];
          rot = [0, 0, 0];
          break;
        case 'front':
          pos = [
            -hw + win.position * width,
            win.sillHeight + win.height / 2,
            hd + t / 2,
          ];
          rot = [0, Math.PI, 0];
          break;
        case 'left':
          pos = [
            -hw - t / 2,
            win.sillHeight + win.height / 2,
            -hd + win.position * depth,
          ];
          rot = [0, Math.PI / 2, 0];
          break;
        case 'right':
          pos = [
            hw + t / 2,
            win.sillHeight + win.height / 2,
            -hd + win.position * depth,
          ];
          rot = [0, -Math.PI / 2, 0];
          break;
        default:
          pos = [0, 1.5, -hd];
          rot = [0, 0, 0];
      }
      return (
        <WindowPanel
          key={`win-${i}`}
          position={pos}
          size={[win.width, win.height]}
          thickness={t}
          rotation={rot}
        />
      );
    });
  }, [windows, width, depth, height, hw, hd, t]);

  // Compute door positions in world coordinates
  const doorMeshes = useMemo(() => {
    return doors.map((door, i) => {
      let pos, rot;
      switch (door.wall) {
        case 'back':
          pos = [
            -hw + door.position * width,
            door.height / 2, // Doors sit on the floor
            -hd - t / 2,
          ];
          rot = [0, 0, 0];
          break;
        case 'front':
          pos = [
            -hw + door.position * width,
            door.height / 2,
            hd + t / 2,
          ];
          rot = [0, Math.PI, 0];
          break;
        case 'left':
          pos = [
            -hw - t / 2,
            door.height / 2,
            -hd + door.position * depth,
          ];
          rot = [0, Math.PI / 2, 0];
          break;
        case 'right':
          pos = [
            hw + t / 2,
            door.height / 2,
            -hd + door.position * depth,
          ];
          rot = [0, -Math.PI / 2, 0];
          break;
        default:
          pos = [0, 1, -hd];
          rot = [0, 0, 0];
      }
      return (
        <DoorPanel
          key={`door-${i}`}
          position={pos}
          size={[door.width, door.height]}
          thickness={t}
          rotation={rot}
        />
      );
    });
  }, [doors, width, depth, height, hw, hd, t]);

  return (
    <group userData={{ roomBounds: { width, depth, height }, floorY: 0 }}>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}

      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={0.7}
          metalness={0.05}
          envMapIntensity={0.6}
          clearcoat={0.18}
          clearcoatRoughness={0.42}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Recessed ceiling cove gives the room a finished architectural edge. */}
      <mesh position={[0, height - 0.055, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width - 0.16, depth - 0.16]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.72} metalness={0.02} />
      </mesh>

      {/* Back Wall (Z-) */}
      <Wall
        position={[0, hh, -hd - t / 2]}
        size={[width + t * 2, height, t]}
        color={wallColor}
      />

      {/* Front Wall (Z+) */}
      <Wall
        position={[0, hh, hd + t / 2]}
        size={[width + t * 2, height, t]}
        color={wallColor}
      />

      {/* Left Wall (X-) */}
      <Wall
        position={[-hw - t / 2, hh, 0]}
        size={[t, height, depth]}
        color={wallColor}
      />

      {/* Right Wall (X+) */}
      <Wall
        position={[hw + t / 2, hh, 0]}
        size={[t, height, depth]}
        color={wallColor}
      />

      {/* Windows and Doors */}
      {windowMeshes}
      {doorMeshes}

      {/* Soft recessed floor inset adds a subtle junction shadow. */}
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[Math.max(width - 0.08, 0.1), Math.max(depth - 0.08, 0.1)]} />
        <meshStandardMaterial color={floorColor} roughness={0.82} metalness={0.02} transparent opacity={0.32} />
      </mesh>

      {/* Baseboard trim */}
      <mesh position={[0, 0.04, -hd + 0.005]} receiveShadow>
        <boxGeometry args={[width, 0.08, 0.02]} />
        <meshStandardMaterial color="#d4d0cc" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.04, hd - 0.005]} receiveShadow>
        <boxGeometry args={[width, 0.08, 0.02]} />
        <meshStandardMaterial color="#d4d0cc" roughness={0.5} />
      </mesh>
      <mesh position={[-hw + 0.005, 0.04, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.08, depth]} />
        <meshStandardMaterial color="#d4d0cc" roughness={0.5} />
      </mesh>
      <mesh position={[hw - 0.005, 0.04, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.08, depth]} />
        <meshStandardMaterial color="#d4d0cc" roughness={0.5} />
      </mesh>
    </group>
  );
}
