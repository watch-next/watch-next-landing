/**
 * GenreRepository – loads genres from backend API.
 *
 * Fetches genre list from backend on first call:
 *   GET /api/v1/movies (returns genres in response)
 * and stores a Map<number, string> (id → name).
 * Subsequent calls read from the map.
 */

import { httpClient } from "@/lib/http/client";
import type { BackendGenre } from "@/lib/api/movieDataSource";

/** Cache map: genre id => name */
const genreMap = new Map<number, string>();
let loaded = false;
let loading: Promise<void> | null = null;

/** Load the genre list from backend (once). */
async function loadGenres(): Promise<void> {
  if (loaded) return;
  if (loading) return loading;

  loading = (async () => {
    try {
      // Fetch movies and extract unique genres from the response
      // Backend now returns genres in the movie list response
      const response = await httpClient.get<{ data: Array<{ genres?: BackendGenre[] }> }>('/movies', {
        params: { page: 1, page_size: 100 },
      });

      const genreSet = new Set<number>();
      for (const movie of response.data.data || []) {
        if (movie.genres) {
          for (const genre of movie.genres) {
            if (!genreMap.has(genre.id)) {
              genreMap.set(genre.id, genre.name);
            }
            genreSet.add(genre.id);
          }
        }
      }

      loaded = true;
    } catch (e) {
      console.error('[GenreRepository] Failed to load genres from backend', e);
      // Keep map empty – callers will receive undefined names.
    } finally {
      loading = null;
    }
  })();

  return loading;
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

/** Clear the cache (useful for testing or manual refresh). */
export function clearGenreCache(): void {
  genreMap.clear();
  loaded = false;
  loading = null;
}
