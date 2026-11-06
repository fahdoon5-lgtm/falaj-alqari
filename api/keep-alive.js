import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
    const { error } = await supabase.from('app_users').select('id').limit(1)
    if (error) {
      return res.status(500).json({ ok: false, error: error.message, ts: new Date().toISOString() })
    }
    return res.status(200).json({ ok: true, ts: new Date().toISOString() })
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err), ts: new Date().toISOString() })
  }
}
