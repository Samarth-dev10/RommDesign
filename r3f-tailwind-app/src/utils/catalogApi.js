import { normalizeCatalogItem } from '../data/furnitureRegistry';

/**
 * Backend-agnostic catalog boundary. Networking/auth can be attached later
 * without changing the editor's catalog shape.
 */
export function catalogItemFromDto(dto) {
  if (!dto) return null;
  return normalizeCatalogItem({
    id: dto.id ?? dto.catalog_item_id,
    name: dto.name,
    category: dto.category,
    modelPath: dto.modelPath ?? dto.model_path,
    defaultScale: dto.defaultScale ?? dto.default_scale,
    defaultRotation: dto.defaultRotation ?? dto.default_rotation,
    snapHeight: dto.snapHeight ?? dto.snap_height,
    dimensions: dto.dimensions,
  });
}

export function catalogItemToDto(item) {
  const normalized = normalizeCatalogItem(item);
  return {
    id: normalized.catalogItemId,
    name: normalized.name,
    category: normalized.category,
    model_path: normalized.modelPath,
    default_scale: normalized.defaultScale,
    default_rotation: normalized.defaultRotation,
    snap_height: normalized.snapHeight,
    dimensions: normalized.dimensions,
  };
}

export function furnitureInstanceToDto(item) {
  return {
    id: item.id,
    catalog_item_id: item.catalogItemId,
    position: item.position,
    rotation: item.rotation,
    scale: item.scale,
    bounds: item.bounds,
    is_locked: Boolean(item.isLocked),
    is_visible: item.isVisible !== false,
  };
}

export function createCatalogClient({ fetcher = fetch } = {}) {
  return {
    async list({ endpoint = '/api/catalog' } = {}) {
      const response = await fetcher(endpoint);
      if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
      const payload = await response.json();
      return (Array.isArray(payload) ? payload : payload.items ?? []).map(catalogItemFromDto);
    },
  };
}
