/**
 * WatchProviderRepository – caches TMDB watch provider data per movie.
 *
 * The repository loads providers lazily – the first call for a given TMDB ID
 * performs a network request to `GET /movie/{id}/watch/providers`.
 * Subsequent calls return the cached result.
 *
 * The default region is "US" but a different region can be supplied.
 */

import { tmdbGet } from "../client.js";
import type { TmdbWatchProvider } from "../types.js";
import type { StreamingProvider } from "../../content/types.js";

/** In‑memory cache: movieId → { region → StreamingProvider[] } */
const cache = new Map<number, Map<string, StreamingProvider[]>>();

/** Build full logo URL from TMDB path */
function logoUrl(path: string): string {
  return `https://image.tmdb.org/t/p/w92/${path}`;
}

/** Convert TMDB provider entry to our StreamingProvider shape */
function toStreamingProvider(entry: { id: number; name: string; logo_path: string }, type: "flatrate" | "rent" | "buy"): StreamingProvider {
  return {
    id: entry.id,
    name: entry.name,
    logo: logoUrl(entry.logo_path),
    type,
  };
}

/**
 * Fetch providers for a movie ID and region (default "US").
 * Returns a flat array of providers; callers can group by `type`.
 */
export async function getProviders(movieId: number, region: string = "US"): Promise<StreamingProvider[]> {
  // Check cache first
  const regionCache = cache.get(movieId);
  if (regionCache) {
    const cached = regionCache.get(region);
    if (cached) return cached;
  }

  // Load from TMDB
  try {
    const data = await tmdbGet<TmdbWatchProvider>(`movie/${movieId}/watch/providers`);
    const countryData = (data.results ?? {})[region];
    if (!countryData) {
      // Cache empty result to avoid repeated look‑ups
      const empty: StreamingProvider[] = [];
      if (!cache.has(movieId)) cache.set(movieId, new Map());
      cache.get(movieId)!.set(region, empty);
      return empty;
    }

    const providers: StreamingProvider[] = [];
    if (Array.isArray(countryData.flatrate)) {
      providers.push(...countryData.flatrate.map(p => toStreamingProvider(p, "flatrate")));
    }
    if (Array.isArray(countryData.rent)) {
      providers.push(...countryData.rent.map(p => toStreamingProvider(p, "rent")));
    }
    if (Array.isArray(countryData.buy)) {
      providers.push(...countryData.buy.map(p => toStreamingProvider(p, "buy")));
    }

    // Store in cache
    if (!cache.has(movieId)) cache.set(movieId, new Map());
    cache.get(movieId)!.set(region, providers);
    return providers;
  } catch (e) {
    console.error(`[WatchProviderRepository] Failed for movie ${movieId}`, e);
    // Cache empty array on error to avoid spamming the API
    const empty: StreamingProvider[] = [];
    if (!cache.has(movieId)) cache.set(movieId, new Map());
    cache.get(movieId)!.set(region, empty);
    return empty;
  }
}
