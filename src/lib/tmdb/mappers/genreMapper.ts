/**
 * Genre Mapper
 *
 * Pure functions that transform TMDB genre responses into domain models.
 *
 * Responsibilities:
 * - Map TmdbGenre → Genre (domain model)
 * - No side effects, no external dependencies
 */

import type { TmdbGenre } from '../types';

/**
 * Domain model for Genre.
 */
export interface Genre {
  id: number;
  name: string;
  slug: string;
  movieCount?: number;
}

/**
 * Map a TMDB genre to the domain Genre model.
 * @param tmdbGenre Raw TMDB genre response
 * @param movieCount Optional movie count for this genre
 */
export function mapTmdbGenreToGenre(tmdbGenre: TmdbGenre, movieCount?: number): Genre {
  return {
    id: tmdbGenre.id,
    name: tmdbGenre.name,
    slug: slugifyGenre(tmdbGenre.name),
    movieCount,
  };
}

/**
 * Map a batch of TMDB genres to domain models.
 */
export function mapTmdbGenresToGenres(genres: TmdbGenre[]): Genre[] {
  return genres.map(genre => mapTmdbGenreToGenre(genre));
}

/**
 * Create a URL-safe slug from a genre name.
 */
function slugifyGenre(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}