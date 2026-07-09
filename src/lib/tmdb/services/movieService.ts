/**
 * TMDB Movie Service
 *
 * Defines TMDB API endpoints and executes requests.
 * Returns raw TMDB-shaped responses - no domain mapping.
 *
 * Responsibilities:
 * - Endpoint path definitions
 * - Request execution via tmdbGet
 * - No business logic or domain transformation
 */

import { tmdbGet } from "../client.js";
import type {
  TmdbMovie,
  TmdbMovieCredits,
  TmdbPaginatedResponse,
  TmdbSearchMovie,
  TmdbGenre,
  TmdbWatchProvider,
  TmdbVideo,
  TmdbImage,
  TmdbReview,
  TmdbBelongsToCollection,
} from "../types.js";

// ============================================================================
// Movie Lists
// ============================================================================

/**
 * Fetch popular movies from TMDB.
 * @param page Page number (1-indexed)
 */
export async function getPopularMovies(page: number = 1) {
  return tmdbGet<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/popular",
    { params: { page } }
  );
}

/**
 * Fetch top-rated movies from TMDB.
 * @param page Page number (1-indexed)
 */
export async function getTopRatedMovies(page: number = 1) {
  return tmdbGet<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/top_rated",
    { params: { page } }
  );
}

/**
 * Fetch upcoming movies from TMDB.
 * @param page Page number (1-indexed)
 */
export async function getUpcomingMovies(page: number = 1) {
  return tmdbGet<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/upcoming",
    { params: { page } }
  );
}

/**
 * Fetch now playing movies from TMDB.
 * @param page Page number (1-indexed)
 */
export async function getNowPlayingMovies(page: number = 1) {
  return tmdbGet<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/now_playing",
    { params: { page } }
  );
}

// ============================================================================
// Single Movie
// ============================================================================

/**
 * Fetch a single movie by TMDB ID.
 * @param tmdbId TMDB movie ID
 */
export async function getMovieById(tmdbId: number) {
  return tmdbGet<TmdbMovie>(`/movie/${tmdbId}`);
}

/**
 * Fetch movie credits (cast and crew) by TMDB ID.
 * @param tmdbId TMDB movie ID
 */
export async function getMovieCredits(tmdbId: number) {
  return tmdbGet<TmdbMovieCredits>(`/movie/${tmdbId}/credits`);
}

/**
 * Fetch similar movies by TMDB ID.
 * @param tmdbId TMDB movie ID
 * @param page Page number (1-indexed)
 */
export async function getSimilarMovies(tmdbId: number, page: number = 1) {
  return tmdbGet<TmdbPaginatedResponse<TmdbMovie>>(
    `/movie/${tmdbId}/similar`,
    { params: { page } }
  );
}

/**
 * Fetch movie recommendations by TMDB ID.
 * @param tmdbId TMDB movie ID
 * @param page Page number (1-indexed)
 */
export async function getMovieRecommendations(tmdbId: number, page: number = 1) {
  return tmdbGet<TmdbPaginatedResponse<TmdbMovie>>(
    `/movie/${tmdbId}/recommendations`,
    { params: { page } }
  );
}

// ============================================================================
// Movie Extras
// ============================================================================

/**
 * Fetch movie watch providers by TMDB ID.
 * @param tmdbId TMDB movie ID
 */
export async function getMovieWatchProviders(tmdbId: number) {
  return tmdbGet<{
    id: number;
    results?: {
      AR?: TmdbWatchProvider;
      AT?: TmdbWatchProvider;
      AU?: TmdbWatchProvider;
      BE?: TmdbWatchProvider;
      BR?: TmdbWatchProvider;
      CA?: TmdbWatchProvider;
      CH?: TmdbWatchProvider;
      CL?: TmdbWatchProvider;
      CO?: TmdbWatchProvider;
      CZ?: TmdbWatchProvider;
      DE?: TmdbWatchProvider;
      DK?: TmdbWatchProvider;
      EC?: TmdbWatchProvider;
      EE?: TmdbWatchProvider;
      ES?: TmdbWatchProvider;
      FI?: TmdbWatchProvider;
      FR?: TmdbWatchProvider;
      GB?: TmdbWatchProvider;
      GR?: TmdbWatchProvider;
      HU?: TmdbWatchProvider;
      ID?: TmdbWatchProvider;
      IE?: TmdbWatchProvider;
      IN?: TmdbWatchProvider;
      IT?: TmdbWatchProvider;
      JP?: TmdbWatchProvider;
      KR?: TmdbWatchProvider;
      LT?: TmdbWatchProvider;
      LV?: TmdbWatchProvider;
      MX?: TmdbWatchProvider;
      MY?: TmdbWatchProvider;
      NL?: TmdbWatchProvider;
      NO?: TmdbWatchProvider;
      NZ?: TmdbWatchProvider;
      PE?: TmdbWatchProvider;
      PH?: TmdbWatchProvider;
      PL?: TmdbWatchProvider;
      PT?: TmdbWatchProvider;
      RO?: TmdbWatchProvider;
      RU?: TmdbWatchProvider;
      SE?: TmdbWatchProvider;
      SG?: TmdbWatchProvider;
      TH?: TmdbWatchProvider;
      TR?: TmdbWatchProvider;
      US?: TmdbWatchProvider;
      VE?: TmdbWatchProvider;
      ZA?: TmdbWatchProvider;
    };
  }>(`/movie/${tmdbId}/watch/providers`);
}

/**
 * Fetch movie videos (trailers, teasers, etc.) by TMDB ID.
 * @param tmdbId TMDB movie ID
 */
export async function getMovieVideos(tmdbId: number) {
  return tmdbGet<{
    id: number;
    results: TmdbVideo[];
  }>(`/movie/${tmdbId}/videos`);
}

/**
 * Fetch movie images (posters, backdrops, logos) by TMDB ID.
 * @param tmdbId TMDB movie ID
 */
export async function getMovieImages(tmdbId: number) {
  return tmdbGet<{
    id: number;
    backdrops: TmdbImage[];
    logos: TmdbImage[];
    posters: TmdbImage[];
  }>(`/movie/${tmdbId}/images`);
}

/**
 * Fetch movie reviews by TMDB ID.
 * @param tmdbId TMDB movie ID
 * @param page Page number (1-indexed)
 */
export async function getMovieReviews(tmdbId: number, page: number = 1) {
  return tmdbGet<TmdbPaginatedResponse<TmdbReview>>(
    `/movie/${tmdbId}/reviews`,
    { params: { page } }
  );
}

/**
 * Fetch movie external IDs by TMDB ID.
 * @param tmdbId TMDB movie ID
 */
export async function getMovieExternalIds(tmdbId: number) {
  return tmdbGet<{
    id: number;
    imdb_id: string | null;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
    wikidata_id: string | null;
  }>(`/movie/${tmdbId}/external_ids`);
}

// ============================================================================
// Search
// ============================================================================

/**
 * Search movies by query.
 * @param query Search query
 * @param page Page number (1-indexed)
 */
export async function searchMovie(query: string, page: number = 1) {
  return tmdbGet<TmdbPaginatedResponse<TmdbSearchMovie>>(
    "/search/movie",
    { params: { query, page } }
  );
}

// ============================================================================
// Genres
// ============================================================================

/**
 * Fetch all movie genres.
 */
export async function getMovieGenres() {
  return tmdbGet<{
    genres: TmdbGenre[];
  }>("/genre/movie/list");
}

/**
 * Fetch movies by genre.
 * @param genreId TMDB genre ID
 * @param page Page number (1-indexed)
 */
export async function getMoviesByGenre(genreId: number, page: number = 1) {
  return tmdbGet<TmdbPaginatedResponse<TmdbMovie>>(
    "/discover/movie",
    { params: { with_genres: genreId, page } }
  );
}

// ============================================================================
// Collections
// ============================================================================

/**
 * Fetch collection details by TMDB ID.
 * @param collectionId TMDB collection ID
 */
export async function getCollection(collectionId: number) {
  return tmdbGet<TmdbBelongsToCollection & {
    parts: TmdbMovie[];
  }>(`/collection/${collectionId}`);
}