/**
 * WatchProviderRepository – caches watch provider data per movie from backend.
 *
 * The repository loads providers lazily – the first call for a given TMDB ID
 * performs a backend request to `GET /api/v1/movies/{id}/providers`.
 * Subsequent calls return the cached result.
 *
 * The default region is "US" but a different region can be supplied.
 */

import { httpClient } from "@/lib/http/client";
import type { StreamingProvider } from "../../content/types.js";

/** In‑memory cache: movieId → { region → StreamingProvider[] } */
const cache = new Map<number, Map<string, StreamingProvider[]>>();

/** Build full logo URL from backend (using TMDB image URL) */
function logoUrl(path: string | null): string {
  if (!path) return '';
  const baseUrl = import.meta.env.VITE_TMDB_IMAGE_URL || 'https://image.tmdb.org';
  return `${baseUrl}/t/p/w92/${path}`;
}

/** Convert backend provider entry to our StreamingProvider shape */
function toStreamingProvider(
  entry: { id: number; name: string; logo_path?: string | null },
  type: "flatrate" | "rent" | "buy"
): StreamingProvider {
  return {
    id: entry.id,
    name: entry.name,
    logo: logoUrl(entry.logo_path),
    type,
  };
}

/**
 * Fetch providers for a TMDB movie ID and region (default "US").
 * Returns a flat array of providers; callers can group by `type`.
 */
export async function getProviders(movieTmdbId: number, region: string = "US"): Promise<StreamingProvider[]> {
  // Check cache first
  const regionCache = cache.get(movieTmdbId);
  if (regionCache) {
    const cached = regionCache.get(region);
    if (cached) return cached;
  }

  // Load from backend
  try {
    // Backend returns array of providers with type field
    const response = await httpClient.get<Array<{
      id: number;
      tmdb_id: number;
      name: string;
      logo_path?: string | null;
      display_priority?: number;
      type: string;
    }>>(`/movies/${movieTmdbId}/providers`);

    const providers: StreamingProvider[] = response.data.map(p => ({
      id: p.id,
      name: p.name,
      logo: logoUrl(p.logo_path),
      type: p.type as "flatrate" | "rent" | "buy",
    }));

    // Store in cache
    if (!cache.has(movieTmdbId)) {
      cache.set(movieTmdbId, new Map());
    }
    cache.get(movieTmdbId)!.set(region, providers);
    return providers;
  } catch (e) {
    console.error(`[WatchProviderRepository] Failed for movie ${movieTmdbId}`, e);
    // Cache empty array on error to avoid spamming the API
    const empty: StreamingProvider[] = [];
    if (!cache.has(movieTmdbId)) {
      cache.set(movieTmdbId, new Map());
    }
    cache.get(movieTmdbId)!.set(region, empty);
    return empty;
  }
}

/** Clear the cache (useful for testing or manual refresh). */
export function clearProviderCache(): void {
  cache.clear();
}
