/**
 * Backend API Data Source for Movies
 *
 * This module adapts backend API calls to the expected movie data format.
 * The backend handles all TMDB communication, caching, and fallback logic.
 *
 * All methods return data in the same format as the original TMDB data source
 * to maintain compatibility with existing mappers and repositories.
 */

import { httpClient } from '@/lib/http/client';
import type {
  MovieDetail,
  MoviesListResponse,
  MovieVideosResponse,
  MovieCreditsResponse,
  SimilarMoviesResponse,
  MovieProvidersResponse,
} from '../types';

/**
 * Backend API response types (matching our FastAPI schemas)
 */
interface BackendMovie {
  id: string; // Backend UUID
  tmdb_id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  runtime_minutes?: number;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  adult?: boolean;
  video?: boolean;
  genres?: Array<{ id: number; name: string }>;
  genres_list?: string;
  provider_names?: string;
  status?: string;
  tagline?: string;
  homepage?: string;
  budget?: number;
  revenue?: number;
}

/** Backend genre type for GenreRepository */
export interface BackendGenre {
  id: number;
  name: string;
}

interface BackendMoviesList {
  data: BackendMovie[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface BackendCredit {
  id: string;
  tmdb_id: number;
  name: string;
  character?: string;
  order?: number;
  profile_path?: string;
  job?: string;
  department?: string;
}

interface BackendVideo {
  id: string;
  tmdb_id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  size?: number;
  official?: boolean;
}

interface BackendProvider {
  id: string;
  tmdb_id: number;
  name: string;
  logo_path?: string;
  display_priority?: number;
  type: string;
}

/**
 * Map backend movie response to TMDB-compatible format
 */
function mapMovieToTMDBFormat(movie: BackendMovie): MovieDetail {
  return {
    id: movie.id, // Backend UUID
    tmdb_id: movie.tmdb_id,
    title: movie.title,
    original_title: movie.original_title || movie.title,
    overview: movie.overview || '',
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path || null,
    release_date: movie.release_date || '',
    runtime_minutes: movie.runtime_minutes || 0,
    vote_average: movie.vote_average || 0,
    vote_count: movie.vote_count || 0,
    popularity: movie.popularity || 0,
    adult: movie.adult || false,
    video: movie.video || false,
    genre_ids: movie.genres?.map((g) => g.id) || [],
    genres: movie.genres || [],
    status: movie.status || '',
    tagline: movie.tagline || null,
    homepage: movie.homepage || null,
    budget: movie.budget || null,
    revenue: movie.revenue || null,
  } as MovieDetail;
}

/**
 * Map backend list response to TMDB-compatible format
 */
function mapMoviesListToTMDBFormat(
  response: BackendMoviesList
): MoviesListResponse {
  return {
    page: response.page,
    results: response.data.map(mapMovieToTMDBFormat),
    total_pages: response.total_pages,
    total_results: response.total,
  };
}

/**
 * Get popular movies from backend.
 */
export async function fetchPopularMovies(
  page = 1,
  pageSize = 20
): Promise<MoviesListResponse> {
  const response = await httpClient.get<BackendMoviesList>('/movies/popular', {
    params: { page, page_size: pageSize },
  });
  return mapMoviesListToTMDBFormat(response.data);
}

/**
 * Get top-rated movies from backend.
 */
export async function fetchTopRatedMovies(
  page = 1,
  pageSize = 20
): Promise<MoviesListResponse> {
  const response = await httpClient.get<BackendMoviesList>('/movies/top-rated', {
    params: { page, page_size: pageSize },
  });
  return mapMoviesListToTMDBFormat(response.data);
}

/**
 * Get trending movies from backend.
 */
export async function fetchTrendingMovies(
  timeWindow: 'day' | 'week' = 'week',
  page = 1,
  pageSize = 20
): Promise<MoviesListResponse> {
  const response = await httpClient.get<BackendMoviesList>('/movies/trending', {
    params: { time_window: timeWindow, page, page_size: pageSize },
  });
  return mapMoviesListToTMDBFormat(response.data);
}

/**
 * Get upcoming movies from backend.
 */
export async function fetchUpcomingMovies(
  page = 1,
  pageSize = 20
): Promise<MoviesListResponse> {
  const response = await httpClient.get<BackendMoviesList>('/movies/upcoming', {
    params: { page, page_size: pageSize },
  });
  return mapMoviesListToTMDBFormat(response.data);
}

/**
 * Get now playing movies from backend.
 */
export async function fetchNowPlayingMovies(
  page = 1,
  pageSize = 20
): Promise<MoviesListResponse> {
  const response = await httpClient.get<BackendMoviesList>('/movies/now-playing', {
    params: { page, page_size: pageSize },
  });
  return mapMoviesListToTMDBFormat(response.data);
}

/**
 * Get movie details by backend UUID.
 */
export async function fetchMovieDetails(movieId: string): Promise<MovieDetail> {
  const response = await httpClient.get<{ success: boolean; data: BackendMovie }>(`/movies/${movieId}`);
  return mapMovieToTMDBFormat(response.data.data);
}

/**
 * Get movie credits by backend UUID.
 */
export async function fetchMovieCredits(
  movieId: string
): Promise<MovieCreditsResponse> {
  const response = await httpClient.get<{
    success: boolean;
    data: {
      cast: BackendCredit[];
      crew: BackendCredit[];
    };
  }>(`/movies/${movieId}/credits`);

  return {
    cast: response.data.data.cast.map((c) => ({
      id: c.tmdb_id,
      name: c.name,
      character: c.character || '',
      order: c.order || 0,
      profile_path: c.profile_path || null,
    })),
    crew: response.data.data.crew.map((c) => ({
      id: c.tmdb_id,
      name: c.name,
      job: c.job || '',
      department: c.department || '',
      profile_path: c.profile_path || null,
    })),
  };
}

/**
 * Get movie videos by TMDB ID.
 */
export async function fetchMovieVideos(
  tmdbId: number
): Promise<MovieVideosResponse> {
  const response = await httpClient.get<BackendVideo[]>(
    `/movies/${tmdbId}/videos`
  );

  return {
    results: response.data.map((v) => ({
      id: v.tmdb_id,
      key: v.key,
      name: v.name,
      site: v.site,
      type: v.type,
      size: v.size || 360,
      official: v.official || false,
    })),
  };
}

/**
 * Get similar movies by TMDB ID.
 */
export async function fetchSimilarMovies(
  tmdbId: number,
  page = 1
): Promise<SimilarMoviesResponse> {
  const response = await httpClient.get<BackendMoviesList>(
    `/movies/${tmdbId}/similar`,
    { params: { page } }
  );

  return {
    page: response.data.page,
    results: response.data.items.map(mapMovieToTMDBFormat),
    total_pages: response.data.total_pages,
    total_results: response.data.total,
  };
}

/**
 * Get movie watch providers by TMDB ID.
 */
export async function fetchMovieWatchProviders(
  tmdbId: number
): Promise<MovieProvidersResponse> {
  const response = await httpClient.get<BackendProvider[]>(
    `/movies/${tmdbId}/providers`
  );

  // Group providers by type (flatrate, rent, buy, free)
  const results: Record<string, BackendProvider[]> = {};

  response.data.forEach((provider) => {
    const type = provider.type || 'flatrate';
    if (!results[type]) {
      results[type] = [];
    }
    results[type].push(provider);
  });

  return {
    id: tmdbId,
    results,
  };
}

/**
 * Search movies via backend.
 */
export async function searchMovies(
  query: string,
  page = 1,
  year?: number
): Promise<MoviesListResponse> {
  const response = await httpClient.get<BackendMoviesList>('/search', {
    params: { q: query, type: 'movie', page, year },
  });

  return mapMoviesListToTMDBFormat(response.data);
}

/**
 * Get all movies (paginated) from backend.
 */
export async function fetchAllMovies(
  page = 1,
  pageSize = 20
): Promise<MoviesListResponse> {
  const response = await httpClient.get<BackendMoviesList>('/movies', {
    params: { page, page_size: pageSize },
  });
  return mapMoviesListToTMDBFormat(response.data);
}