/**
 * Series Repository Stub
 *
 * Example implementation showing how to create a new content repository
 * using the generic abstractions from ContentRepository.ts and TmdbDataSource.ts.
 *
 * This file is a STUB - it demonstrates the pattern but is not wired into the UI.
 * Uncomment and complete when ready to implement Series support.
 */

// import * as seriesDataSource from '../tmdb/datasources/seriesDataSource';
// import { mapTmdbSeriesToSeries, mapTmdbSeriesArrayToSeries } from '../tmdb/mappers/seriesMapper';
// import type { Series } from './types'; // Add Series type to types.ts

// const seriesCache = new Map<string, Series>();
// const tmdbIdToSlugCache = new Map<number, string>();

/**
 * Get a curated list of series (popular + top-rated).
 * Uncomment implementation when ready:
 *
 * export async function getSeries(): Promise<Series[]> {
 *   if (seriesCache.size > 0) {
 *     return Array.from(seriesCache.values());
 *   }
 *
 *   const popularResult = await seriesDataSource.fetchPopularSeries(1);
 *   const topRatedResult = await seriesDataSource.fetchTopRatedSeries(1);
 *
 *   const series: Series[] = [];
 *
 *   if (popularResult.data) {
 *     const mapped = mapTmdbSeriesArrayToSeries(popularResult.data.slice(0, 10));
 *     for (const item of mapped) {
 *       seriesCache.set(item.slug, item);
 *       if (item.externalId) {
 *         tmdbIdToSlugCache.set(parseInt(item.externalId, 10), item.slug);
 *       }
 *       series.push(item);
 *     }
 *   }
 *
 *   // ... same for top-rated
 *
 *   return series;
 * }
 */

/**
 * Get a single series by slug.
 * export async function getSeriesBySlug(slug: string): Promise<Series | null> {
 *   const cached = seriesCache.get(slug);
 *   if (cached) return cached;
 *
 *   const tmdbId = extractTmdbIdFromSlug(slug);
 *   if (!tmdbId) return null;
 *
 *   return getSeriesByTmdbId(tmdbId);
 * }
 */

/**
 * Get a series by TMDB ID.
 * export async function getSeriesByTmdbId(tmdbId: number): Promise<Series | null> {
 *   // Fetch series details and credits
 *   const [seriesResult, creditsResult] = await Promise.all([
 *     seriesDataSource.fetchSeriesById(tmdbId),
 *     seriesDataSource.fetchSeriesCredits(tmdbId),
 *   ]);
 *
 *   if (!seriesResult.data) return null;
 *
 *   const series = mapTmdbSeriesToSeries(seriesResult.data, creditsResult.data);
 *   seriesCache.set(series.slug, series);
 *   return series;
 * }
 */

// Export stubs for future use:
// export { getSeries, getSeriesBySlug, getSeriesByTmdbId, searchSeries };