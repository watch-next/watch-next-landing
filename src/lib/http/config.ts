/**
 * HTTP Client Configuration
 *
 * Environment-based configuration for API requests.
 */

export interface HttpClientConfig {
  baseUrl: string;
  timeout: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Load API URL from environment variable.
 * Falls back to localhost:8000 for development.
 */
function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    return envUrl.trim().replace(/\/$/, ''); // Remove trailing slash
  }

  // Default for local development
  console.warn('[HTTP Config] VITE_API_URL not set, using default http://localhost:8000/api/v1');
  return 'http://localhost:8000/api/v1';
}

/**
 * HTTP client configuration loaded from environment.
 */
export const httpConfig: HttpClientConfig = {
  baseUrl: getApiUrl(),
  timeout: DEFAULT_TIMEOUT,
};

/**
 * Check if API URL is configured.
 */
export function isApiConfigured(): boolean {
  return !!import.meta.env.VITE_API_URL;
}