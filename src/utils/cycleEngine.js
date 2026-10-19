/**
 * Cycle Engine v2
 * السوبر أدمن يحدد: أي آد نحن فيه الآن + متى بدأ
 * الباقي يُحسب تلقائياً
 */
import { AAD_DAYS, SHARES } from '../data/falajData'

const AAD_DURATION_MS  = 24 * 60 * 60 * 1000   // 24 ساعة
const CYCLE_DURATION_MS = AAD_DAYS.length * AAD_DURATION_MS  // 12 يوم

/**
 * من إعداد السوبر أدمن (currentAadId + aadStartedAt)
 * نحسب: تاريخ بداية آد عبد من الدورة الحالية
 */
export function deriveCycleStart(currentAadId, aadStartedAt) {
  const aadIndex = AAD_DAYS.findIndex(d => d.id === currentAadId)
  if (aadIndex === -1 || !aadStartedAt) return null
  // نرجع للوراء بعدد أيام الآد الحالي
  return new Date(aadStartedAt.getTime() - aadIndex * AAD_DURATION_MS)
}

/**
 * الآد الحالي والتفاصيل بناءً على بداية الدورة والوقت الآن
 */
export function getCurrentAadInfo(cycleStart, now = new Date()) {
  if (!cycleStart) return null
  const totalMs = now - cycleStart
  if (totalMs < 0) return null

  const cycleNumber     = Math.floor(totalMs / CYCLE_DURATION_MS) + 1
  const msInCycle       = totalMs % CYCLE_DURATION_MS
  const aadIndex        = Math.floor(msInCycle / AAD_DURATION_MS)
  const aadId           = AAD_DAYS[aadIndex]?.id
  const msElapsed       = msInCycle % AAD_DURATION_MS
  const msRemaining     = AAD_DURATION_MS - msElapsed
  const aadStartTime    = new Date(now.getTime() - msElapsed)
  const aadEndTime      = new Date(aadStartTime.getTime() + AAD_DURATION_MS)

  return { aadIndex, aadId, aadStartTime, aadEndTime, msElapsed, msRemaining, cycleNumber }
}

/**
 * تحويل وقت نصي "09:30" إلى دقائق من منتصف الليل
 */
function timeStrToMins(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/**
 * حساب الوقت الحقيقي لحصة معينة داخل آد
 * الآد يبدأ 11:30 — أي وقت قبل 11:30 يكون في اليوم التالي
 */
export function resolveShareTimes(aadStartDate, startTimeStr, endTimeStr) {
  const AAD_OFFSET_MINS = 11 * 60 + 30  // 11:30

  const startMins = timeStrToMins(startTimeStr)
  const endMins   = timeStrToMins(endTimeStr)

  // الفرق عن بداية الآد (11:30)
  const startDiff = startMins >= AAD_OFFSET_MINS
    ? startMins - AAD_OFFSET_MINS
    : startMins + 24*60 - AAD_OFFSET_MINS

  let endDiff = endMins >= AAD_OFFSET_MINS
    ? endMins - AAD_OFFSET_MINS
    : endMins + 24*60 - AAD_OFFSET_MINS

  // لو النهاية قبل أو مساوية البداية → النهاية في اليوم التالي
  if (endDiff <= startDiff) endDiff += 24 * 60

  return {
    start: new Date(aadStartDate.getTime() + startDiff * 60_000),
    end:   new Date(aadStartDate.getTime() + endDiff   * 60_000),
  }
}

/**
 * كل أدوار مستفيد في الدورة الحالية مع تواريخ حقيقية
 */
export function getMyTurns(holderId, cycleStart, now = new Date()) {
  if (!cycleStart) return []
  const info = getCurrentAadInfo(cycleStart, now)
  if (!info) return []

  // بداية الدورة الحالية (وليس الأولى)
  const thisCycleStart = new Date(
    cycleStart.getTime() +
    (info.cycleNumber - 1) * CYCLE_DURATION_MS
  )

  return AAD_DAYS.flatMap((day, idx) => {
    const shares = (SHARES[day.id] || []).filter(s => s.holderId === holderId)
    if (!shares.length) return []
    const aadStart = new Date(thisCycleStart.getTime() + idx * AAD_DURATION_MS)
    return shares.map(share => {
      const times  = resolveShareTimes(aadStart, share.startTime, share.endTime)
      const isPast = times.end < now
      const isNow  = times.start <= now && now < times.end
      const isSoon = !isPast && !isNow && (times.start - now) < 24 * 3600_000
      return {
        day, share, aadStart,
        realStart: times.start,
        realEnd:   times.end,
        isPast, isNow, isSoon,
        msUntil: Math.max(0, times.start - now),
      }
    })
  }).sort((a, b) => a.realStart - b.realStart)
}

/** تحويل ميلي ثانية لـ HH:MM:SS */
export function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00'
  const s = Math.floor(ms / 1000)
  return [Math.floor(s/3600), Math.floor((s%3600)/60), s%60]
    .map(n => String(n).padStart(2,'0')).join(':')
}

export function formatDate(date, lang = 'ar') {
  if (!date) return '—'
  return date.toLocaleDateString(lang==='ar'?'ar-OM':'en-OM',
    { weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone:'Asia/Muscat' })
}
