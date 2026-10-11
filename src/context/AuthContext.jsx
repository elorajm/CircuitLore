import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js'
import { AuthContext } from './authContextObject.js'

const CONFIG_ERROR =
  'Authentication is not configured yet. Please contact the site administrator.'

/**
 * Provides the current Supabase auth session to the app and keeps it in sync
 * across browser refreshes and auth state changes (login/logout/token refresh).
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }

    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session)
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async ({ email, password, displayName, requestedRole }) => {
    if (!isSupabaseConfigured) {
      return { error: CONFIG_ERROR }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          // Informational only. Does not grant elevated access — real role
          // authorization requires a server-verified profiles table (Part 2).
          requested_role: requestedRole,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    setSession(data.session)
    return { error: null, needsEmailConfirmation: !data.session }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      return { error: CONFIG_ERROR }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: error.message }
    }

    setSession(data.session)
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return { error: null }
    }

    const { error } = await supabase.auth.signOut()
    if (!error) {
      setSession(null)
    }
    return { error: error ? error.message : null }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    isAuthenticated: Boolean(session),
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
