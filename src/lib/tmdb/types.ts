/**
 * TMDB API Response Types
 *
 * These types represent the raw shapes returned by the TMDB API.
 * They are distinct from domain models (Movie, Person, etc.) which
 * are normalized for application use.
 *
 * @see https://developer.themoviedb.org/reference
 */

// ============================================================================
// Common Types
// ============================================================================

export interface TmdbImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TmdbProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

// ============================================================================
// Movie Types
// ============================================================================

export interface TmdbMovie {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: TmdbBelongsToCollection | null;
  budget: number;
  genres: TmdbGenre[];
  homepage: string;
  id: number | string;  // TMDB ID (number) or backend UUID (string)
  tmdb_id?: number;     // Original TMDB ID when response comes from backend API
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: TmdbSpokenLanguage[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TmdbBelongsToCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

// ============================================================================
// Movie Credits Types
// ============================================================================

export interface TmdbMovieCredits {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbCastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface TmdbCrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

// ============================================================================
// Paginated Response Types
// ============================================================================

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// ============================================================================
// Image Configuration
// ============================================================================

export interface TmdbImageConfiguration {
  base_url: string;
  secure_base_url: string;
  backdrop_sizes: string[];
  logo_sizes: string[];
  poster_sizes: string[];
  profile_sizes: string[];
  still_sizes: string[];
}

export interface TmdbConfiguration {
  images: TmdbImageConfiguration;
  change_keys: string[];
}

// ============================================================================
// Search Types
// ============================================================================

export interface TmdbSearchMovie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

// ============================================================================
// Watch Providers
// ============================================================================

export interface TmdbWatchProvider {
  link?: string;
  flatrate?: {
    id: number;
    logo_path: string;
    name: string;
    display_priority?: number;
  }[];
  rent?: {
    id: number;
    logo_path: string;
    name: string;
    display_priority?: number;
  }[];
  buy?: {
    id: number;
    logo_path: string;
    name: string;
    display_priority?: number;
  }[];
}

// ============================================================================
// Videos
// ============================================================================

export interface TmdbVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: string;
  type: string;
}

// ============================================================================
// Reviews
// ============================================================================

export interface TmdbReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}