/**
 * TMDB Movie Data Source
 *
 * Isolates external data source communication.
 * Communicates with MovieService and prepares for future caching.
 *
 * Responsibilities:
 * - Call MovieService endpoints
 * - Handle data source errors
 * - Prepare caching layer (future)
 * - Return raw TMDB data or null on error
 */

import * as movieService from "../services/movieService.js";
import { isTmdbApiError } from "../client.js";
import type {
  TmdbMovie,
  TmdbMovieCredits,
  TmdbPaginatedResponse,
  TmdbWatchProvider,
  TmdbVideo,
  TmdbImage,
  TmdbReview,
  TmdbGenre,
} from "../types.js";

/**
 * Result wrapper for data source operations.
 * Allows distinguishing between "not found" and "error".
 */
export interface DataSourceResult<T> {
  data: T | null;
  error: Error | null;
  fromCache: boolean;
}

/**
 * Fetch popular movies.
 * Returns empty array on error (graceful degradation).
 */
export async function fetchPopularMovies(
  page: number = 1
): Promise<DataSourceResult<TmdbMovie[]>> {
  try {
    const response = await movieService.getPopularMovies(page);
    return {
      data: response.results,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch popular movies:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch top-rated movies.
 */
export async function fetchTopRatedMovies(
  page: number = 1
): Promise<DataSourceResult<TmdbMovie[]>> {
  try {
    const response = await movieService.getTopRatedMovies(page);
    return {
      data: response.results,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch top-rated movies:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch a movie by TMDB ID.
 */
export async function fetchMovieById(
  tmdbId: number
): Promise<DataSourceResult<TmdbMovie>> {
  try {
    const movie = await movieService.getMovieById(tmdbId);
    return {
      data: movie,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    if (isTmdbApiError(error) && error.status === 404) {
      return {
        data: null,
        error: null, // 404 is not an error, just "not found"
        fromCache: false,
      };
    }
    console.error("[MovieDataSource] Failed to fetch movie by ID:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch movie credits by TMDB ID.
 */
export async function fetchMovieCredits(
  tmdbId: number
): Promise<DataSourceResult<TmdbMovieCredits>> {
  try {
    const credits = await movieService.getMovieCredits(tmdbId);
    return {
      data: credits,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch movie credits:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch similar movies.
 */
export async function fetchSimilarMovies(
  tmdbId: number,
  page: number = 1
): Promise<DataSourceResult<TmdbMovie[]>> {
  try {
    const response = await movieService.getSimilarMovies(tmdbId, page);
    return {
      data: response.results,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch similar movies:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Search movies by query.
 */
export async function searchMovies(
  query: string,
  page: number = 1
): Promise<DataSourceResult<TmdbMovie[]>> {
  try {
    const response = await movieService.searchMovie(query, page);
    return {
      data: response.results,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to search movies:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch movie recommendations.
 */
export async function fetchMovieRecommendations(
  tmdbId: number,
  page: number = 1
): Promise<DataSourceResult<TmdbMovie[]>> {
  try {
    const response = await movieService.getMovieRecommendations(tmdbId, page);
    return {
      data: response.results,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch movie recommendations:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch movie watch providers.
 */
export async function fetchMovieWatchProviders(
  tmdbId: number
): Promise<DataSourceResult<{ id: number; results?: Record<string, TmdbWatchProvider> }>> {
  try {
    const response = await movieService.getMovieWatchProviders(tmdbId);
    return {
      data: response,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch movie watch providers:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch movie videos.
 */
export async function fetchMovieVideos(
  tmdbId: number
): Promise<DataSourceResult<{ id: number; results: TmdbVideo[] }>> {
  try {
    const response = await movieService.getMovieVideos(tmdbId);
    return {
      data: response,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch movie videos:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch movie images.
 */
export async function fetchMovieImages(
  tmdbId: number
): Promise<DataSourceResult<{ id: number; backdrops: TmdbImage[]; logos: TmdbImage[]; posters: TmdbImage[] }>> {
  try {
    const response = await movieService.getMovieImages(tmdbId);
    return {
      data: response,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch movie images:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch movie reviews.
 */
export async function fetchMovieReviews(
  tmdbId: number,
  page: number = 1
): Promise<DataSourceResult<TmdbPaginatedResponse<TmdbReview>>> {
  try {
    const response = await movieService.getMovieReviews(tmdbId, page);
    return {
      data: response,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch movie reviews:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch movie genres.
 */
export async function fetchMovieGenres(
): Promise<DataSourceResult<{ genres: TmdbGenre[] }>> {
  try {
    const response = await movieService.getMovieGenres();
    return {
      data: response,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch movie genres:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}

/**
 * Fetch movies by genre.
 */
export async function fetchMoviesByGenre(
  genreId: number,
  page: number = 1
): Promise<DataSourceResult<TmdbMovie[]>> {
  try {
    const response = await movieService.getMoviesByGenre(genreId, page);
    return {
      data: response.results,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("[MovieDataSource] Failed to fetch movies by genre:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}