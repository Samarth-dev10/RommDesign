const DEFAULT_MARGIN = 0.05;

export function getRoomBounds(room, margin = DEFAULT_MARGIN) {
  const width = Math.max(0, Number(room?.width) || 0);
  const depth = Math.max(0, Number(room?.depth) || 0);
  const height = Math.max(0, Number(room?.height) || 0);

  return {
    minX: -Math.max(0, width / 2 - margin),
    maxX: Math.max(0, width / 2 - margin),
    minY: 0,
    maxY: height,
    minZ: -Math.max(0, depth / 2 - margin),
    maxZ: Math.max(0, depth / 2 - margin),
  };
}

export function clampPositionToRoom(position, room, footprint = [0, 0, 0]) {
  const bounds = getRoomBounds(room);
  const halfWidth = Math.max(0, Math.abs(footprint[0] || 0));
  const halfDepth = Math.max(0, Math.abs(footprint[2] || 0));

  return [
    Math.min(bounds.maxX - halfWidth, Math.max(bounds.minX + halfWidth, position?.[0] || 0)),
    Math.min(bounds.maxY, Math.max(bounds.minY, position?.[1] || 0)),
    Math.min(bounds.maxZ - halfDepth, Math.max(bounds.minZ + halfDepth, position?.[2] || 0)),
  ];
}

export function getWallPosition(wall, offset, room) {
  const halfWidth = room.width / 2;
  const halfDepth = room.depth / 2;
  switch (wall) {
    case 'front': return [offset * room.width - halfWidth, 0, halfDepth];
    case 'left': return [-halfWidth, 0, offset * room.depth - halfDepth];
    case 'right': return [halfWidth, 0, offset * room.depth - halfDepth];
    case 'back':
    default: return [offset * room.width - halfWidth, 0, -halfDepth];
  }
}
