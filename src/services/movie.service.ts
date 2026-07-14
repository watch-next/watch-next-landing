/**
 * Movie Service
 *
 * Handles all movie-related API calls to the backend.
 */

import { httpClient } from '@/lib/http/client';
import type { AxiosResponse } from 'axios';

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetail {
  id: string;           // UUID do backend
  tmdb_id: number;      // TMDB ID original
  title: string;        // Título principal
  original_title: string; // Título original (sempre presente)
  overview: string;     // Sinopse
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string; // Data de lançamento (YYYY-MM-DD)
  runtime_minutes: number | null;
  vote_average: number | null;
  vote_count: number | null;
  popularity: number | null;
  status: string;       // e.g., "Released", "Upcoming"
  tagline: string | null;
  homepage: string | null;
  budget: number | null;
  revenue: number | null;
  genres: Genre[];
}

export interface WatchProvider {
  id: number;
  tmdb_id?: number;
  name: string;
  logo_path: string | null;
  display_priority?: number;
  link?: string; // Watch link retornado pela API
}

export interface WatchProviderGroup {
  flatrate?: WatchProvider[] | null;
  rent?: WatchProvider[] | null;
  buy?: WatchProvider[] | null;
  free?: WatchProvider[] | null;
  ads?: WatchProvider[] | null;
}

export interface WatchProvidersResponse extends WatchProviderGroup {
  success: boolean;
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/**
 * Get movie details by backend UUID.
 */
export async function getMovieByUuid(uuid: string): Promise<MovieDetail> {
  const response: AxiosResponse<{ success: boolean; data: MovieDetail }> = await httpClient.get(`/movies/${uuid}`);
  return response.data.data;
}

/**
 * Get watch providers for a movie.
 * @param movieId - UUID do filme ou TMDB ID
 * @param region - Código da região (padrão: 'US')
 */
export async function getWatchProviders(movieId: string | number, region: string = 'US'): Promise<WatchProvidersResponse> {
  const response: AxiosResponse<{ success: boolean; data: WatchProvidersResponse }> =
    await httpClient.get(`/movies/${movieId}/watch`, {
      params: { region },
    });
  return response.data.data;
}

/**
 * Get TMDB image URL.
 */
export function getTmdbImageUrl(path: string | null, size: string = 'w500'): string | undefined {
  if (!path) return undefined;
  return `${TMDB_IMAGE_BASE_URL.replace('w500', size)}${path}`;
}