import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log configuration status on module load
console.log('[supabase.ts] Supabase config:', {
  url: !!supabaseUrl,
  anon: !!supabaseAnonKey,
  prod: import.meta.env.PROD
})

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Type for authenticated user (future auth support)
export type User = {
  id: string
  email: string
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co')
}