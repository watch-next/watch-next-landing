/**
 * GenreRepository – in‑memory cache for TMDB genre names.
 *
 * The first call loads the genre list from the TMDB endpoint
 *   GET /genre/movie/list
 * and stores a Map<number, string> (id → name).
 * Subsequent calls read from the map – no additional network traffic.
 */

import { tmdbGet } from "../client.js";
import type { TmdbGenre } from "../types.js";

/** Cache map: genre id => name */
const genreMap = new Map<number, string>();
let loaded = false;

/** Load the genre list from TMDB (once). */
async function loadGenres(): Promise<void> {
  if (loaded) return;
  try {
    const data = await tmdbGet<{ genres: TmdbGenre[] }>('genre/movie/list');
    for (const g of data.genres) {
      genreMap.set(g.id, g.name);
    }
    loaded = true;
  } catch (e) {
    console.error('[GenreRepository] Failed to load genres', e);
    // Keep map empty – callers will receive undefined names.
  }
}

/** Ensure the cache is populated – resolves when loading is done. */
export async function ensureGenres(): Promise<void> {
  if (!loaded) await loadGenres();
}

/** Synchronous lookup – returns undefined if not loaded or id missing. */
export function getGenreName(id: number): string | undefined {
  return genreMap.get(id);
}

/** Return the whole map (read‑only). */
export function getAllGenres(): ReadonlyMap<number, string> {
  return genreMap;
}
