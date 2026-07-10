/**
 * TMDB Movie Mapper
 *
 * Pure functions that transform TMDB API responses into domain models.
 *
 * Responsibilities:
 * - Map TmdbMovie → Movie (domain model)
 * - Compose full image URLs from paths
 * - Extract directors and cast from credits
 * - Generate slugs from TMDB ID + title
 * - No side effects, no external dependencies
 */

import { slugify } from "../../content/slugify.js";
import { buildImageUrl } from "../config.js";
import type { Movie } from "../../content/types.js";
import type { TmdbMovie, TmdbMovieCredits, TmdbCrewMember, TmdbCastMember } from "../types.js";

/**
 * Extract director(s) from TMDB credits.
 * Returns array of director names for the Movie.directors field.
 */
function extractDirectorsArray(credits: TmdbMovieCredits): string[] {
  // Guard against missing crew array
  const crew = credits.crew ?? [];
  return crew
    .filter((member): member is TmdbCrewMember & { name: string } =>
      member.department === "Directing" &&
      member.job === "Director" &&
      !!member.name
    )
    .map(m => m.name);
}

/**
 * Extract main cast from TMDB credits.
 * Returns array of names (top 5 billed) for Movie.cast field.
 */
function extractCastArray(credits: TmdbMovieCredits): string[] {
  return credits.cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 5)
    .filter((member): member is TmdbCastMember & { name: string } => !!member.name)
    .map(m => m.name);
}

/**
 * Extract genre names from TMDB movie.
 * Uses the cached genre map from GenreRepository to resolve IDs to names.
 */
import { ensureGenres, getGenreName } from "../repositories/GenreRepository.js";

async function extractGenres(movie: TmdbMovie): Promise<string[]> {
  // TMDB list endpoints provide `genres` as an array of objects with a `name` field.
  // Detail endpoints provide `genre_ids` as an array of numeric IDs.
  // We support both formats safely.
  if (movie.genres && Array.isArray(movie.genres) && movie.genres.length) {
    return movie.genres.map(g => g.name);
  }
  if (Array.isArray((movie as any).genre_ids)) {
    // Ensure genre cache is loaded, then resolve IDs to names
    await ensureGenres();
    return (movie as any).genre_ids
      .map((id: number) => getGenreName(id))
      .filter((name): name is string => name !== undefined);
  }
  return [];
}

/**
 * Build a unique slug from TMDB movie.
 * Format: ${tmdbId}-${slugified-title}
 * Example: 550-fight-club-1999
 */
function buildSlug(movie: TmdbMovie): string {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const titleSlug = slugify(movie.title);

  if (year) {
    return `${movie.id}-${titleSlug}-${year}`;
  }

  return `${movie.id}-${titleSlug}`;
}

/**
 * Map a TMDB movie to the domain Movie model.
 * @param movie Raw TMDB movie response
 * @param credits Optional credits (cast/crew) - pass if available
 * @returns Domain Movie object
 */
export async function mapTmdbMovieToMovie(
  movie: TmdbMovie,
  credits?: TmdbMovieCredits
): Promise<Movie> {
  console.log('[Mapper] input', {
    id: movie.id,
    tmdbId: movie.id,
    title: movie.title,
    slug: undefined,
    cover: movie.poster_path,
    backdrop: movie.backdrop_path
  });
  const slug = buildSlug(movie);
  const genres = await extractGenres(movie);

  console.log('[Mapper] output', {
    id: slug,
    tmdbId: movie.id,
    title: movie.title,
    slug,
    cover: buildImageUrl(movie.poster_path, "w500"),
    backdrop: buildImageUrl(movie.backdrop_path, "w1280")
  });
  return {
    // Core ContentItem fields
    slug,
    category: 'Movie' as const,
    title: movie.title,
    description: movie.overview || '',
    cover: buildImageUrl(movie.poster_path, "w500"),
    content: '',  // TMDB has no Markdown content
    tags: genres,
    date: movie.release_date ? new Date(movie.release_date).toISOString() : new Date().toISOString(),

    // Movie-specific required fields
    releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    duration: movie.runtime ?? 0,
    rating: movie.vote_average,

    // IDs
    tmdbId: movie.id,
    externalId: String(movie.id),

    // Extended fields
    originalTitle: movie.original_title,
    originalLanguage: movie.original_language,
    tagline: movie.tagline,
    homepage: movie.homepage,
    status: movie.status,
    budget: movie.budget ?? 0,
    revenue: movie.revenue ?? 0,
    popularity: movie.popularity,
    voteCount: movie.vote_count,
    adult: movie.adult,
    video: movie.video,
    releaseDate: movie.release_date,
    backdrop: buildImageUrl(movie.backdrop_path, "w1280"),

    // Credits as arrays
    directors: credits ? extractDirectorsArray(credits) : [],
    cast: credits ? extractCastArray(credits) : [],

    // Collections
    belongsToCollection: movie.belongs_to_collection
      ? {
          id: movie.belongs_to_collection.id,
          name: movie.belongs_to_collection.name,
        }
      : undefined,

    // Production info
    productionCompanies: (movie.production_companies ?? []).map(c => ({
      id: c.id,
      name: c.name,
      logoPath: c.logo_path ? buildImageUrl(c.logo_path, "w500") : undefined,
      originCountry: c.origin_country,
    })),
    productionCountries: (movie.production_countries ?? []).map(c => ({
      iso: c.iso_3166_1,
      name: c.name,
    })),
    spokenLanguages: (movie.spoken_languages ?? []).map(l => ({
      iso: l.iso_639_1,
      englishName: l.english_name,
      name: l.name,
    })),
  };
}

/**
 * Map a batch of TMDB movies to domain models.
 * Does not fetch credits (requires separate API call per movie).
 */
export async function mapTmdbMoviesToMovies(movies: TmdbMovie[]): Promise<Movie[]> {
  return await Promise.all(movies.map(movie => mapTmdbMovieToMovie(movie)));
}