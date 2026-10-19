import { SHARE_HOLDERS } from '../data/falajData'

export function getHolder(id) {
  return SHARE_HOLDERS.find(s => s.id === id) || { name: '—', tribe: '—' }
}

export function initials(name) {
  return name
    .replace(/ورثة|أبناء|ابناء/g, '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
}

export function atharToMinutes(athars) {
  return Math.round(athars * 15)
}

export function formatAtharDuration(athars) {
  const mins = atharToMinutes(athars)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} دقيقة`
  if (m === 0) return `${h} ساعة`
  return `${h}س ${m}د`
}

export function holderColor(id) {
  const colors = [
    '#1A6B8A','#2D6A2D','#C8841A','#8B3A62',
    '#5C3D1E','#0D4F6A','#4A9DB5','#6B4A2D',
    '#3A6B8A','#8A3A2D','#2D8A6B','#6B2D8A',
  ]
  const idx = parseInt(id.replace('sh',''), 10) % colors.length
  return colors[idx]
}

export function openWhatsApp(phone, message) {
  const clean = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${clean}?text=${encoded}`, '_blank')
}

export function buildReminderMessage(holderName, aadName, startTime, endTime, athars, lang='ar') {
  if (lang === 'ar') {
    return `السلام عليكم،\nتذكير بموعد الفلج:\n📅 ${aadName}\n⏰ ${startTime} – ${endTime}\n💧 ${athars} أثر\nالرجاء الاستعداد. شكراً.`
  }
  return `As-salamu alaykum,\nFalaj reminder:\n📅 ${aadName}\n⏰ ${startTime} – ${endTime}\n💧 ${athars} athars\nPlease prepare. Thank you.`
}

// ══ Avatar storage (localStorage, base64) ══
const AVATAR_KEY = (holderId) => `falaj_avatar_${holderId}`

export function getAvatar(holderId) {
  if (!holderId) return null
  try { return localStorage.getItem(AVATAR_KEY(holderId)) || null }
  catch { return null }
}

export function saveAvatar(holderId, dataUrl) {
  if (!holderId) return
  try { localStorage.setItem(AVATAR_KEY(holderId), dataUrl) }
  catch { /* quota exceeded — ignore */ }
}

export function removeAvatar(holderId) {
  if (!holderId) return
  try { localStorage.removeItem(AVATAR_KEY(holderId)) }
  catch {}
}

export function relTypeLabel(type, lang='ar') {
  const map = {
    son:        { ar:'ابن / ابنة',      en:'Son / Daughter'   },
    grandson:   { ar:'حفيد / حفيدة',    en:'Grandchild'       },
    heir:       { ar:'وارث',            en:'Heir'             },
    agent:      { ar:'وكيل / مفوَّض',   en:'Agent'            },
    individual: { ar:'صاحب الحصة',      en:'Shareholder'      },
  }
  return map[type]?.[lang] || type
}
