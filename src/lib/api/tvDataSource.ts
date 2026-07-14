/**
 * Backend API Data Source for TV Shows
 *
 * This module adapts backend API calls to the expected TV show data format.
 */

import { httpClient } from '@/lib/http/client';
import type { TVShowDetail, TVShowsListResponse, SeasonDetail, Episode } from '../tmdb/types';

/**
 * Backend API response types
 */
interface BackendTVShow {
  id: string;
  tmdb_id: number;
  name: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date?: string;
  last_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  status?: string;
  tagline?: string;
  homepage?: string;
  in_production?: boolean;
  genres?: Array<{ id: number; name: string }>;
}

interface BackendTVList {
  items: BackendTVShow[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface BackendEpisode {
  id: string;
  episode_number: number;
  name: string;
  overview?: string;
  air_date?: string;
  still_path?: string;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
  season_number?: number;
}

interface BackendSeason {
  id: string;
  season_number: number;
  name: string;
  overview?: string;
  air_date?: string;
  poster_path?: string;
  episode_count: number;
  episodes: BackendEpisode[];
}

/**
 * Map backend TV show to TMDB-compatible format
 */
function mapTVShowToTMDBFormat(show: BackendTVShow): TVShowDetail {
  return {
    id: show.tmdb_id,
    name: show.name,
    original_name: show.original_name || show.name,
    overview: show.overview || '',
    poster_path: show.poster_path || null,
    backdrop_path: show.backdrop_path || null,
    first_air_date: show.first_air_date || '',
    last_air_date: show.last_air_date || '',
    number_of_seasons: show.number_of_seasons || 0,
    number_of_episodes: show.number_of_episodes || 0,
    vote_average: show.vote_average || 0,
    vote_count: show.vote_count || 0,
    popularity: show.popularity || 0,
    status: show.status || '',
    tagline: show.tagline || '',
    homepage: show.homepage || '',
    in_production: show.in_production || false,
    genre_ids: show.genres?.map((g) => g.id) || [],
    genres: show.genres || [],
  } as TVShowDetail;
}

/**
 * Map backend TV list to TMDB-compatible format
 */
function mapTVListToTMDBFormat(response: BackendTVList): TVShowsListResponse {
  return {
    page: response.page,
    results: response.items.map(mapTVShowToTMDBFormat),
    total_pages: response.total_pages,
    total_results: response.total,
  };
}

/**
 * Get popular TV shows from backend.
 */
export async function fetchPopularShows(
  page = 1,
  pageSize = 20
): Promise<TVShowsListResponse> {
  const response = await httpClient.get<BackendTVList>('/tv/popular', {
    params: { page, page_size: pageSize },
  });
  return mapTVListToTMDBFormat(response.data);
}

/**
 * Get top-rated TV shows from backend.
 */
export async function fetchTopRatedShows(
  page = 1,
  pageSize = 20
): Promise<TVShowsListResponse> {
  const response = await httpClient.get<BackendTVList>('/tv/top-rated', {
    params: { page, page_size: pageSize },
  });
  return mapTVListToTMDBFormat(response.data);
}

/**
 * Get trending TV shows from backend.
 */
export async function fetchTrendingShows(
  timeWindow: 'day' | 'week' = 'week',
  page = 1,
  pageSize = 20
): Promise<TVShowsListResponse> {
  const response = await httpClient.get<BackendTVList>('/tv/trending', {
    params: { time_window: timeWindow, page, page_size: pageSize },
  });
  return mapTVListToTMDBFormat(response.data);
}

/**
 * Get TV show details by TMDB ID.
 */
export async function fetchTVShowDetails(tmdbId: number): Promise<TVShowDetail> {
  const response = await httpClient.get<BackendTVShow>(`/tv/${tmdbId}`);
  return mapTVShowToTMDBFormat(response.data);
}

/**
 * Get season details with episodes.
 */
export async function fetchSeasonDetails(
  tmdbId: number,
  seasonNumber: number
): Promise<SeasonDetail> {
  const response = await httpClient.get<{ data: BackendSeason }>(
    `/tv/${tmdbId}/season/${seasonNumber}`
  );

  const season = response.data.data;

  return {
    id: season.id,
    season_number: season.season_number,
    name: season.name,
    overview: season.overview || '',
    air_date: season.air_date || '',
    poster_path: season.poster_path || null,
    episode_count: season.episode_count,
    episodes: season.episodes.map((ep) => ({
      id: ep.id,
      episode_number: ep.episode_number,
      name: ep.name,
      overview: ep.overview || '',
      air_date: ep.air_date || '',
      still_path: ep.still_path || null,
      vote_average: ep.vote_average || 0,
      vote_count: ep.vote_count || 0,
      runtime: ep.runtime || 0,
      season_number: ep.season_number ?? seasonNumber,
    })),
  } as unknown as SeasonDetail;
}

/**
 * Get specific episode details.
 */
export async function fetchEpisodeDetails(
  tmdbId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<Episode> {
  const response = await httpClient.get<BackendEpisode>(
    `/tv/${tmdbId}/season/${seasonNumber}/episodes/${episodeNumber}`
  );

  return {
    id: response.data.id,
    episode_number: response.data.episode_number,
    name: response.data.name,
    overview: response.data.overview || '',
    air_date: response.data.air_date || '',
    still_path: response.data.still_path || null,
    vote_average: response.data.vote_average || 0,
    vote_count: response.data.vote_count || 0,
    runtime: response.data.runtime || 0,
    season_number: response.data.season_number ?? seasonNumber,
  } as unknown as Episode;
}

/**
 * Get similar TV shows.
 */
export async function fetchSimilarShows(
  tmdbId: number,
  limit = 10
): Promise<TVShowsListResponse> {
  const response = await httpClient.get<BackendTVList>(
    `/tv/${tmdbId}/similar`,
    { params: { limit } }
  );

  return {
    results: response.data.items.map(mapTVShowToTMDBFormat),
    total: response.data.total,
    page: response.data.page,
    total_pages: response.data.total_pages,
  };
}

/**
 * Get all TV shows (paginated).
 */
export async function fetchAllShows(
  page = 1,
  pageSize = 20
): Promise<TVShowsListResponse> {
  const response = await httpClient.get<BackendTVList>('/tv', {
    params: { page, page_size: pageSize },
  });
  return mapTVListToTMDBFormat(response.data);
}