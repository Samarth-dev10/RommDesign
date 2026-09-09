import React, { useEffect, useRef, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import useStore from '../../store/useStore';

const COLORS = { partition: '#c9b28c', column: '#9b8f80', opening: '#6e8790', niche: '#b48769' };

function StructureMesh({ item, selected, onSelect, transformMode, updateStructure }) {
  const [width, height, depth] = item.dimensions;
  const ref = useRef();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const content = <group ref={ref} position={item.position} rotation={item.rotation} onPointerDown={(event) => { event.stopPropagation(); onSelect(item.id, event.shiftKey); }}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={COLORS[item.type]} roughness={0.68} transparent={item.type === 'opening'} opacity={item.type === 'opening' ? 0.38 : 1} />
      </mesh>
      {selected && <mesh scale={[1.03, 1.03, 1.03]}>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial color="#e2b866" wireframe transparent opacity={0.9} />
      </mesh>}
    </group>;
  return <>{content}{selected && !item.isLocked && ready && ref.current && <TransformControls mode={transformMode} object={ref.current} onChange={() => { updateStructure(item.id, { position: ref.current.position.toArray(), rotation: [ref.current.rotation.x, ref.current.rotation.y, ref.current.rotation.z] }); }} />}</>;
}

export default function InteriorStructures() {
  const structures = useStore((state) => state.structures);
  const selectedIds = useStore((state) => state.selectedIds);
  const transformMode = useStore((state) => state.transformMode);
  const selectStructure = useStore((state) => state.selectStructure);
  const updateStructure = useStore((state) => state.updateStructure);
  return <group userData={{ interiorStructures: true }}>{structures.filter((item) => item.isVisible).map((item) => <StructureMesh key={item.id} item={item} selected={selectedIds.includes(item.id)} onSelect={selectStructure} transformMode={transformMode} updateStructure={updateStructure} />)}</group>;
}
