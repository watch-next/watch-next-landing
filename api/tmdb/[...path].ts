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
} from '@/lib/tmdb/proxy/proxyHandler';

const TMDB_API_BASE =
  process.env.TMDB_API_BASE || 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const path = extractPathFromQuery(req.query.path);
  const filteredParams = filterQueryParams(req.query);

  const result = await proxyToTmdb(path, new URLSearchParams(filteredParams), {
    apiKey: API_KEY || '',
    apiBase: TMDB_API_BASE,
    defaultLanguage: process.env.VITE_TMDB_LANGUAGE || 'en-US',
    defaultRegion: process.env.VITE_TMDB_REGION || 'US',
  });

  for (const [key, value] of Object.entries(result.headers)) {
    res.setHeader(key, value);
  }

  if (result.isJson) {
    res.status(result.statusCode).json(result.body);
  } else {
    res.status(result.statusCode).send(result.body);
  }
}