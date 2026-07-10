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
} from '../../src/lib/tmdb/proxy/proxyHandler.js';

const TMDB_API_BASE =
  process.env.TMDB_API_BASE || 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    console.log("[API] Handler started");
    console.log("[API] Raw query:", JSON.stringify(req.query));
    console.log("[API] req.query.path:", req.query.path);
    console.log("[API] Is array?", Array.isArray(req.query.path));

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Normalize path: Vercel catch-all provides string or string[]
    let path: string;
    if (Array.isArray(req.query.path)) {
      path = req.query.path.filter(Boolean).join('/');
    } else if (typeof req.query.path === 'string') {
      path = req.query.path;
    } else {
      res.status(400).json({ error: 'Missing TMDB path - expected /api/tmdb/movie/popular' });
      return;
    }

    console.log("[API] Normalized path:", path);

    if (!path) {
      res.status(400).json({ error: 'Missing TMDB path' });
      return;
    }

    const filteredParams = filterQueryParams(req.query);

    console.log("[API] Calling proxy with path:", path);

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