const asVector = (value, fallback) => {
  if (!Array.isArray(value) || value.length !== 3) return fallback;
  return value.map((component) => Number(component));
};

export function furnitureToLayoutItem(item) {
  const position = asVector(item.position, [0, 0, 0]);
  const rotation = asVector(item.rotation, [0, 0, 0]);
  const scale = asVector(item.scale, [1, 1, 1]);

  return {
    id: item.id,
    pos_x: position[0],
    pos_y: position[1],
    pos_z: position[2],
    rot_x: rotation[0],
    rot_y: rotation[1],
    rot_z: rotation[2],
    scale_x: scale[0],
    scale_y: scale[1],
    scale_z: scale[2],
    is_locked: Boolean(item.isLocked),
    is_visible: item.isVisible !== false,
    material_overrides: item.materialOverrides ?? null,
  };
}

export function furnitureToLayoutPayload(furniture) {
  return { items: furniture.map(furnitureToLayoutItem) };
}

export function layoutItemToFurniture(item, runtime = {}) {
  return {
    id: item.id,
    catalogItemId: item.catalog_item_id ?? item.catalogItemId ?? runtime.catalogItemId,
    position: [item.pos_x, item.pos_y, item.pos_z],
    rotation: [item.rot_x, item.rot_y, item.rot_z],
    scale: [item.scale_x, item.scale_y, item.scale_z],
    isLocked: Boolean(item.is_locked),
    isVisible: item.is_visible !== false,
    isColliding: Boolean(runtime.isColliding),
    ...runtime,
  };
}

export function layoutPayloadToFurniture(payload, runtimeById = {}) {
  return (payload?.items ?? []).map((item) =>
    layoutItemToFurniture(item, runtimeById[item.id])
  );
}

export function cloneFurnitureState(furniture) {
  return JSON.parse(JSON.stringify(furniture));
}
