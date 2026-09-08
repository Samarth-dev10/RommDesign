import { getFurnitureById, normalizeCatalogItem } from '../data/furnitureRegistry';

export function getCatalogItem(itemOrId) {
  const item = typeof itemOrId === 'string' ? getFurnitureById(itemOrId) : itemOrId;
  return item ? normalizeCatalogItem(item) : null;
}

export function getCatalogDimensions(itemOrId) {
  return getCatalogItem(itemOrId)?.dimensions ?? { width: 1, height: 1, depth: 1 };
}

export function getCatalogFootprint(itemOrId, scale = [1, 1, 1]) {
  const dimensions = getCatalogDimensions(itemOrId);
  return {
    width: dimensions.width * Math.abs(scale[0] ?? 1),
    height: dimensions.height * Math.abs(scale[1] ?? 1),
    depth: dimensions.depth * Math.abs(scale[2] ?? 1),
  };
}

export function isCatalogAssetReady(itemOrId) {
  return Boolean(getCatalogItem(itemOrId)?.modelPath);
}

export function toFurnitureInstance(itemOrId, overrides = {}) {
  const item = getCatalogItem(itemOrId);
  if (!item) return null;
  return {
    catalogItemId: item.catalogItemId,
    registryId: item.id,
    name: item.name,
    category: item.category,
    modelPath: item.modelPath,
    position: overrides.position ?? [0, item.snapHeight, 0],
    rotation: overrides.rotation ?? item.defaultRotation,
    scale: overrides.scale ?? item.defaultScale,
    bounds: overrides.bounds ?? getCatalogFootprint(item),
    isLocked: Boolean(overrides.isLocked),
    isVisible: overrides.isVisible !== false,
    isColliding: false,
  };
}
