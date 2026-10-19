import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  console.warn('[athar] Supabase env vars missing — running in offline mode')
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'placeholder-anon-key',
  {
    auth: { persistSession: false }, // we handle sessions ourselves
    realtime: { params: { eventsPerSecond: 10 } },
  }
)

export const SUPABASE_READY = !!(supabaseUrl && supabaseAnon)
