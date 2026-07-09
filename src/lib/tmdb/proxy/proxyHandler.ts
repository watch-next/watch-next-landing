/**
 * TMDB Proxy Handler
 *
 * Shared logic for proxying requests to TMDB API.
 * Used by both:
 * - Vite dev server (development)
 * - Vercel serverless function (production)
 *
 * The API key is read from environment variables and never exposed to the browser.
 */

import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export interface ProxyOptions {
  apiKey: string;
  apiBase: string;
  defaultLanguage: string;
  defaultRegion: string;
}

export interface ProxyResult {
  statusCode: number;
  headers: Record<string, string>;
  body: string | Record<string, unknown>;
  isJson?: boolean;
  isError?: boolean;
}

/**
 * Allowed TMDB API endpoint patterns
 */
const VALID_PATTERNS = [
  /^movie\/popular$/,
  /^movie\/top_rated$/,
  /^movie\/upcoming$/,
  /^movie\/now_playing$/,
  /^movie\/\d+$/,
  /^movie\/\d+\/credits$/,
  /^movie\/\d+\/similar$/,
  /^movie\/\d+\/recommendations$/,
  /^movie\/\d+\/watch\/providers$/,
  /^movie\/\d+\/videos$/,
  /^movie\/\d+\/images$/,
  /^movie\/\d+\/reviews$/,
  /^movie\/\d+\/external_ids$/,
  /^search\/movie$/,
  /^genre\/movie\/list$/,
  /^discover\/movie$/,
  /^collection\/\d+$/,
];

/**
 * Allowed query parameters to forward to TMDB
 */
const ALLOWED_QUERY_PARAMS = ['language', 'region', 'page', 'query', 'include_image_logos'];

/**
 * Validate a TMDB API path
 * Normalizes path by removing leading/trailing slashes before matching
 */
export function isValidTmdbPath(path: string): boolean {
  // Normalize: remove leading and trailing slashes
  const normalized = path.replace(/^\/+|\/+$/g, '');
  return VALID_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Build a TMDB URL with API key and default parameters
 */
export function buildTmdbUrl(
  path: string,
  searchParams: URLSearchParams,
  options: ProxyOptions
): string {
  const params = new URLSearchParams(searchParams);

  // Always append API key as a fallback
  params.set('api_key', options.apiKey);

  // Apply defaults if not provided
  if (!params.has('language')) {
    params.set('language', options.defaultLanguage);
  }
  if (!params.has('region')) {
    params.set('region', options.defaultRegion);
  }

  // Normalize path - remove leading and trailing slashes
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');

  // Ensure base URL ends with a trailing slash to avoid malformed URLs like .../3movie/…
  const base = options.apiBase.endsWith('/') ? options.apiBase : `${options.apiBase}/`;

  // Use URL constructor for proper URL building
  const url = new URL(normalizedPath, base);
  url.search = params.toString();

  // Log the final TMDB URL for debugging
  console.log('TMDB URL', url.toString());

  return url.toString();
}

/**
 * Proxy a request to TMDB API
 *
 * @param path - The TMDB API path (e.g., "movie/popular")
 * @param searchParams - Query parameters from the original request
 * @param options - Proxy configuration
 * @returns Promise resolving to proxy result
 */
export async function proxyToTmdb(
  path: string,
  searchParams: URLSearchParams,
  options: ProxyOptions
): Promise<ProxyResult> {
  // Validate API key
  if (!options.apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'TMDB API key not configured',
        message: 'Server administrator must set TMDB_API_KEY environment variable',
      },
      isError: true,
    };
  }

  // Validate path
  if (!isValidTmdbPath(path)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Invalid path',
        message: 'Path must match TMDB API movie endpoints',
      },
      isError: true,
    };
  }

  // Build TMDB URL
  const tmdbUrl = buildTmdbUrl(path, searchParams, options);

  try {
    // Use appropriate HTTP module based on URL scheme
    const lib = tmdbUrl.startsWith('https') ? https : http;

    return await new Promise((resolve) => {
      const request = lib.get(tmdbUrl, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${options.apiKey}`,
        },
        timeout: 10000,
      }, (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          const contentType = res.headers['content-type'] || '';

          // Parse JSON if applicable
          let responseBody: string | Record<string, unknown> = body;
          let isJson = false;

          if (contentType.includes('application/json')) {
            try {
              responseBody = JSON.parse(body);
              isJson = true;
            } catch {
              // Keep as string if parse fails
            }
          }

          // Set cache headers for successful responses
          const headers: Record<string, string> = {};
          if (res.statusCode === 200) {
            headers['Cache-Control'] = 's-maxage=300, stale-while-revalidate';
          }
          if (contentType) {
            headers['Content-Type'] = contentType;
          }

          // Log error details for non‑200 responses
          if (res.statusCode && res.statusCode !== 200) {
            console.error({
              url: tmdbUrl,
              status: res.statusCode,
              statusText: res.statusMessage,
              body: responseBody,
            });
          }
          resolve({
            statusCode: res.statusCode || 200,
            headers,
            body: responseBody,
            isJson,
          });
        });
      });

      request.on('error', (err) => {
        resolve({
          statusCode: 502,
          headers: { 'Content-Type': 'application/json' },
          body: {
            error: 'TMDB proxy error',
            message: err.message,
          },
          isError: true,
        });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({
          statusCode: 504,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'TMDB proxy timeout' },
          isError: true,
        });
      });
    });
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Failed to fetch from TMDB',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      isError: true,
    };
  }
}

/**
 * Extract path from Vercel request query params
 */
export function extractPathFromQuery(queryPath: unknown): string {
  if (Array.isArray(queryPath)) {
    return queryPath.filter(Boolean).join('/');
  }
  if (typeof queryPath === 'string') {
    return queryPath;
  }
  return '';
}

/**
 * Filter query parameters to only allowed ones
 */
export function filterQueryParams(params: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (key !== 'path' && ALLOWED_QUERY_PARAMS.includes(key) && typeof value === 'string') {
      result[key] = value;
    }
  }

  return result;
}