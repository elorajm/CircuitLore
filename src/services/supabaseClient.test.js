import { describe, it, expect, afterEach, vi } from 'vitest'

// Each test stubs env vars explicitly and re-imports the module fresh, so the
// result never depends on whether a real .env file happens to exist locally.
afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('supabaseClient', () => {
  it('does not crash and reports as unconfigured when env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { supabase, isSupabaseConfigured } = await import('./supabaseClient.js')

    expect(isSupabaseConfigured).toBe(false)
    expect(supabase).toBeNull()
  })

  it('initializes a client when env vars are present', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-placeholder-anon-key')

    const { supabase, isSupabaseConfigured } = await import('./supabaseClient.js')

    expect(isSupabaseConfigured).toBe(true)
    expect(supabase).not.toBeNull()
  })
})
