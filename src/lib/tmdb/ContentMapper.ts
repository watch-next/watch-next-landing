/**
 * Generic Content Mapper Abstraction
 *
 * Provides reusable patterns for mapping raw API responses to domain models.
 * Use these patterns for future content types:
 * - SeriesMapper (Series → Domain)
 * - PersonMapper (Already exists)
 * - GenreMapper (Already exists)
 * - CollectionMapper (Collection → Domain)
 *
 * @template T - Domain model type
 * @template R - Raw API response type
 */

/**
 * Base mapper interface.
 *
 * @example
 * interface PersonMapper {
 *   mapToDomain: (tmdbPerson: TmdbPerson) => Person;
 *   mapToDomainArray: (items: TmdbPerson[]) => Person[];
 * }
 */
export interface ContentMapper<T, R> {
  /**
   * Map a single raw item to domain model.
   */
  mapToDomain: (raw: R) => T;

  /**
   * Map an array of raw items to domain models.
   */
  mapToDomainArray: (items: R[]) => T[];
}

/**
 * Create a batch mapper from a single-item mapper.
 *
 * @param mapSingle - Function to map a single item
 * @returns Object with mapSingle and mapMany functions
 *
 * @example
 * const personMapper = createBatchMapper(
 *   (tmdbPerson) => ({
 *     id: tmdbPerson.id,
 *     name: tmdbPerson.name,
 *     // ... more fields
 *   })
 * );
 */
export function createBatchMapper<T, R>(
  mapSingle: (raw: R) => T
): {
  mapSingle: (raw: R) => T;
  mapMany: (items: R[]) => T[];
} {
  return {
    mapSingle,
    mapMany: (items: R[]) => items.map(mapSingle),
  };
}

/**
 * Compose multiple mappers.
 * Useful when a domain model needs data from multiple sources.
 *
 * @example
 * const movieWithCreditsMapper = composeMappers(
 *   mapTmdbMovieToMovie,
 *   mapTmdbCreditsToMovieCredits
 * );
 */
export function composeMappers<T, R1, R2>(
  mapper1: (raw1: R1) => Partial<T>,
  mapper2: (raw2: R2) => Partial<T>
): (raw1: R1, raw2: R2) => T {
  return (raw1: R1, raw2: R2): T => {
    const partial1 = mapper1(raw1);
    const partial2 = mapper2(raw2);
    return { ...partial1, ...partial2 } as T;
  };
}