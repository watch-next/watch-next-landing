/**
 * HTTP Error Handler
 *
 * Centralized error handling for API requests.
 */

import type { AxiosError } from 'axios';

export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly code: string | null;
  public readonly data: unknown;

  constructor(
    message: string,
    status: number,
    statusText: string,
    code: string | null = null,
    data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.code = code;
    this.data = data;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'Unauthorized', 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'Forbidden', 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'Not Found', 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error') {
    super(message, 0, 'Network Error', 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Transform Axios error into our custom ApiError.
 */
export function handleApiError(error: unknown): ApiError {
  // Already an ApiError - return as is
  if (error instanceof ApiError) {
    return error;
  }

  // Axios error
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;

    if (axiosError.code === 'ECONNABORTED') {
      return new ApiError(
        'Request timeout',
        408,
        'Request Timeout',
        'TIMEOUT'
      );
    }

    if (axiosError.code === 'ERR_NETWORK') {
      return new NetworkError('Cannot connect to API server');
    }

    const status = axiosError.response?.status || 0;
    const statusText = axiosError.response?.statusText || 'Unknown error';
    const data = axiosError.response?.data;

    // Extract error message from response
    let message = 'An unexpected error occurred';
    if (data && typeof data === 'object') {
      const errorData = data as Record<string, unknown>;
      if (typeof errorData.detail === 'string') {
        message = errorData.detail;
      } else if (typeof errorData.message === 'string') {
        message = errorData.message;
      }
    }

    // Create specific error type based on status
    switch (status) {
      case 401:
        return new UnauthorizedError(message);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message);
      default:
        return new ApiError(message, status, statusText, null, data);
    }
  }

  // Unknown error
  if (error instanceof Error) {
    return new ApiError(error.message, 0, 'Unknown', null);
  }

  return new ApiError('An unexpected error occurred', 0, 'Unknown');
}