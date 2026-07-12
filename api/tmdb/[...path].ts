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
// Validation
// ============================================================================

/**
 * Validate TMDB API path against allowed patterns
 */
function isValidTmdbPath(path: string): boolean {
  return VALID_PATTERNS.some((pattern) => pattern.test(path));
}

// ============================================================================
// Path Extraction
// ============================================================================

/**
 * Extract TMDB path from Vercel catch-all request
 *
 * Vercel catch-all routes ([...path]) expose the captured path via:
 * - req.query["...path"] (Vercel's actual behavior)
 * - req.query.path (fallback for compatibility)
 *
 * Supports:
 * - string: "movie/popular"
 * - string[]: ["movie", "popular"]
 * - "...path" key: Vercel's catch-all parameter name
 *
 * Normalizes by:
 * - Removing leading/trailing slashes
 * - Removing duplicate slashes
 * - Returning "" when invalid
 */
function extractPath(req: VercelRequest): string {
  let rawPath: string | string[] | undefined;

  // Primary: Vercel catch-all uses "...path" as the key
  if (req.query['...path'] !== undefined) {
    rawPath = req.query['...path'] as string | string[];
  }
  // Fallback: standard path parameter
  else if ('path' in req.query) {
    rawPath = req.query.path;
  }

  // Handle undefined/null
  if (rawPath === undefined || rawPath === null) {
    console.log('[TMDB EXTRACT]', { source: 'missing', extractedPath: '' });
    return '';
  }

  // Handle string[] format (Vercel splits by /)
  if (Array.isArray(rawPath)) {
    const filtered = rawPath.filter((p): p is string => typeof p === 'string' && p !== '');
    if (filtered.length > 0) {
      const path = filtered.join('/');
      console.log('[TMDB EXTRACT]', { source: 'array', extractedPath: path });
      return path;
    }
    console.log('[TMDB EXTRACT]', { source: 'array.empty', extractedPath: '' });
    return '';
  }

  // Handle string format
  if (typeof rawPath === 'string') {
    const normalized = rawPath.trim();
    if (normalized !== '') {
      console.log('[TMDB EXTRACT]', { source: 'string', extractedPath: normalized });
      return normalized;
    }
    console.log('[TMDB EXTRACT]', { source: 'string.empty', extractedPath: '' });
    return '';
  }

  // Unknown type
  console.log('[TMDB EXTRACT]', { source: 'unknown.type', extractedPath: '' });
  return '';
}

// ============================================================================
// Query Parameter Handling
// ============================================================================

/**
 * Filter query parameters to only allowed ones
 * Excludes routing-only parameters: "path" and "...path"
 */
function filterQueryParams(params: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip routing parameters
    if (key === 'path' || key === '...path') {
      continue;
    }
    // Include only whitelisted params
    if (ALLOWED_QUERY_PARAMS.includes(key) && typeof value === 'string') {
      result[key] = value;
    }
  }

  return result;
}

// ============================================================================
// URL Building
// ============================================================================

/**
 * Build TMDB URL with proper authentication (v3 API key only)
 *
 * TMDB v3 API uses api_key query parameter for authentication.
 * Do NOT use Authorization header - it's ignored by TMDB for v3 keys.
 */
function buildTmdbUrl(path: string, searchParams: URLSearchParams, options: ProxyOptions): string {
  const params = new URLSearchParams(searchParams);

  // TMDB v3 authentication: api_key query parameter ONLY
  params.set('api_key', options.apiKey);

  // Apply defaults
  if (!params.has('language')) {
    params.set('language', options.defaultLanguage);
  }
  if (!params.has('region')) {
    params.set('region', options.defaultRegion);
  }

  // Normalize path (remove leading/trailing slashes)
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');

  // Build URL with trailing slash from base
  const base = options.apiBase.endsWith('/') ? options.apiBase : `${options.apiBase}/`;
  const url = new URL(normalizedPath, base);
  url.search = params.toString();

  return url.toString();
}

/**
 * Sanitize URL for logging - masks api_key value
 */
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('api_key')) {
      parsed.searchParams.set('api_key', '***');
    }
    return parsed.toString();
  } catch {
    return url.replace(/api_key=[^&]+/gi, 'api_key=***');
  }
}

// ============================================================================
// TMDB Proxy
// ============================================================================

/**
 * Proxy a request to TMDB API
 *
 * Features:
 * - HTTPS only (TMDB requires TLS)
 * - Structured logging with sanitized URLs
 * - Proper error handling and status code propagation
 * - Cache headers for successful responses
 */
async function proxyToTmdb(
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
        error: 'TMDB_API_KEY not configured',
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
        error: 'Invalid TMDB endpoint',
        message: `Path "${path}" does not match allowed TMDB API patterns`,
        hint: 'Supported: movie/*, tv/*, person/*, search/*, discover/*, genre/*, collection/*',
      },
      isError: true,
    };
  }

  const tmdbUrl = buildTmdbUrl(path, searchParams, options);
  const sanitizedUrl = sanitizeUrl(tmdbUrl);

  // [TMDB REQUEST] log
  console.log('[TMDB REQUEST]', {
    method: 'GET',
    path,
    normalizedPath: path.replace(/^\/+|\/+$/g, ''),
    query: Object.fromEntries(searchParams.entries()),
    url: sanitizedUrl,
  });

  const startTime = Date.now();

  return new Promise((resolve) => {
    https.get(tmdbUrl, {
      headers: {
        Accept: 'application/json',
      },
      timeout: 10000,
    }, (res) => {
      const chunks: Buffer[] = [];

      res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      res.on('end', () => {
        const duration = Date.now() - startTime;
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

        // Build response headers
        const headers: Record<string, string> = {};

        if (res.statusCode === 200) {
          headers['Cache-Control'] = 's-maxage=300, stale-while-revalidate';
        }

        if (contentType) {
          headers['Content-Type'] = contentType;
        }

        // [TMDB RESPONSE] log
        console.log('[TMDB RESPONSE]', {
          status: res.statusCode,
          duration: `${duration}ms`,
          cache: res.statusCode === 200 ? 'hit-eligible' : 'bypass',
        });

        // [TMDB ERROR] log for non-200 responses
        if (res.statusCode && res.statusCode !== 200) {
          console.error('[TMDB ERROR]', {
            status: res.statusCode,
            tmdbUrl: sanitizedUrl,
            message: typeof responseBody === 'object'
              ? (responseBody as Record<string, unknown>).status_message ?? 'Unknown error'
              : 'Non-JSON error response',
          });
        }

        resolve({
          statusCode: res.statusCode || 200,
          headers,
          body: responseBody,
          isJson,
        });
      });
    })
    .on('error', (err) => {
      const duration = Date.now() - startTime;

      console.error('[TMDB ERROR]', {
        status: 'network_error',
        tmdbUrl: sanitizedUrl,
        message: err.message,
      });

      resolve({
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: {
          error: 'TMDB proxy error',
          message: err.message,
        },
        isError: true,
      });
    })
    .on('timeout', () => {
      const duration = Date.now() - startTime;

      console.error('[TMDB ERROR]', {
        status: 'timeout',
        tmdbUrl: sanitizedUrl,
        message: `Request exceeded ${duration}ms timeout`,
      });

      resolve({
        statusCode: 504,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'TMDB proxy timeout' },
        isError: true,
      });
    });
  });
}

// ============================================================================
// Vercel Handler
// ============================================================================

const TMDB_API_BASE = process.env.TMDB_API_BASE ?? 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Validate HTTP method
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Extract and validate TMDB path
  const path = extractPath(req);

  if (!path) {
    res.status(400).json({
      error: 'Missing TMDB path',
      message: 'Expected /api/tmdb/movie/popular or similar endpoint',
    });
    return;
  }

  // Filter query params and proxy request
  const filteredParams = filterQueryParams(req.query);

  const result = await proxyToTmdb(path, new URLSearchParams(filteredParams), {
    apiKey: API_KEY ?? '',
    apiBase: TMDB_API_BASE,
    defaultLanguage: process.env.VITE_TMDB_LANGUAGE ?? 'en-US',
    defaultRegion: process.env.VITE_TMDB_REGION ?? 'US',
  });

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
}