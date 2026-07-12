/**
 * TMDB API Proxy - Vercel Serverless Function
 *
 * Self-contained proxy to TMDB API. Zero external dependencies.
 * Only Node.js built-ins and Vercel types.
 *
 * Usage:
 *   GET /api/tmdb/movie/popular?page=1
 *   GET /api/tmdb/movie/550
 *   GET /api/tmdb/movie/550/credits
 *
 * Environment:
 *   TMDB_API_KEY - Required. Get from https://www.themoviedb.org/settings/api
 *   TMDB_API_BASE - Optional. Defaults to https://api.themoviedb.org/3
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as http from 'node:http';
import * as https from 'node:https';
import { URL } from 'node:url';

// ============================================================================
// Types
// ============================================================================

interface ProxyOptions {
  apiKey: string;
  apiBase: string;
  defaultLanguage: string;
  defaultRegion: string;
}

interface ProxyResult {
  statusCode: number;
  headers: Record<string, string>;
  body: string | Record<string, unknown>;
  isJson?: boolean;
  isError?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const VALID_PATTERNS: RegExp[] = [
  // Movie endpoints
  /^movie\/popular$/,
  /^movie\/top_rated$/,
  /^movie\/upcoming$/,
  /^movie\/now_playing$/,
  /^movie\/\d+(\/(credits|similar|recommendations|watch\/providers|videos|images|reviews|external_ids))?$/,
  // TV endpoints
  /^tv\/(popular|top_rated|on_the_air|airing_today)$/,
  /^tv\/\d+(\/(credits|similar|recommendations|watch\/providers|videos|images|reviews|external_ids))?$/,
  // Person endpoints
  /^person\/\d+(\/(credits|images|external_ids))?$/,
  // Search endpoints
  /^search\/(movie|tv|person|collection)$/,
  // Discover endpoints
  /^discover\/(movie|tv)$/,
  // Genre endpoints
  /^genre\/(movie|tv)\/list$/,
  // Collection endpoints
  /^collection\/\d+$/,
];

const ALLOWED_QUERY_PARAMS = ['language', 'region', 'page', 'query', 'include_image_logos'];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate a TMDB API path
 */
function isValidTmdbPath(path: string): boolean {
  const normalized = path.replace(/^\/+|\/+$/g, '');

  if (VALID_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  const allowedPrefixes = [
    'movie/',
    'tv/',
    'person/',
    'search/',
    'discover/',
    'genre/',
    'collection/',
  ];

  return allowedPrefixes.some((prefix) => normalized.startsWith(prefix));
}

/**
 * Build a TMDB URL with API key and default parameters
 */
function buildTmdbUrl(
  path: string,
  searchParams: URLSearchParams,
  options: ProxyOptions
): string {
  const params = new URLSearchParams(searchParams);

  // TMDB v3 authentication using api_key query parameter only
  params.set('api_key', options.apiKey);

  if (!params.has('language')) {
    params.set('language', options.defaultLanguage);
  }
  if (!params.has('region')) {
    params.set('region', options.defaultRegion);
  }

  const normalizedPath = path.replace(/^\/+|\/+$/g, '');
  const base = options.apiBase.endsWith('/') ? options.apiBase : `${options.apiBase}/`;
  const url = new URL(normalizedPath, base);
  url.search = params.toString();

  return url.toString();
}

/**
 * Filter query parameters to only allowed ones
 */
function filterQueryParams(params: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (key !== 'path' && ALLOWED_QUERY_PARAMS.includes(key) && typeof value === 'string') {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Extract path from Vercel catch-all query parameter
 */
function extractPathFromQuery(rawPath: unknown): string | null {
  if (Array.isArray(rawPath)) {
    const filtered = rawPath.filter((p): p is string => typeof p === 'string' && p !== '');
    if (filtered.length === 0) return null;
    return filtered.join('/');
  }

  if (typeof rawPath === 'string') {
    return rawPath;
  }

  return null;
}

/**
 * Proxy a request to TMDB API using v3 API key authentication
 */
async function proxyToTmdb(
  path: string,
  searchParams: URLSearchParams,
  options: ProxyOptions
): Promise<ProxyResult> {
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

  if (!isValidTmdbPath(path)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Invalid path',
        message: 'Path must match TMDB API endpoints',
      },
      isError: true,
    };
  }

  const tmdbUrl = buildTmdbUrl(path, searchParams, options);

  console.log('[TMDB]', { path, action: 'proxy_request' });

  try {
    const lib = tmdbUrl.startsWith('https') ? https : http;

    return await new Promise((resolve) => {
      const request = lib.get(tmdbUrl, {
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000,
      }, (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          const contentType = res.headers['content-type'] || '';

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

          const headers: Record<string, string> = {};
          if (res.statusCode === 200) {
            headers['Cache-Control'] = 's-maxage=300, stale-while-revalidate';
          }
          if (contentType) {
            headers['Content-Type'] = contentType;
          }

          // Log errors for debugging (without exposing API key)
          if (res.statusCode && res.statusCode !== 200) {
            console.error('[TMDB]', {
              path,
              status: res.statusCode,
              statusText: res.statusMessage,
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
        console.error('[TMDB]', { path, error: 'request_failed', message: err.message });
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
        console.error('[TMDB]', { path, error: 'timeout' });
        resolve({
          statusCode: 504,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'TMDB proxy timeout' },
          isError: true,
        });
      });
    });
  } catch (error) {
    console.error('[TMDB]', { path, error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown' });
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

// ============================================================================
// Vercel Handler
// ============================================================================

const TMDB_API_BASE = process.env.TMDB_API_BASE || 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Extract path from Vercel catch-all query
    const path = extractPathFromQuery(req.query.path);

    const cleanPath = path ? path.replace(/^\/+|\/+$/g, '') : '';

    console.log('[TMDB]', { path: cleanPath, action: 'request_received' });

    if (!cleanPath) {
      res.status(400).json({
        error: 'Missing TMDB path',
        message: 'Expected /api/tmdb/movie/popular or similar endpoint',
      });
      return;
    }

    const filteredParams = filterQueryParams(req.query);

    const result = await proxyToTmdb(cleanPath, new URLSearchParams(filteredParams), {
      apiKey: API_KEY || '',
      apiBase: TMDB_API_BASE,
      defaultLanguage: process.env.VITE_TMDB_LANGUAGE || 'en-US',
      defaultRegion: process.env.VITE_TMDB_REGION || 'US',
    });

    console.log('[TMDB]', { path: cleanPath, status: result.statusCode });

    // Set response headers
    for (const [key, value] of Object.entries(result.headers)) {
      if (typeof value === 'string') {
        res.setHeader(key, value);
      }
    }

    // Send response preserving TMDB status codes
    if (result.isJson) {
      res.status(result.statusCode).json(result.body);
    } else {
      res.status(result.statusCode).send(result.body);
    }
  } catch (err) {
    console.error('[API]', { error: 'handler_error', message: err instanceof Error ? err.message : 'Unknown' });
    res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}