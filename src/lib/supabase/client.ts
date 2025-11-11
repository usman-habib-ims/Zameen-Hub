import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// Custom storage that ONLY uses localStorage, never cookies
const customStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  },
}

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null

export function createClient() {
  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Create new instance only if it doesn't exist
  supabaseInstance = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: customStorageAdapter,
        storageKey: 'zameenhub-auth',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  )

  return supabaseInstance
}
