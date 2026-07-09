/**
 * Generic TMDB Data Source Base Class
 *
 * Provides reusable data source functionality for all TMDB-backed content types.
 * Use this class as a base for:
 * - MovieDataSource (already exists, can be refactored to extend this)
 * - SeriesDataSource
 * - PersonDataSource
 * - CollectionDataSource
 *
 * @template T - Raw TMDB response type
 * @template R - Paginated response type (for list endpoints)
 */

import { tmdbGet, isTmdbApiError, type TmdbApiError } from "../client.js";
import type { TmdbPaginatedResponse } from "../types.js";

export interface DataSourceResult<T> {
  data: T | null;
  error: Error | null;
  fromCache: boolean;
}

export interface RequestOptions {
  timeout?: number;
}

/**
 * Base class for TMDB data sources.
 *
 * @example
 * class SeriesDataSource extends TmdbDataSource<TmdbSeries, TmdbSearchSeries> {
 *   async fetchPopular(page: number) {
 *     return this.fetchPaginated('/tv/popular', page);
 *   }
 *
 *   async getById(id: number) {
 *     return this.fetchSingle(`/tv/${id}`);
 *   }
 * }
 */
export abstract class TmdbDataSource<T, R = T> {
  protected readonly sourceName: string;

  constructor(sourceName: string) {
    this.sourceName = sourceName;
  }

  /**
   * Fetch a single item from TMDB.
   * @param path TMDB API path (e.g., '/movie/550')
   */
  protected async fetchSingle(path: string): Promise<DataSourceResult<T>> {
    try {
      const data = await tmdbGet<T>(path);
      return {
        data,
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

      console.error(`[${this.sourceName}] Failed to fetch single:`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Unknown error"),
        fromCache: false,
      };
    }
  }

  /**
   * Fetch a paginated list from TMDB.
   * @param path TMDB API path (e.g., '/movie/popular')
   * @param page Page number (1-indexed)
   */
  protected async fetchPaginated(
    path: string,
    page: number = 1
  ): Promise<DataSourceResult<R[]>> {
    try {
      const response = await tmdbGet<TmdbPaginatedResponse<R>>(path, {
        params: { page },
      });
      return {
        data: response.results,
        error: null,
        fromCache: false,
      };
    } catch (error) {
      console.error(`[${this.sourceName}] Failed to fetch paginated:`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Unknown error"),
        fromCache: false,
      };
    }
  }

  /**
   * Fetch search results from TMDB.
   * @param path TMDB API search path (e.g., '/search/movie')
   * @param query Search query
   * @param page Page number (1-indexed)
   */
  protected async fetchSearch(
    path: string,
    query: string,
    page: number = 1
  ): Promise<DataSourceResult<R[]>> {
    try {
      const response = await tmdbGet<TmdbPaginatedResponse<R>>(path, {
        params: { query, page },
      });
      return {
        data: response.results,
        error: null,
        fromCache: false,
      };
    } catch (error) {
      console.error(`[${this.sourceName}] Failed to search:`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Unknown error"),
        fromCache: false,
      };
    }
  }

  /**
   * Handle API errors with consistent logging.
   */
  protected handleError(
    error: unknown,
    operation: string
  ): DataSourceResult<null> {
    if (isTmdbApiError(error)) {
      const tmdbError = error as TmdbApiError;
      if (tmdbError.status === 404) {
        return {
          data: null,
          error: null,
          fromCache: false,
        };
      }
      console.error(
        `[${this.sourceName}] ${operation}: TMDB ${tmdbError.status} - ${tmdbError.path}`
      );
    } else {
      console.error(`[${this.sourceName}] ${operation}:`, error);
    }

    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
      fromCache: false,
    };
  }
}