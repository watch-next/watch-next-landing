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
 * Returns comma-separated names for the Movie.director field.
 */
function extractDirectors(credits: TmdbMovieCredits): string {
  // Guard against missing crew array
  const crew = credits.crew ?? [];
  const directors = crew
    .filter((member): member is TmdbCrewMember & { name: string } =>
      member.department === "Directing" &&
      member.job === "Director" &&
      !!member.name
    )
    .map(m => m.name);

  return directors.join(", ");
}

/**
 * Extract main cast from TMDB credits.
 * Returns comma-separated names (top 5 billed).
 */
function extractCast(credits: TmdbMovieCredits): string {
  return credits.cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 5)
    .filter((member): member is TmdbCastMember & { name: string } => !!member.name)
    .map(m => m.name)
    .join(", ");
}

/**
 * Extract genre names from TMDB movie.
 */
function extractGenres(movie: TmdbMovie): string[] {
  // TMDB list endpoints provide `genres` as an array of objects with a `name` field.
  // Detail endpoints provide `genre_ids` as an array of numeric IDs.
  // We support both formats safely.
  if (movie.genres && Array.isArray(movie.genres) && movie.genres.length) {
    return movie.genres.map(g => g.name);
  }
  if (Array.isArray((movie as any).genre_ids)) {
    // Fallback to IDs – map to strings (could be resolved to names via a repository elsewhere).
    return (movie as any).genre_ids.map((id: number) => String(id));
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
export function mapTmdbMovieToMovie(
  movie: TmdbMovie,
  credits?: TmdbMovieCredits
): Movie {
  const slug = buildSlug(movie);
  const genres = extractGenres(movie);

  return {
    // Core fields
    id: slug, // Use slug as internal ID
    slug,
    title: movie.title,
    originalTitle: movie.original_title,
    description: movie.overview,
    content: undefined, // TMDB has no Markdown content
    cover: buildImageUrl(movie.poster_path, "w500"),
    backdrop: buildImageUrl(movie.backdrop_path, "w1280"),
    tags: genres,
    rating: movie.vote_average,
    releaseDate: movie.release_date,
    externalId: String(movie.id), // TMDB ID as external reference

    // Extended fields from TMDB
    runtime: movie.runtime ?? undefined,
    tagline: movie.tagline ?? undefined,
    budget: movie.budget ?? 0,
    revenue: movie.revenue ?? 0,
    status: movie.status,
    homepage: movie.homepage || undefined,
    originalLanguage: movie.original_language,
    popularity: movie.popularity,
    voteCount: movie.vote_count,
    adult: movie.adult,
    video: movie.video,

    // Credits (if available)
    director: credits ? extractDirectors(credits) : undefined,
    cast: credits ? extractCast(credits) : undefined,

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

    // Type guard discriminator
    __type: "movie",
  };
}

/**
 * Map a batch of TMDB movies to domain models.
 * Does not fetch credits (requires separate API call per movie).
 */
export function mapTmdbMoviesToMovies(movies: TmdbMovie[]): Movie[] {
  return movies.map(movie => mapTmdbMovieToMovie(movie));
}