import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // Expected until a .env file with real Supabase credentials is added.
  console.warn(
    'Supabase environment variables are missing. Set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY in a .env file (see .env.example). ' +
      'Auth/database features will be unavailable until then.',
  )
}

// Null when not configured so callers can check `isSupabaseConfigured` instead of crashing.
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
