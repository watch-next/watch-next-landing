import { defineConfig, loadEnv, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { VitePluginRSS } from './src/plugins/vite-plugin-rss'
import { VitePluginBlogSitemap } from './src/plugins/vite-plugin-blog-sitemap'
import * as http from 'node:http'
import * as https from 'node:https'

// ============================================================================
// TMDB Proxy Types
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
}

// ============================================================================
// TMDB Proxy Constants
// ============================================================================

const VALID_PATTERNS: RegExp[] = [
  /^movie\/popular$/,
  /^movie\/top_rated$/,
  /^movie\/upcoming$/,
  /^movie\/now_playing$/,
  /^movie\/\d+(\/(credits|similar|recommendations|watch\/providers|videos|images|reviews|external_ids))?$/,
  /^tv\/(popular|top_rated|on_the_air|airing_today)$/,
  /^tv\/\d+(\/(credits|similar|recommendations|watch\/providers|videos|images|reviews|external_ids))?$/,
  /^person\/\d+(\/(credits|images|external_ids))?$/,
  /^search\/(movie|tv|person|collection)$/,
  /^discover\/(movie|tv)$/,
  /^genre\/(movie|tv)\/list$/,
  /^collection\/\d+$/,
];

const ALLOWED_QUERY_PARAMS = ['language', 'region', 'page', 'query', 'include_image_logos'];

// ============================================================================
// TMDB Proxy Helpers
// ============================================================================

function isValidTmdbPath(path: string): boolean {
  const normalized = path.replace(/^\/+|\/+$/g, '');
  if (VALID_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }
  const allowedPrefixes = ['movie/', 'tv/', 'person/', 'search/', 'discover/', 'genre/', 'collection/'];
  return allowedPrefixes.some((prefix) => normalized.startsWith(prefix));
}

function buildTmdbUrl(path: string, searchParams: URLSearchParams, options: ProxyOptions): string {
  const params = new URLSearchParams(searchParams);
  params.set('api_key', options.apiKey);
  if (!params.has('language')) params.set('language', options.defaultLanguage);
  if (!params.has('region')) params.set('region', options.defaultRegion);

  const normalizedPath = path.replace(/^\/+|\/+$/g, '');
  const base = options.apiBase.endsWith('/') ? options.apiBase : `${options.apiBase}/`;
  const url = new URL(normalizedPath, base);
  url.search = params.toString();
  return url.toString();
}

function filterQueryParams(params: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key !== 'path' && ALLOWED_QUERY_PARAMS.includes(key) && typeof value === 'string') {
      result[key] = value;
    }
  }
  return result;
}

async function proxyToTmdb(
  path: string,
  searchParams: URLSearchParams,
  options: ProxyOptions
): Promise<ProxyResult> {
  if (!options.apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'TMDB API key not configured' },
    };
  }

  if (!isValidTmdbPath(path)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Invalid path' },
    };
  }

  const tmdbUrl = buildTmdbUrl(path, searchParams, options);
  console.log('[TMDB Proxy]', { path, action: 'proxy_request' });

  try {
    const lib = tmdbUrl.startsWith('https') ? https : http;

    return await new Promise((resolve) => {
      const request = lib.get(tmdbUrl, {
        headers: { Accept: 'application/json' },
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
            } catch { /* keep as string */ }
          }

          const headers: Record<string, string> = {};
          if (res.statusCode === 200) {
            headers['Cache-Control'] = 's-maxage=300, stale-while-revalidate';
          }
          if (contentType) {
            headers['Content-Type'] = contentType;
          }

          if (res.statusCode && res.statusCode !== 200) {
            console.error('[TMDB Proxy]', { path, status: res.statusCode });
          }

          resolve({
            statusCode: res.statusCode || 200,
            headers,
            body: responseBody,
          });
        });
      });

      request.on('error', (err) => {
        console.error('[TMDB Proxy]', { path, error: 'request_failed', message: err.message });
        resolve({
          statusCode: 502,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'TMDB proxy error', message: err.message },
        });
      });

      request.on('timeout', () => {
        request.destroy();
        console.error('[TMDB Proxy]', { path, error: 'timeout' });
        resolve({
          statusCode: 504,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'TMDB proxy timeout' },
        });
      });
    });
  } catch (error) {
    console.error('[TMDB Proxy]', { path, error: 'proxy_error' });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Failed to fetch from TMDB' },
    };
  }
}

// ============================================================================
// Vite Configuration
// ============================================================================

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode || 'development', process.cwd(), '')
  const gaId = env.VITE_GOOGLE_ANALYTICS_ID
  const adsensePublisherId = env.VITE_GOOGLE_ADSENSE_PUBLISHER_ID
  const tmdbApiKey = env.TMDB_API_KEY
  const tmdbApiBase = env.TMDB_API_BASE || 'https://api.themoviedb.org/3'
  const tmdbLanguage = env.VITE_TMDB_LANGUAGE || 'en-US'
  const tmdbRegion = env.VITE_TMDB_REGION || 'US'

  // TMDB Proxy for local development
  const tmdbProxyPlugin: Plugin = {
    name: 'tmdb-proxy',
    configureServer(server) {
      console.log('[TMDB Proxy] Registering middleware for /api/tmdb')
      server.middlewares.use('/api/tmdb', async (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => {
        console.log(`[TMDB Proxy] Request: ${req.method} ${req.url}`)

        const url = new URL(req.url || '', 'http://localhost')
        // Vite middleware strips mount path, so pathname is the TMDB path
        const path = url.pathname.replace(/^\//, '')

        if (!path) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Path required', message: 'Example: /api/tmdb/movie/popular' }))
          return
        }

        console.log(`[TMDB Proxy] Normalized path: ${path}`)

        const filteredParams = filterQueryParams(Object.fromEntries(url.searchParams.entries()))
        const allParams = new URLSearchParams({ ...filteredParams })

        try {
          const result = await proxyToTmdb(path, allParams, {
            apiKey: tmdbApiKey || '',
            apiBase: tmdbApiBase,
            defaultLanguage: tmdbLanguage,
            defaultRegion: tmdbRegion,
          })

          console.log(`[TMDB Proxy] Result: ${result.statusCode}`)
          res.statusCode = result.statusCode
          for (const [key, value] of Object.entries(result.headers)) {
            res.setHeader(key, value)
          }
          if (typeof result.body === 'string') {
            res.end(result.body)
          } else {
            res.end(JSON.stringify(result.body))
          }
        } catch (err) {
          console.error('[TMDB Proxy] Error:', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            error: 'Proxy error',
            message: err instanceof Error ? err.message : 'Unknown error',
          }))
        }
      })
    }
  }

  const googleAnalyticsPlugin = {
    name: 'google-analytics',
    transformIndexHtml(html: string) {
      if (!gaId) {
        return html.replace('%VITE_GOOGLE_ANALYTICS%', '')
      }

      const gtagScript = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  function gtag(){dataLayer.push(arguments);}
  window.dataLayer = window.dataLayer || [];
  gtag('js', new Date());
  gtag('config', '${gaId}');
</script>`

      return html.replace('%VITE_GOOGLE_ANALYTICS%', gtagScript)
    }
  }

  const googleAdSensePlugin = {
    name: 'google-adsense',
    transformIndexHtml(html: string) {
      if (!adsensePublisherId) {
        return html.replace('%VITE_GOOGLE_ADSENSE%', '')
      }

      const adsenseScript = `<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${adsensePublisherId.replace('ca-pub-', '')}"
     crossorigin="anonymous"></script>`

      return html.replace('%VITE_GOOGLE_ADSENSE%', adsenseScript)
    }
  }

  return {
    plugins: [vue(), googleAnalyticsPlugin, googleAdSensePlugin, VitePluginRSS(), VitePluginBlogSitemap(), tmdbProxyPlugin],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    assetsInclude: ['**/*.md'],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/style/variables" as *;\n@use "@/style/components/inputs" as *;\n@use "@/style/components/badges" as *;\n`
        }
      }
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: false
    }
  }
})