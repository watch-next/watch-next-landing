/**
 * HTTP Client
 *
 * Axios-based HTTP client with:
 * - JWT token injection
 * - Automatic refresh on 401
 * - Error handling
 * - Request/response interceptors
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { httpConfig } from './config';
import { handleApiError, ApiError, UnauthorizedError } from './error-handler';

// Token storage keys
const ACCESS_TOKEN_KEY = 'watchnext_access_token';
const REFRESH_TOKEN_KEY = 'watchnext_refresh_token';

// Token refresh lock to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

/**
 * Get stored access token.
 */
function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Get stored refresh token.
 */
function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store tokens in localStorage.
 */
function setTokens(accessToken: string | null, refreshToken: string | null): void {
  try {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    console.warn('[HTTP Client] Failed to store tokens in localStorage');
  }
}

/**
 * Clear all stored tokens.
 */
function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    console.warn('[HTTP Client] Failed to clear tokens');
  }
}

/**
 * Process queued requests after successful refresh.
 */
function processQueue(error: Error | null = null): void {
  refreshQueue.forEach((callback) => {
    if (error) {
      callback(); // Callback will handle the error
    }
  });
  refreshQueue = [];
}

/**
 * Create Axios instance with default configuration.
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: httpConfig.baseUrl,
  timeout: httpConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - adds JWT token to requests.
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

/**
 * Response interceptor - handles 401 errors and attempts token refresh.
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const apiError = handleApiError(error);

    // Only handle 401 errors for token refresh
    if (!(apiError instanceof UnauthorizedError)) {
      return Promise.reject(apiError);
    }

    // If already refreshing or no refresh token, reject immediately
    const refreshToken = getRefreshToken();
    if (isRefreshing || !refreshToken) {
      clearTokens();
      // Dispatch event for auth state change
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return Promise.reject(apiError);
    }

    // Queue this request for retry after refresh
    return new Promise((resolve, reject) => {
      // Add to queue
      refreshQueue.push(() => {
        // Retry original request with new token
        const originalError = error as any;
        const token = getAccessToken();
        if (token && originalError.config) {
          originalError.config.headers.Authorization = `Bearer ${token}`;
        }
        axiosInstance(originalError.config)
          .then(resolve)
          .catch(reject);
      });

      // Start refresh if not already in progress
      if (!isRefreshing) {
        isRefreshing = true;

        // Call refresh endpoint
        axiosInstance.post('/auth/refresh', { refresh_token: refreshToken })
          .then((response) => {
            const { access_token, refresh_token: newRefreshToken } = response.data;

            // Store new tokens
            setTokens(access_token, newRefreshToken);

            // Process queue with success
            processQueue();

            // Retry original request
            refreshQueue.shift()?.();
          })
          .catch((refreshError) => {
            // Refresh failed - clear tokens and logout
            clearTokens();
            window.dispatchEvent(new CustomEvent('auth:logout'));
            processQueue(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
    });
  }
);

// Export token management functions
export { setTokens, clearTokens, getAccessToken, getRefreshToken };

// Export the configured Axios instance
export const httpClient = axiosInstance;

// Re-export error classes
export { ApiError, UnauthorizedError, ForbiddenError, NotFoundError, NetworkError } from './error-handler';

// Type-safe request methods
export type { AxiosResponse } from 'axios';