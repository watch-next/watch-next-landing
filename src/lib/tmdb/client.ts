/**
 * TMDB API Client
 *
 * Thin fetch wrapper that handles:
 * - Base URL injection
 * - Query parameter merging
 * - Error normalization
 * - Request timeout
 *
 * Uses the Vercel serverless proxy (/api/tmdb) to keep API keys secure.
 * The frontend never communicates directly with TMDB.
 */

import { tmdbConfig, getDefaultParams } from './config';

export class TmdbApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly path: string;

  constructor(message: string, status: number, statusText: string, path: string) {
    super(message);
    this.name = 'TmdbApiError';
    this.status = status;
    this.statusText = statusText;
    this.path = path;
  }
}

export interface FetchOptions {
  params?: Record<string, string | number | undefined>;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Low-level TMDB API client.
 * Uses the serverless proxy endpoint - never calls TMDB directly.
 */
export async function tmdbGet<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params = {}, timeout = DEFAULT_TIMEOUT } = options;

  // Merge with default params (language, region)
  const allParams = new URLSearchParams({
    ...getDefaultParams(),
    ...Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
  });

  // Use Vercel serverless proxy
  // Ensure path doesn't have leading slash to avoid double slashes
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `/api/tmdb/${normalizedPath}?${allParams.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new TmdbApiError(
        `TMDB API error: ${response.statusText}`,
        response.status,
        response.statusText,
        path
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof TmdbApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new TmdbApiError('Request timeout', 408, 'Timeout', path);
    }

    if (error instanceof Error) {
      throw new TmdbApiError(
        `Network error: ${error.message}`,
        0,
        error.message,
        path
      );
    }

    throw new TmdbApiError('Unknown error', 0, 'Unknown', path);
  }
}

/**
 * Check if an error is a TMDB API error.
 */
export function isTmdbApiError(error: unknown): error is TmdbApiError {
  return error instanceof TmdbApiError;
}