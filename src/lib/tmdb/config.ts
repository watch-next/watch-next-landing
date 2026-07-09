/**
 * TMDB Client Configuration
 *
 * Reads environment variables and validates presence of required settings.
 * Does not include API keys - those are handled server-side via proxy.
 *
 * Environment variables:
 * - VITE_TMDB_BASE_URL: TMDB API base URL (https://api.themoviedb.org/3)
 * - VITE_TMDB_IMAGE_URL: TMDB image base URL (https://image.tmdb.org)
 * - VITE_TMDB_LANGUAGE: Default language code (e.g., 'en-US')
 * - VITE_TMDB_REGION: Default region code (e.g., 'US')
 */

export interface TmdbConfig {
  baseUrl: string;
  imageUrl: string;
  language: string;
  region: string;
}

function getEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    console.warn(
      `TMDB config: Missing ${name}. TMDB features may not work correctly.`
    );
    return '';
  }
  return value;
}

/**
 * TMDB configuration loaded from environment variables.
 * Check isConfigured() before using TMDB-dependent features.
 */
export const tmdbConfig: TmdbConfig = {
  baseUrl: getEnvVar('VITE_TMDB_BASE_URL') || 'https://api.themoviedb.org/3',
  imageUrl: getEnvVar('VITE_TMDB_IMAGE_URL') || 'https://image.tmdb.org',
  language: getEnvVar('VITE_TMDB_LANGUAGE') || 'en-US',
  region: getEnvVar('VITE_TMDB_REGION') || 'US',
};

/**
 * Check if TMDB is properly configured.
 * Returns true if all required environment variables are present.
 */
export function isConfigured(): boolean {
  return !!(
    import.meta.env.VITE_TMDB_BASE_URL ||
    import.meta.env.VITE_TMDB_IMAGE_URL
  );
}

/**
 * Get the default query parameters for TMDB API requests.
 */
export function getDefaultParams(): Record<string, string> {
  return {
    language: tmdbConfig.language,
    region: tmdbConfig.region,
  };
}

/**
 * Build a TMDB image URL from a path and size.
 * @param path The image path from TMDB (e.g., '/abc123.jpg')
 * @param size The image size (e.g., 'w500', 'original')
 * @returns Full image URL
 */
export function buildImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path) {
    return '';
  }
  return `${tmdbConfig.imageUrl}/t/p/${size}${path}`;
}