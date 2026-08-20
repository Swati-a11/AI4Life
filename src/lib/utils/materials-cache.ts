/**
 * Client-side Materials Cache
 * Stores uploaded material metadata + extracted content in localStorage.
 * This ensures materials are always accessible after page reload on Vercel
 * (where serverless Lambda instances do not share in-memory state and
 *  MONGODB_URI may not be configured).
 */

const CACHE_KEY = "ai4life_materials_cache";

export interface CachedMaterial {
  id: string;
  materialId: string;
  title: string;
  name: string;
  sourceType: string;
  type: string;
  sizeMb: number;
  uploadedAt: string;
  status: string;
  content: string;
  extractedText: string;
  chunksCount: number;
  userId?: string;
}

export function loadMaterialsFromCache(userId?: string): CachedMaterial[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const all: CachedMaterial[] = JSON.parse(raw);
    if (!Array.isArray(all)) return [];
    // If userId is provided, filter to that user; otherwise return all
    if (userId) {
      return all.filter((m) => !m.userId || m.userId === userId);
    }
    return all;
  } catch {
    return [];
  }
}

export function saveMaterialToCache(material: CachedMaterial): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadMaterialsFromCache();
    const idx = existing.findIndex((m) => m.id === material.id);
    if (idx !== -1) {
      existing[idx] = material;
    } else {
      // Most recent first
      existing.unshift(material);
    }
    // Keep at most 50 materials in cache to avoid localStorage quota issues
    const trimmed = existing.slice(0, 50);
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silently ignore quota errors
  }
}

export function removeMaterialFromCache(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadMaterialsFromCache();
    const filtered = existing.filter((m) => m.id !== id);
    localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
  } catch {}
}

export function getMaterialFromCache(id: string): CachedMaterial | undefined {
  if (typeof window === "undefined") return undefined;
  const all = loadMaterialsFromCache();
  return all.find((m) => m.id === id || m.materialId === id);
}
