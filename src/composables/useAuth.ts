/**
 * Authentication Composable
 *
 * Vue 3 composable for managing authentication state.
 * Provides reactive user state and authentication methods.
 *
 * Usage:
 * ```vue
 * <script setup lang="ts">
 * import { useAuth } from '@/composables/useAuth';
 *
 * const { user, isAuthenticated, isLoading, login, logout } = useAuth();
 * </script>
 * ```
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import * as authService from '@/services/authService';
import type { User } from '@/services/types';
import { getAccessToken } from '@/lib/http/client';

// Global state (shared across component instances)
const currentUser = ref<User | null>(null);
const isLoading = ref(false);
const hasCheckedAuth = ref(false);
const isInitialized = ref(false);

/**
 * Authentication composable.
 */
export function useAuth() {
  // Computed properties
  const user = computed(() => currentUser.value);
  const isAuthenticated = computed(() => currentUser.value !== null);
  const isLoadingAuth = computed(() => isLoading.value);
  const isAuthChecked = computed(() => hasCheckedAuth.value);

  /**
   * Initialize authentication state.
   * Checks if user has valid token and loads user data.
   */
  async function initAuth(): Promise<boolean> {
    if (isInitialized.value) {
      return !!currentUser.value;
    }

    isLoading.value = true;

    try {
      // Check if we have an access token
      const token = getAccessToken();
      const storedUser = authService.getCurrentUser();

      if (token && storedUser) {
        // We have token and user - assume valid until proven otherwise
        // Token validation happens on first API call
        currentUser.value = storedUser;
        hasCheckedAuth.value = true;
        return true;
      }

      // No token or user - not authenticated
      currentUser.value = null;
      hasCheckedAuth.value = true;
      return false;
    } catch (error) {
      console.error('[useAuth] Failed to initialize auth:', error);
      currentUser.value = null;
      hasCheckedAuth.value = true;
      return false;
    } finally {
      isLoading.value = false;
      isInitialized.value = true;
    }
  }

  /**
   * Login with email and password.
   */
  async function login(email: string, password: string): Promise<User> {
    isLoading.value = true;

    try {
      const response = await authService.login(email, password);
      currentUser.value = response.user;
      return response.user;
    } finally {
      isLoading.value = false;
      hasCheckedAuth.value = true;
    }
  }

  /**
   * Register a new user.
   */
  async function register(
    email: string,
    password: string,
    name?: string
  ): Promise<{ user: User; message: string }> {
    isLoading.value = true;

    try {
      const result = await authService.register(email, password, name);
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout user.
   */
  async function logout(): Promise<void> {
    isLoading.value = true;

    try {
      await authService.logout(true);
      currentUser.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Force refresh user data from backend.
   * Useful after profile updates.
   */
  async function refreshUser(): Promise<User | null> {
    try {
      const response = await authService.fetchCurrentUser();
      if (response) {
        currentUser.value = response;
      }
      return currentUser.value;
    } catch (error) {
      console.error('[useAuth] Failed to refresh user:', error);
      currentUser.value = null;
      return null;
    }
  }

  /**
   * Clear authentication state.
   * Does not call backend logout.
   */
  function clearState(): void {
    currentUser.value = null;
    hasCheckedAuth.value = true;
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoadingAuth,
    isAuthChecked,

    // Methods
    initAuth,
    login,
    register,
    logout,
    refreshUser,
    clearState,
  };
}

// Export for direct use (optional)
export { currentUser, isAuthenticated, initAuth } from './authService';