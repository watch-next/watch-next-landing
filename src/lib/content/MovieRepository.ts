/**
 * Movie Repository
 *
 * The single entry point for movie data access in the application.
 * Exposes domain methods that Views consume.
 *
 * Responsibilities:
 * - Expose application methods (getMovies, getMovieBySlug, etc.)
 * - Normalize domain models
 * - Hide TMDB implementation details
 * - Slug ↔ TMDB ID resolution
 * - In-memory caching
 *
 * Does NOT expose TMDB types or service methods directly.
 */

import * as dataSource from "../tmdb/datasources/movieDataSource.js";
import { mapTmdbMovieToMovie, mapTmdbMoviesToMovies } from "../tmdb/mappers/movieMapper.js";
import { mapTmdbCastMembersToPeople, mapTmdbCrewMembersToPeople, type Person } from "../tmdb/mappers/personMapper.js";
import { mapTmdbGenresToGenres, type Genre } from "../tmdb/mappers/genreMapper.js";
import type { Movie } from "./types";
import type { TmdbWatchProvider, TmdbVideo, TmdbImage, TmdbReview } from "../tmdb/types.js";

// In-memory cache: slug → Movie
const movieCache = new Map<string, Movie>();

// In-memory cache: tmdbId → slug (for reverse lookup)
const tmdbIdToSlugCache = new Map<number, string>();

/**
 * Get a curated list of movies (popular + top-rated).
 * Returns up to 20 movies total.
 */
export async function getMovies(): Promise<Movie[]> {
  // Try cache first
  if (movieCache.size > 0) {
    return Array.from(movieCache.values());
  }

  // Fetch from data source
  const popularResult = await dataSource.fetchPopularMovies(1);
  const topRatedResult = await dataSource.fetchTopRatedMovies(1);

  const movies: Movie[] = [];

  // Process popular movies
  if (popularResult.data) {
    const mapped = mapTmdbMoviesToMovies(popularResult.data.slice(0, 10));
    for (const movie of mapped) {
      movieCache.set(movie.slug, movie);
      if (movie.externalId) {
        tmdbIdToSlugCache.set(parseInt(movie.externalId, 10), movie.slug);
      }
      movies.push(movie);
    }
  }

  // Process top-rated movies (deduplicate by TMDB ID)
  if (topRatedResult.data) {
    const existingIds = new Set(popularResult.data.map(m => m.id));
    const uniqueTopRated = topRatedResult.data.filter(m => !existingIds.has(m.id));

    const mapped = mapTmdbMoviesToMovies(uniqueTopRated.slice(0, 10));
    for (const movie of mapped) {
      movieCache.set(movie.slug, movie);
      if (movie.externalId) {
        tmdbIdToSlugCache.set(parseInt(movie.externalId, 10), movie.slug);
      }
      movies.push(movie);
    }
  }

  return movies;
}

/**
 * Get a single movie by its slug.
 * Fetches credits if not in cache.
 */
export async function getMovieBySlug(slug: string): Promise<Movie | null> {
  // Check cache first
  const cached = movieCache.get(slug);
  if (cached) {
    return cached;
  }

  // Extract TMDB ID from slug (format: ${id}-${title})
  const tmdbId = extractTmdbIdFromSlug(slug);
  if (!tmdbId) {
    console.error('[MovieRepository] Invalid slug format:', slug);
    return null;
  }

  return getMovieByTmdbId(tmdbId);
}

/**
 * Get a movie by TMDB ID.
 * Fetches movie details and credits.
 */
export async function getMovieByTmdbId(tmdbId: number): Promise<Movie | null> {
  // Check cache by TMDB ID
  const cachedSlug = tmdbIdToSlugCache.get(tmdbId);
  if (cachedSlug) {
    const cached = movieCache.get(cachedSlug);
    if (cached) {
      return cached;
    }
  }

  // Fetch movie and credits in parallel
  const [movieResult, creditsResult] = await Promise.all([
    dataSource.fetchMovieById(tmdbId),
    dataSource.fetchMovieCredits(tmdbId),
  ]);

  if (!movieResult.data || movieResult.error) {
    if (movieResult.error) {
      console.error('[MovieRepository] Error fetching movie:', movieResult.error);
    }
    return null;
  }

  const movie = mapTmdbMovieToMovie(movieResult.data, creditsResult.data || undefined);

  // Cache the result
  movieCache.set(movie.slug, movie);
  tmdbIdToSlugCache.set(tmdbId, movie.slug);

  return movie;
}

/**
 * Search movies by query.
 * Returns matching movies without caching (search results vary).
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  const result = await dataSource.searchMovies(query);

  if (!result.data) {
    return [];
  }

  return mapTmdbMoviesToMovies(result.data);
}

/**
 * Get similar movies to a given movie.
 */
export async function getSimilarMovies(tmdbId: number): Promise<Movie[]> {
  const result = await dataSource.fetchSimilarMovies(tmdbId);

  if (!result.data) {
    return [];
  }

  return mapTmdbMoviesToMovies(result.data);
}

/**
 * Get movie recommendations based on a given movie.
 */
export async function getMovieRecommendations(tmdbId: number): Promise<Movie[]> {
  const result = await dataSource.fetchMovieRecommendations(tmdbId);

  if (!result.data) {
    return [];
  }

  return mapTmdbMoviesToMovies(result.data);
}

/**
 * Get movie cast (actors) by TMDB ID.
 */
export async function getMovieCast(tmdbId: number): Promise<Person[]> {
  const result = await dataSource.fetchMovieCredits(tmdbId);

  if (!result.data || !result.data.cast) {
    return [];
  }

  return mapTmdbCastMembersToPeople(result.data.cast);
}

/**
 * Get movie crew (key crew members) by TMDB ID.
 */
export async function getMovieCrew(tmdbId: number): Promise<Person[]> {
  const result = await dataSource.fetchMovieCredits(tmdbId);

  if (!result.data || !result.data.crew) {
    return [];
  }

  return mapTmdbCrewMembersToPeople(result.data.crew);
}

/**
 * Get watch providers for a movie by TMDB ID.
 * Returns providers for US region by default.
 */
export async function getMovieWatchProviders(tmdbId: number): Promise<{
  flatrate?: { id: number; name: string; logoUrl: string }[];
  rent?: { id: number; name: string; logoUrl: string }[];
  buy?: { id: number; name: string; logoUrl: string }[];
} | null> {
  const result = await dataSource.fetchMovieWatchProviders(tmdbId);

  if (!result.data || !result.data.results) {
    return null;
  }

  // Get US providers (or return null if not available)
  const usProviders = result.data.results.US;
  if (!usProviders) {
    return null;
  }

  const { buildImageUrl } = await import('../tmdb/config.js');

  return {
    flatrate: usProviders.flatrate?.map(p => ({
      id: p.id,
      name: p.name,
      logoUrl: buildImageUrl(p.logo_path, 'w92'),
    })),
    rent: usProviders.rent?.map(p => ({
      id: p.id,
      name: p.name,
      logoUrl: buildImageUrl(p.logo_path, 'w92'),
    })),
    buy: usProviders.buy?.map(p => ({
      id: p.id,
      name: p.name,
      logoUrl: buildImageUrl(p.logo_path, 'w92'),
    })),
  };
}

/**
 * Get movie videos (trailers, teasers) by TMDB ID.
 */
export async function getMovieVideos(tmdbId: number): Promise<{
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}[]> {
  const result = await dataSource.fetchMovieVideos(tmdbId);

  if (!result.data || !result.data.results) {
    return [];
  }

  return result.data.results.map(v => ({
    id: v.id,
    key: v.key,
    name: v.name,
    site: v.site,
    type: v.type,
    official: v.official,
  }));
}

/**
 * Get movie images (posters, backdrops) by TMDB ID.
 */
export async function getMovieImages(tmdbId: number): Promise<{
  posters: { filePath: string; aspectRatio: number; width: number; height: number }[];
  backdrops: { filePath: string; aspectRatio: number; width: number; height: number }[];
}> {
  const result = await dataSource.fetchMovieImages(tmdbId);

  if (!result.data) {
    return { posters: [], backdrops: [] };
  }

  const { buildImageUrl } = await import('../tmdb/config.js');

  return {
    posters: result.data.posters.map(p => ({
      filePath: buildImageUrl(p.file_path, 'w500'),
      aspectRatio: p.aspect_ratio,
      width: p.width,
      height: p.height,
    })),
    backdrops: result.data.backdrops.map(b => ({
      filePath: buildImageUrl(b.file_path, 'w1280'),
      aspectRatio: b.aspect_ratio,
      width: b.width,
      height: b.height,
    })),
  };
}

/**
 * Get movie reviews by TMDB ID.
 */
export async function getMovieReviews(tmdbId: number): Promise<{
  id: string;
  author: string;
  content: string;
  url: string;
  createdAt: string;
}[]> {
  const result = await dataSource.fetchMovieReviews(tmdbId);

  if (!result.data || !result.data.results) {
    return [];
  }

  return result.data.results.map(r => ({
    id: r.id,
    author: r.author,
    content: r.content,
    url: r.url,
    createdAt: r.created_at,
  }));
}

/**
 * Get all movie genres.
 */
export async function getGenres(): Promise<Genre[]> {
  const result = await dataSource.fetchMovieGenres();

  if (!result.data || !result.data.genres) {
    return [];
  }

  return mapTmdbGenresToGenres(result.data.genres);
}

/**
 * Get movies by genre ID.
 */
export async function getMoviesByGenre(genreId: number, page: number = 1): Promise<Movie[]> {
  const result = await dataSource.fetchMoviesByGenre(genreId, page);

  if (!result.data) {
    return [];
  }

  return mapTmdbMoviesToMovies(result.data);
}

/**
 * Extract TMDB ID from a slug.
 * Slug format: ${tmdbId}-${slugified-title}[-year]
 * Example: 550-fight-club-1999 → 550
 */
function extractTmdbIdFromSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)-/);
  if (!match) {
    return null;
  }
  return parseInt(match[1], 10);
}

/**
 * Clear the movie cache.
 * Useful for testing or manual refresh.
 */
export function clearCache(): void {
  movieCache.clear();
  tmdbIdToSlugCache.clear();
}

/**
 * Get cache statistics.
 */
export function getCacheStats(): { movieCount: number; idCount: number } {
  return {
    movieCount: movieCache.size,
    idCount: tmdbIdToSlugCache.size,
  };
}