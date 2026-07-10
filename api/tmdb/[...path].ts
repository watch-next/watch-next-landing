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
} from '../src/lib/tmdb/proxy/proxyHandler.js';

const TMDB_API_BASE =
  process.env.TMDB_API_BASE || 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    console.log("[API] Handler started");

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log("[API] Query:", req.query);

    const path = extractPathFromQuery(req.query.path);
    console.log("[API] Path:", path);

    const filteredParams = filterQueryParams(req.query);

    console.log("[API] Calling proxy...");

    const result = await proxyToTmdb(path, new URLSearchParams(filteredParams as Record<string, string>), {
      apiKey: API_KEY || '',
      apiBase: TMDB_API_BASE,
      defaultLanguage: process.env.VITE_TMDB_LANGUAGE || 'en-US',
      defaultRegion: process.env.VITE_TMDB_REGION || 'US',
    });

    console.log("[API] Proxy returned", {
      status: result.statusCode,
      isJson: result.isJson
    });

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
    console.error("[API ERROR]", err);
    res.status(500).json({
      error: String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
  }
}