/**
 * إعدادات الدورة:
 * - أي آد نحن فيه الآن (currentAadId)
 * - متى بدأ هذا الآد (aadStartedAt)
 * من هذين يُحسب كل شيء
 */
import { createContext, useContext, useState } from 'react'
import { deriveCycleStart } from '../utils/cycleEngine'
import { AAD_DAYS } from '../data/falajData'

const CycleCtx = createContext(null)
export const useCycle = () => useContext(CycleCtx)

function load() {
  try {
    const saved = localStorage.getItem('falaj_cycle_v2')
    if (!saved) return null
    const { currentAadId, aadStartedAt, updatedBy, updatedAt } = JSON.parse(saved)
    return {
      currentAadId,
      aadStartedAt: new Date(aadStartedAt),
      updatedBy,
      updatedAt: new Date(updatedAt),
    }
  } catch { return null }
}

export function CycleProvider({ children }) {
  const [settings, setSettings] = useState(() => load())

  // cycleStart يُحسب من الإعدادات
  const cycleStart = settings
    ? deriveCycleStart(settings.currentAadId, settings.aadStartedAt)
    : null

  const saveCycleSettings = ({ currentAadId, aadStartedAt, updatedBy }) => {
    const now = new Date()
    const next = { currentAadId, aadStartedAt, updatedBy, updatedAt: now }
    setSettings(next)
    try {
      localStorage.setItem('falaj_cycle_v2', JSON.stringify({
        ...next,
        aadStartedAt: aadStartedAt.toISOString(),
        updatedAt: now.toISOString(),
      }))
    } catch {}
  }

  return (
    <CycleCtx.Provider value={{ cycleStart, settings, saveCycleSettings }}>
      {children}
    </CycleCtx.Provider>
  )
}
