/**
 * Series Repository
 *
 * The single entry point for TV series data access in the application.
 * Uses the backend API exclusively (no direct TMDB calls).
 *
 * Responsibilities:
 * - Expose application methods (getSeries, getSeriesBySlug, etc.)
 * - Normalize domain models
 * - Hide backend implementation details
 * - Slug ↔ TMDB ID resolution
 * - In-memory caching
 */

import * as api from "@/lib/api/tvDataSource";
import { mapTmdbGenresToGenres, type Genre } from "../tmdb/mappers/genreMapper";
import type { TVShowDetail, Person } from "./types";

// In-memory cache: slug → TVShowDetail
const seriesCache = new Map<string, TVShowDetail>();

// In-memory cache: tmdbId → slug (for reverse lookup)
const tmdbIdToSlugCache = new Map<number, string>();

/**
 * Get a curated list of series (popular + top-rated).
 * Returns up to 20 series total.
 */
export async function getSeries(): Promise<TVShowDetail[]> {
  // Try cache first
  if (seriesCache.size > 0) {
    return Array.from(seriesCache.values());
  }

  try {
    // Fetch from backend API
    const popularResponse = await api.fetchPopularShows(1, 10);
    const topRatedResponse = await api.fetchTopRatedShows(1, 10);

    const series: TVShowDetail[] = [];

    // Process popular series
    if (popularResponse.results) {
      for (const show of popularResponse.results) {
        const slug = `${show.id}-${show.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const seriesItem: TVShowDetail = {
          ...show,
          slug,
        };
        seriesCache.set(slug, seriesItem);
        tmdbIdToSlugCache.set(show.id, slug);
        series.push(seriesItem);
      }
    }

    // Process top-rated series (deduplicate by TMDB ID)
    if (topRatedResponse.results) {
      const existingIds = new Set(popularResponse.results?.map(s => s.id) ?? []);
      const uniqueTopRated = topRatedResponse.results.filter(s => !existingIds.has(s.id));

      for (const show of uniqueTopRated) {
        const slug = `${show.id}-${show.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const seriesItem: TVShowDetail = {
          ...show,
          slug,
        };
        seriesCache.set(slug, seriesItem);
        tmdbIdToSlugCache.set(show.id, slug);
        series.push(seriesItem);
      }
    }

    return series;
  } catch (error) {
    console.error('[SeriesRepository] Failed to fetch series from backend:', error);
    return [];
  }
}

/**
 * Get a single series by its slug.
 */
export async function getSeriesBySlug(slug: string): Promise<TVShowDetail | null> {
  // Check cache first
  const cached = seriesCache.get(slug);
  if (cached) {
    return cached;
  }

  // Extract TMDB ID from slug (format: ${id}-${name})
  const tmdbId = extractTmdbIdFromSlug(slug);
  if (!tmdbId) {
    console.error('[SeriesRepository] Invalid slug format:', slug);
    return null;
  }

  return getSeriesByTmdbId(tmdbId);
}

/**
 * Get a series by TMDB ID.
 * Fetches full details including seasons/episodes.
 */
export async function getSeriesByTmdbId(tmdbId: number): Promise<TVShowDetail | null> {
  // Check if we have it in cache by slug
  const cachedSlug = tmdbIdToSlugCache.get(tmdbId);
  if (cachedSlug) {
    const cached = seriesCache.get(cachedSlug);
    if (cached) return cached;
  }

  try {
    // Fetch series details from backend
    const show = await api.fetchTVShowDetails(tmdbId);

    // Build series with slug
    const slug = `${show.id}-${show.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const seriesItem: TVShowDetail = {
      ...show,
      slug,
      genres: mapTmdbGenresToGenres(show.genres || []),
    };

    // Cache the series
    seriesCache.set(slug, seriesItem);
    tmdbIdToSlugCache.set(tmdbId, slug);

    return seriesItem;
  } catch (error) {
    console.error(`[SeriesRepository] Failed to fetch series ${tmdbId}:`, error);
    return null;
  }
}

/**
 * Get season details with episodes.
 */
export async function getSeason(tmdbId: number, seasonNumber: number) {
  try {
    return await api.fetchSeasonDetails(tmdbId, seasonNumber);
  } catch (error) {
    console.error('[SeriesRepository] Failed to fetch season:', error);
    return null;
  }
}

/**
 * Get specific episode details.
 */
export async function getEpisode(tmdbId: number, seasonNumber: number, episodeNumber: number) {
  try {
    return await api.fetchEpisodeDetails(tmdbId, seasonNumber, episodeNumber);
  } catch (error) {
    console.error('[SeriesRepository] Failed to fetch episode:', error);
    return null;
  }
}

/**
 * Get similar series.
 */
export async function getSimilarSeries(tmdbId: number): Promise<TVShowDetail[]> {
  try {
    const response = await api.fetchSimilarShows(tmdbId, 12);
    return response.results?.map(show => ({
      ...show,
      slug: `${show.id}-${show.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    })) || [];
  } catch (error) {
    console.error('[SeriesRepository] Failed to fetch similar series:', error);
    return [];
  }
}

/**
 * Helper: Extract TMDB ID from slug.
 */
function extractTmdbIdFromSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Clear all caches (useful for testing or manual refresh).
 */
export function clearSeriesCache(): void {
  seriesCache.clear();
  tmdbIdToSlugCache.clear();
}