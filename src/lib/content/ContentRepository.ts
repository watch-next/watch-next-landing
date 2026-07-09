/**
 * Generic Content Repository Abstraction
 *
 * Provides a reusable pattern for content repositories.
 * Use this interface as a template for future content types:
 * - SeriesRepository
 * - PersonRepository
 * - GenreRepository
 * - CollectionRepository
 *
 * @template T - Domain model type (e.g., Movie, Series, Person)
 * @template I - Identifier type (usually string slug + number externalId)
 */

export interface ContentRepository<T, I extends { slug: string; externalId?: string }> {
  /**
   * Get a list of content items.
   */
  getList(page?: number): Promise<T[]>;

  /**
   * Get a single item by slug.
   */
  getBySlug(slug: string): Promise<T | null>;

  /**
   * Get a single item by external ID (e.g., TMDB ID).
   */
  getById(id: number): Promise<T | null>;

  /**
   * Search content by query.
   */
  search(query: string, page?: number): Promise<T[]>;

  /**
   * Clear the in-memory cache.
   */
  clearCache(): void;

  /**
   * Get cache statistics.
   */
  getCacheStats(): { count: number };
}

/**
 * Generic DataSource Result
 *
 * Allows distinguishing between "not found" and "error".
 * Already in use by movieDataSource - exported here for reuse.
 */
export interface DataSourceResult<T> {
  data: T | null;
  error: Error | null;
  fromCache: boolean;
}

/**
 * Generic DataSource interface
 *
 * Template for future data sources:
 * - SeriesDataSource
 * - PersonDataSource
 * - GenreDataSource
 * - CollectionDataSource
 *
 * @template T - Raw data type from the API/source
 */
export interface ContentDataSource<T> {
  /**
   * Fetch raw data from the source.
   * Returns null on error (graceful degradation).
   */
  fetch(): Promise<DataSourceResult<T>>;
}