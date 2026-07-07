/**
 * Admin Authentication Composable
 *
 * Manages admin user state and authentication checks
 */
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AdminUser {
  id: string
  email: string
  isAdmin: boolean
  user: User
}

const currentUser = ref<AdminUser | null>(null)
const isLoading = ref(false)
const hasChecked = ref(false)

export function useAdminAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.isAdmin ?? false)
  const userEmail = computed(() => currentUser.value?.email ?? '')

  /**
   * Check if current user is an admin
   */
  async function checkAdmin(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false
    }

    isLoading.value = true

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        currentUser.value = null
        hasChecked.value = true
        return false
      }

      // Check if user has admin metadata in app_metadata
      // Note: Authorization is ultimately enforced by RLS using auth.users.raw_app_meta_data
      const isAdmin = user.app_metadata?.is_admin === true ||
                      user.app_metadata?.role === 'admin' ||
                      false

      if (isAdmin) {
        currentUser.value = {
          id: user.id,
          email: user.email || '',
          isAdmin: true,
          user,
        }
      } else {
        currentUser.value = null
      }

      hasChecked.value = true
      return isAdmin
    } catch (error) {
      console.error('Error checking admin status:', error)
      currentUser.value = null
      hasChecked.value = true
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign in with email/password
   */
  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase not configured' }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      // Check if admin after sign in
      const isAdmin = await checkAdmin()

      if (!isAdmin) {
        await supabase.auth.signOut()
        return { error: 'Access denied. Admin privileges required.' }
      }

      return { error: null }
    } catch (error: any) {
      return { error: error.message || 'Sign in failed' }
    }
  }

  /**
   * Sign out
   */
  async function signOut(): Promise<void> {
    if (!isSupabaseConfigured()) {
      return
    }

    await supabase.auth.signOut()
    currentUser.value = null
    hasChecked.value = false
  }

  /**
   * Initialize auth listener
   */
  function initAuthListener() {
    if (!isSupabaseConfigured()) {
      hasChecked.value = true
      return
    }

    // Check initial state
    checkAdmin()

    // Listen for auth changes
    supabase.auth.onAuthStateChanged(async (user) => {
      if (user) {
        await checkAdmin()
      } else {
        currentUser.value = null
        hasChecked.value = true
      }
    })
  }

  return {
    // State
    currentUser,
    isLoading,
    hasChecked,

    // Computed
    isAuthenticated,
    isAdmin,
    userEmail,

    // Methods
    checkAdmin,
    signIn,
    signOut,
    initAuthListener,
  }
}