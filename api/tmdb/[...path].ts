/**
 * TMDB API Proxy
 *
 * Vercel Serverless Function that proxies requests to TMDB API.
 * This keeps the TMDB API key secret - never exposed to the browser.
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
import {
  proxyToTmdb,
  extractPathFromQuery,
  filterQueryParams,
} from '../../src/lib/tmdb/proxy/proxyHandler';

const TMDB_API_BASE =
  process.env.TMDB_API_BASE || 'https://api.themoviedb.org/3';
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

    // Normalize path: Vercel catch-all provides string or string[]
    const rawPath = req.query.path;
    let path: string;

    if (Array.isArray(rawPath)) {
      // Filter empty strings and join with /
      path = rawPath.filter((p): p is string => typeof p === 'string' && p !== '').join('/');
    } else if (typeof rawPath === 'string') {
      path = rawPath;
    } else {
      res.status(400).json({
        error: 'Missing TMDB path',
        message: 'Expected /api/tmdb/movie/popular or similar endpoint',
      });
      return;
    }

    // Clean path: remove leading/trailing slashes
    const cleanPath = path.replace(/^\/+|\/+$/g, '');

    console.log('[TMDB] raw query:', JSON.stringify(req.query));
    console.log('[TMDB] normalized path:', cleanPath);

    if (!cleanPath) {
      res.status(400).json({ error: 'Missing TMDB path' });
      return;
    }

    const filteredParams = filterQueryParams(req.query);

    console.log('[TMDB] calling:', `https://api.themoviedb.org/3/${cleanPath}`);

    const result = await proxyToTmdb(cleanPath, new URLSearchParams(filteredParams as Record<string, string>), {
      apiKey: API_KEY || '',
      apiBase: TMDB_API_BASE,
      defaultLanguage: process.env.VITE_TMDB_LANGUAGE || 'en-US',
      defaultRegion: process.env.VITE_TMDB_REGION || 'US',
    });

    console.log('[TMDB] response status:', result.statusCode);

    for (const [key, value] of Object.entries(result.headers)) {
      if (typeof value === 'string') {
        res.setHeader(key, value);
      }
    }

    if (result.isJson) {
      res.status(result.statusCode).json(result.body);
    } else {
      res.status(result.statusCode).send(result.body);
    }
  } catch (err) {
    console.error('[API ERROR]', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
    return;
  }
}