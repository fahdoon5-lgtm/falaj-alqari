/**
 * إعدادات الدورة:
 * - أي آد نحن فيه الآن (currentAadId)
 * - متى بدأ هذا الآد (aadStartedAt)
 * من هذين يُحسب كل شيء
 *
 * التخزين: Supabase (cycle_settings) أولاً، localStorage احتياطي
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { deriveCycleStart } from '../utils/cycleEngine'
import { AAD_DAYS } from '../data/falajData'
import { supabase, SUPABASE_READY } from '../lib/supabase'

const CycleCtx = createContext(null)
export const useCycle = () => useContext(CycleCtx)

const LS_KEY = 'falaj_cycle_v2'

function parseSettings(row) {
  if (!row) return null
  const { current_aad_id, aad_started_at, updated_by, updated_at } = row
  if (!AAD_DAYS.find(d => d.id === current_aad_id)) return null
  const parsedStart = new Date(aad_started_at)
  if (isNaN(parsedStart.getTime())) return null
  return {
    currentAadId: current_aad_id,
    aadStartedAt: parsedStart,
    updatedBy: updated_by,
    updatedAt: new Date(updated_at),
  }
}

function loadFromLS() {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (!saved) return null
    const { currentAadId, aadStartedAt, updatedBy, updatedAt } = JSON.parse(saved)
    if (!AAD_DAYS.find(d => d.id === currentAadId)) return null
    const parsedStart = new Date(aadStartedAt)
    if (isNaN(parsedStart.getTime())) return null
    return { currentAadId, aadStartedAt: parsedStart, updatedBy, updatedAt: new Date(updatedAt) }
  } catch { return null }
}

function saveToLS(settings) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      ...settings,
      aadStartedAt: settings.aadStartedAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    }))
  } catch {}
}

export function CycleProvider({ children }) {
  // ابدأ من localStorage حتى يحمّل Supabase
  const [settings, setSettings] = useState(() => loadFromLS())
  const [loading, setLoading] = useState(SUPABASE_READY)

  // قراءة الإعداد من Supabase عند التحميل
  useEffect(() => {
    if (!SUPABASE_READY) return
    let cancelled = false

    async function fetchSettings() {
      const { data, error } = await supabase
        .from('cycle_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      if (cancelled) return
      if (error) { setLoading(false); return }

      const parsed = parseSettings(data)
      if (parsed) {
        setSettings(parsed)
        saveToLS(parsed)
      }
      setLoading(false)
    }

    fetchSettings()
    return () => { cancelled = true }
  }, [])

  // الاشتراك في التغييرات اللحظية — حتى تُحدَّث الشاشة فور حفظ الأدمن
  useEffect(() => {
    if (!SUPABASE_READY) return
    const ch = supabase
      .channel('cycle_settings_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cycle_settings' },
        (payload) => {
          const parsed = parseSettings(payload.new)
          if (parsed) {
            setSettings(parsed)
            saveToLS(parsed)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // cycleStart يُحسب من الإعدادات
  const cycleStart = settings
    ? deriveCycleStart(settings.currentAadId, settings.aadStartedAt)
    : null

  const saveCycleSettings = async ({ currentAadId, aadStartedAt, updatedBy }) => {
    const now = new Date()
    const next = { currentAadId, aadStartedAt, updatedBy, updatedAt: now }

    // تحديث فوري في الواجهة
    setSettings(next)
    saveToLS(next)

    // حفظ في Supabase (upsert صف واحد id=1)
    if (SUPABASE_READY) {
      await supabase.from('cycle_settings').upsert({
        id: 1,
        current_aad_id: currentAadId,
        aad_started_at: aadStartedAt.toISOString(),
        updated_by: updatedBy,
        updated_at: now.toISOString(),
      })
    }
  }

  return (
    <CycleCtx.Provider value={{ cycleStart, settings, saveCycleSettings, loading }}>
      {children}
    </CycleCtx.Provider>
  )
}
