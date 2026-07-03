import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface DownloadConfig {
  web?: string
  windows?: string
  android?: string
  macos?: string
}

/**
 * Loads download URLs from Supabase configuration.
 * Falls back to environment variables if database is not configured.
 */
export async function loadDownloadConfig(): Promise<DownloadConfig> {
  // If Supabase is not configured, use environment variables
  if (!isSupabaseConfigured()) {
    return {
      web: import.meta.env.VITE_DOWNLOAD_WEB,
      windows: import.meta.env.VITE_DOWNLOAD_WINDOWS,
      android: import.meta.env.VITE_DOWNLOAD_ANDROID,
      macos: import.meta.env.VITE_DOWNLOAD_MACOS,
    }
  }

  try {
    const { data, error } = await supabase
      .from('download_links')
      .select('platform, url')
      .eq('active', true)

    if (error) throw error

    const config: DownloadConfig = {}
    data?.forEach((item: { platform: string; url: string }) => {
      const platform = item.platform.toLowerCase()
      if (platform === 'web') config.web = item.url
      if (platform === 'windows') config.windows = item.url
      if (platform === 'android') config.android = item.url
      if (platform === 'macos') config.macos = item.url
    })

    return config
  } catch (err) {
    console.error('Failed to load download config:', err)
    return {
      web: import.meta.env.VITE_DOWNLOAD_WEB,
      windows: import.meta.env.VITE_DOWNLOAD_WINDOWS,
      android: import.meta.env.VITE_DOWNLOAD_ANDROID,
      macos: import.meta.env.VITE_DOWNLOAD_MACOS,
    }
  }
}