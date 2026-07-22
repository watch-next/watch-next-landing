import { Plugin } from 'vite';

const SITE_URL = 'https://watchnext.app';

/**
 * Generate slug from movie title (same logic as MoviePage)
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateMovieSitemap(movies: Array<{ id: string; title: string; updatedAt?: string }>) {
  const urls = movies.map((movie) => {
    const slug = generateSlug(movie.title);
    const lastmod = movie.updatedAt || new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${SITE_URL}/movies/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

async function fetchMoviesForSitemap(): Promise<Array<{ id: string; title: string; updatedAt?: string }>> {
  const baseUrl = process.env.VITE_API_URL;

  if (!baseUrl) {
    console.warn('[Movie Sitemap Plugin] VITE_API_URL not configured, generating empty sitemap');
    return [];
  }

  const movies: Array<{ id: string; title: string; updatedAt?: string }> = [];
  const pagesToFetch = 5; // Fetch first 5 pages (up to 100 movies)

  console.log('[Movie Sitemap Plugin] Fetching movies from backend...');

  for (let page = 1; page <= pagesToFetch; page++) {
    try {
      // Note: fetchAllMovies expects httpClient which uses VITE_API_URL
      // We need to temporarily set up tokens for unauthenticated access
      const response = await fetch(`${baseUrl}/movies?page=${page}&page_size=20`);

      if (!response.ok) {
        console.error(`[Movie Sitemap Plugin] Backend API error: ${response.status} ${response.statusText}`);
        break;
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        break;
      }

      for (const movie of data.data) {
        if (movie.title && typeof movie.title === 'string') {
          movies.push({
            id: movie.id || String(movie.tmdb_id),
            title: movie.title,
            updatedAt: new Date().toISOString().split('T')[0],
          });
        }
      }

      if (data.total_pages && page >= data.total_pages) {
        break;
      }
    } catch (error) {
      console.error(`[Movie Sitemap Plugin] Error fetching page ${page}:`, error);
      break;
    }
  }

  console.log(`[Movie Sitemap Plugin] Found ${movies.length} movies`);
  return movies;
}

export function VitePluginMovieSitemap(): Plugin {
  return {
    name: 'vite-plugin-movie-sitemap',
    apply: 'build',
    async generateBundle(options, bundle) {
      console.log('[Movie Sitemap Plugin] Generating movie-sitemap.xml...');

      const movies = await fetchMoviesForSitemap();

      if (movies.length === 0) {
        console.log('[Movie Sitemap Plugin] No movies found, generating empty sitemap');
        // Generate empty but valid sitemap
        const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
        this.emitFile({
          type: 'asset',
          fileName: 'movie-sitemap.xml',
          source: emptySitemap,
        });
        return;
      }

      const sitemap = generateMovieSitemap(movies);

      this.emitFile({
        type: 'asset',
        fileName: 'movie-sitemap.xml',
        source: sitemap,
      });

      console.log('[Movie Sitemap Plugin] movie-sitemap.xml generated successfully');
    },
  };
}