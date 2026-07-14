/**
 * Authentication Service
 *
 * Handles user authentication with JWT tokens.
 * Communicates with backend API for:
 * - Register
 * - Login
 * - Logout
 * - Token refresh
 * - Password recovery
 */

import { httpClient, setTokens, clearTokens } from '../http/client';
import type { User } from './types';

// LocalStorage key for user data
const USER_KEY = 'watchnext_user';

// Events for auth state changes
export const AUTH_LOGIN_EVENT = 'auth:login';
export const AUTH_LOGOUT_EVENT = 'auth:logout';

/**
 * Get stored user data.
 */
function getStoredUser(): User | null {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/**
 * Store user data in localStorage.
 */
function setStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    console.warn('[AuthService] Failed to store user in localStorage');
  }
}

/**
 * Register a new user.
 * @param email User email
 * @param password User password
 * @param name User name (optional)
 */
export async function register(
  email: string,
  password: string,
  name?: string
): Promise<{ user: User; message: string }> {
  try {
    const response = await httpClient.post('/auth/register', {
      email,
      password,
      name,
    });

    return {
      user: response.data.user,
      message: response.data.message || 'Registration successful. Please check your email to verify your account.',
    };
  } catch (error) {
    throw error; // Let caller handle the error
  }
}

/**
 * Login with email and password.
 * @param email User email
 * @param password User password
 * @returns User data and tokens
 */
export async function login(
  email: string,
  password: string
): Promise<{ user: User; access_token: string; refresh_token: string }> {
  try {
    const response = await httpClient.post('/auth/login', {
      email,
      password,
    });

    const { user, access_token, refresh_token } = response.data;

    // Store tokens
    setTokens(access_token, refresh_token);

    // Store user
    setStoredUser(user);

    // Dispatch login event
    window.dispatchEvent(new CustomEvent(AUTH_LOGIN_EVENT, { detail: user }));

    return { user, access_token, refresh_token };
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user.
 * Clears tokens and notifies listeners.
 * @param notifyBackend Whether to call backend logout endpoint (default: true)
 */
export async function logout(notifyBackend: boolean = true): Promise<void> {
  try {
    // Optionally notify backend (invalidates refresh token)
    if (notifyBackend) {
      await httpClient.post('/auth/logout').catch(() => {
        // Ignore logout errors - still clear local tokens
      });
    }
  } finally {
    // Always clear local tokens
    clearTokens();
    setStoredUser(null);

    // Dispatch logout event
    window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
  }
}

/**
 * Refresh access token.
 * Called automatically by HTTP client on 401.
 * Can be called manually if needed.
 */
export async function refreshToken(): Promise<{ access_token: string; refresh_token: string }> {
  const refreshToken = localStorage.getItem('watchnext_refresh_token');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await httpClient.post('/auth/refresh', {
    refresh_token: refreshToken,
  });

  const { access_token, refresh_token: newRefreshToken } = response.data;

  // Store new tokens
  setTokens(access_token, newRefreshToken);

  return { access_token, refresh_token: newRefreshToken };
}

/**
 * Get current user data from localStorage.
 * Returns null if not logged in.
 */
export function getCurrentUser(): User | null {
  return getStoredUser();
}

/**
 * Fetch current user data from backend.
 * Use this to validate token and get fresh user data.
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await httpClient.get('/users/me');
    const user = response.data;
    setStoredUser(user);
    return user;
  } catch (error) {
    // Token invalid or user not found
    clearTokens();
    setStoredUser(null);
    return null;
  }
}

/**
 * Check if user is logged in.
 * Does not validate token - just checks presence.
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('watchnext_access_token');
  return !!token;
}

/**
 * Request password reset email.
 * @param email User email
 */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const response = await httpClient.post('/auth/forgot-password', { email });
  return {
    message: response.data.message || 'Password reset link sent to your email.',
  };
}

/**
 * Reset password with token.
 * @param token Reset token from email
 * @param newPassword New password
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await httpClient.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  });
  return {
    message: response.data.message || 'Password reset successfully.',
  };
}

/**
 * Verify email with token.
 * @param token Verification token from email
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await httpClient.post('/auth/verify', { token });
  return {
    message: response.data.message || 'Email verified successfully.',
  };
}

/**
 * Resend verification email.
 * @param email User email
 */
export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const response = await httpClient.post('/auth/resend-verification', { email });
  return {
    message: response.data.message || 'Verification email sent.',
  };
}

/**
 * Export User type for convenience.
 */
export type { User };