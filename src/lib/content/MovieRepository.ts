/**
 * Movie Repository
 *
 * The single entry point for movie data access in the application.
 * Now uses the backend API exclusively (no direct TMDB calls).
 *
 * Responsibilities:
 * - Expose application methods (getMovies, getMovieByTmdbId, etc.)
 * - Normalize domain models
 * - Hide backend implementation details
 * - Slug ↔ TMDB ID resolution
 * - In-memory caching
 */

import * as api from "@/lib/api/movieDataSource";
import { mapTmdbMoviesToMovies } from "../tmdb/mappers/movieMapper";
import { mapTmdbCastMembersToPeople, mapTmdbCrewMembersToPeople, type Person } from "../tmdb/mappers/personMapper";
import { mapTmdbGenresToGenres, type Genre } from "../tmdb/mappers/genreMapper";
import type { Movie } from "./types";
import type { MovieDetail as BackendMovieDetail } from "@/services/movie.service";

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

  try {
    // Fetch from backend API
    const popularResponse = await api.fetchPopularMovies(1, 10);
    const topRatedResponse = await api.fetchTopRatedMovies(1, 10);

    const movies: Movie[] = [];

    // Process popular movies
    if (popularResponse.results) {
      const mapped = await mapTmdbMoviesToMovies(popularResponse.results);
      for (const movie of mapped) {
        movieCache.set(movie.slug, movie);
        if (movie.externalId) {
          tmdbIdToSlugCache.set(parseInt(movie.externalId, 10), movie.slug);
        }
        movies.push(movie);
      }
    }

    // Process top-rated movies (deduplicate by TMDB ID)
    if (topRatedResponse.results) {
      const existingIds = new Set(popularResponse.results?.map(m => m.id) ?? []);
      const uniqueTopRated = topRatedResponse.results.filter(m => !existingIds.has(m.id));

      const mapped = await mapTmdbMoviesToMovies(uniqueTopRated);
      for (const movie of mapped) {
        movieCache.set(movie.slug, movie);
        if (movie.externalId) {
          tmdbIdToSlugCache.set(parseInt(movie.externalId, 10), movie.slug);
        }
        movies.push(movie);
      }
    }

    return movies;
  } catch (error) {
    console.error('[MovieRepository] Failed to fetch movies from backend:', error);
    return [];
  }
}

/**
 * Get a movie by backend UUID.
 * Fetches full details including credits.
 */
export async function getMovieByUuid(uuid: string): Promise<Movie | null> {
  // Check cache first
  for (const [slug, cached] of movieCache.entries()) {
    if (slug.startsWith(uuid)) {
      return cached;
    }

  try {
    // Fetch movie details from backend using UUID
    const movieDetail: BackendMovieDetail = await api.fetchMovieDetails(uuid);

    // Map to domain model
    const movie: Movie = {
      id: crypto.randomUUID(),
      slug: `${uuid}-${movieDetail.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: movieDetail.title,
      originalTitle: movieDetail.original_title,
      overview: movieDetail.overview || '',
      poster: movieDetail.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetail.poster_path}` : null,
      backdrop: movieDetail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieDetail.backdrop_path}` : null,
      releaseDate: movieDetail.release_date,
      year: movieDetail.release_date ? new Date(movieDetail.release_date).getFullYear().toString() : undefined,
      runtimeMin: movieDetail.runtime_minutes || undefined,
      rating: movieDetail.vote_average || undefined,
      ratingCount: movieDetail.vote_count || undefined,
      genres: mapTmdbGenresToGenres(movieDetail.genres || []),
      externalId: String(movieDetail.tmdb_id),
      externalType: 'tmdb' as const,
      isAdult: false,
    };

    try {
      // Fetch credits from backend using UUID
      const credits = await api.fetchMovieCredits(uuid);
      movie.cast = mapTmdbCastMembersToPeople(credits.cast || []);
      movie.directors = mapTmdbCrewMembersToPeople(credits.crew?.filter(c => c.job === 'Director') || []);
      movie.writers = mapTmdbCrewMembersToPeople(credits.crew?.filter(c => c.job === 'Screenplay' || c.job === 'Writer') || []);
    } catch (e) {
      console.warn(`[MovieRepository] Failed to fetch credits for ${uuid}:`, e);
      movie.cast = [];
      movie.directors = [];
      movie.writers = [];
    }

    // Cache the movie
    movieCache.set(movie.slug, movie);

    return movie;
  } catch (error) {
    console.error(`[MovieRepository] Failed to fetch movie ${uuid}:`, error);
    return null;
  }
}

/**
 * Get similar movies.
 */
export async function getSimilarMovies(tmdbId: number): Promise<Movie[]> {
  try {
    const response = await api.fetchSimilarMovies(tmdbId, 1);
    if (!response.results) return [];

    const movies: Movie[] = [];
    for (const tmdbMovie of response.results.slice(0, 12)) {
      const movie: Movie = {
        id: crypto.randomUUID(),
        slug: `${tmdbMovie.id}-${tmdbMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: tmdbMovie.title,
        originalTitle: tmdbMovie.original_title,
        overview: tmdbMovie.overview,
        poster: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
        backdrop: null,
        releaseDate: tmdbMovie.release_date,
        year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear().toString() : undefined,
        runtimeMin: undefined,
        rating: tmdbMovie.vote_average,
        ratingCount: tmdbMovie.vote_count,
        genres: [],
        externalId: tmdbMovie.id.toString(),
        externalType: 'tmdb' as const,
        isAdult: tmdbMovie.adult,
      };
      movies.push(movie);
    }
    return movies;
  } catch (error) {
    console.error('[MovieRepository] Failed to fetch similar movies:', error);
    return [];
  }
}

/**
 * Get trailers/videos for a movie.
 */
export async function getMovieTrailers(tmdbId: number): Promise<Array<{
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}>> {
  try {
    const response = await api.fetchMovieVideos(tmdbId);
    return (response.results || []).map(v => ({
      id: v.id?.toString() || String(v.key),
      key: v.key,
      name: v.name,
      site: v.site,
      type: v.type,
    }));
  } catch (error) {
    console.error('[MovieRepository] Failed to fetch trailers:', error);
    return [];
  }
}

/**
 * Get watch providers for a movie.
 * Delegates to WatchProviderRepository.
 */
export async function getWatchProviders(tmdbId: number, region: string = 'US') {
  const { getProviders } = await import('../tmdb/repositories/WatchProviderRepository');
  return getProviders(tmdbId, region);
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
export function clearMovieCache(): void {
  movieCache.clear();
  tmdbIdToSlugCache.clear();
}