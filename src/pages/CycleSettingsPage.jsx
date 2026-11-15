import { useState, useEffect, useRef } from 'react'
import { useApp } from '../hooks/useAppState'
import { useCycle } from '../hooks/useCycleSettings'
import { AAD_DAYS } from '../data/falajData'
import { getCurrentAadInfo, formatCountdown, deriveCycleStart } from '../utils/cycleEngine'

const MUSCAT = 'Asia/Muscat'
const CYCLE_MS = 12 * 24 * 3600_000

// تحويل تاريخ → قيمة datetime-local بتوقيت عُمان
function toInputVal(d) {
  if (!d) return ''
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: MUSCAT,
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hour12:false
  }).format(d).replace(' ', 'T').slice(0, 16)
}

// تحويل datetime-local → Date بتوقيت عُمان (UTC+4)
function parseMuscatInput(v) {
  if (!v) return null
  return new Date(v + ':00+04:00')
}

// تنسيق تاريخ قصير: "13 نوف 11:30"
function fmtShort(d) {
  if (!d) return '—'
  const date = d.toLocaleDateString('ar-OM', { day:'numeric', month:'short', timeZone:MUSCAT })
  const time = d.toLocaleTimeString('ar-OM', { hour:'2-digit', minute:'2-digit', hour12:false, timeZone:MUSCAT })
  return `${date} ${time}`
}

export default function CycleSettingsPage() {
  const { t, currentUser } = useApp()
  const { cycleStart, settings, saveCycleSettings, dbSynced } = useCycle()

  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const info = cycleStart ? getCurrentAadInfo(cycleStart, now) : null
  const currentCycleNum = info?.cycleNumber || 1

  // ══════════════════════════════════════════════
  // قسم ١: التنقل بين الدورات
  // ══════════════════════════════════════════════
  const [viewCycleNum, setViewCycleNum] = useState(currentCycleNum)
  const [cycleAbdInput, setCycleAbdInput]   = useState('')
  const [cycleSaved, setCycleSaved]         = useState(false)
  const [showAdvanced, setShowAdvanced]     = useState(false)
  const hasInitialized = useRef(false)

  // تهيئة عند أول تحميل للدورة
  useEffect(() => {
    if (cycleStart && !hasInitialized.current) {
      setViewCycleNum(currentCycleNum)
      hasInitialized.current = true
    }
  }, [cycleStart, currentCycleNum])

  // بداية آد عبد في الدورة المُعروضة (محسوبة من الإعداد المحفوظ)
  const viewedCycleAbdStart = cycleStart
    ? new Date(cycleStart.getTime() + (viewCycleNum - 1) * CYCLE_MS)
    : null

  // عند تغيير رقم الدورة، حدّث حقل الإدخال
  useEffect(() => {
    if (viewedCycleAbdStart) {
      setCycleAbdInput(toInputVal(viewedCycleAbdStart))
    } else {
      // لا يوجد إعداد بعد — الافتراضي: اليوم 11:30
      const today = new Date()
      const dateStr = today.toLocaleDateString('en-CA', { timeZone: MUSCAT })
      setCycleAbdInput(dateStr + 'T11:30')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewCycleNum, viewedCycleAbdStart?.getTime()])

  // قراءة الحقل المُعدَّل لبناء جدول الآدات
  const parsedCycleAbdStart = parseMuscatInput(cycleAbdInput)

  const viewedCycleEnd = parsedCycleAbdStart
    ? new Date(parsedCycleAbdStart.getTime() + CYCLE_MS)
    : null

  const viewedAads = parsedCycleAbdStart
    ? AAD_DAYS.map((day, idx) => {
        const start = new Date(parsedCycleAbdStart.getTime() + idx * 24 * 3600_000)
        const end   = new Date(parsedCycleAbdStart.getTime() + (idx + 1) * 24 * 3600_000)
        return {
          day, start, end,
          isNow:  start <= now && now < end,
          isPast: end < now,
        }
      })
    : []

  const isViewingCurrentCycle = viewCycleNum === currentCycleNum
  const isViewingFutureCycle  = viewCycleNum > currentCycleNum

  // حفظ: حساب بداية الدورة الأولى بالرجوع للوراء
  const handleSaveCycleRef = () => {
    if (!cycleAbdInput) return
    const newAbdStart = parseMuscatInput(cycleAbdInput)
    if (!newAbdStart) return
    // بداية الدورة ١ = بداية آد عبد في الدورة N - (N-1) × ١٢ يوم
    const cycle1Start = new Date(newAbdStart.getTime() - (viewCycleNum - 1) * CYCLE_MS)
    saveCycleSettings({
      currentAadId: 'abd',
      aadStartedAt: cycle1Start,
      updatedBy: currentUser.fullName,
    })
    setCycleSaved(true)
    setTimeout(() => setCycleSaved(false), 2500)
  }

  // ══════════════════════════════════════════════
  // قسم ٢ (متقدم): الضبط اليدوي بالآد
  // ══════════════════════════════════════════════
  const [selectedAadId, setSelectedAadId] = useState(
    settings?.currentAadId || AAD_DAYS[0].id
  )
  const [aadStartVal, setAadStartVal] = useState(
    settings?.aadStartedAt ? toInputVal(settings.aadStartedAt) : toInputVal(new Date())
  )
  const [saved, setSaved] = useState(false)

  const previewCycleStart = aadStartVal
    ? deriveCycleStart(selectedAadId, parseMuscatInput(aadStartVal))
    : null
  const previewInfo = previewCycleStart
    ? getCurrentAadInfo(previewCycleStart, now)
    : null

  const handleSave = () => {
    if (!aadStartVal) return
    saveCycleSettings({
      currentAadId: selectedAadId,
      aadStartedAt: parseMuscatInput(aadStartVal),
      updatedBy: currentUser.fullName,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // ══════════════════════════════════════════════
  // الواجهة
  // ══════════════════════════════════════════════
  return (
    <div className="page-content">

      {/* ── بطاقة الحالة الحالية ── */}
      {info ? (
        <div style={{background:'linear-gradient(135deg,#0D1F2D,#1a3a2a)',borderRadius:20,padding:18,color:'#fff',boxShadow:'0 8px 32px rgba(13,31,45,.3)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(74,157,181,.1)'}}/>
          <div style={{fontSize:11,color:'rgba(255,255,255,.45)',marginBottom:4,position:'relative',zIndex:1}}>
            {t('الآد الجاري الآن','Currently active Aad')}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',position:'relative',zIndex:1}}>
            <div>
              <div style={{fontSize:28,fontWeight:700}}>{AAD_DAYS[info.aadIndex]?.name}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)',marginTop:2}}>
                {t('الدورة رقم','Cycle #')}{info.cycleNumber}
              </div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:3}}>{t('المتبقي','Remaining')}</div>
              <div style={{fontSize:24,fontWeight:700,fontFamily:'IBM Plex Mono,monospace',color:'#4A9DB5',textShadow:'0 0 20px rgba(74,157,181,.4)'}}>
                {formatCountdown(info.msRemaining)}
              </div>
            </div>
          </div>
          <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2,overflow:'hidden',margin:'14px 0 4px',position:'relative',zIndex:1}}>
            <div style={{height:'100%',background:'linear-gradient(90deg,#1A6B8A,#4A9DB5)',borderRadius:2,boxShadow:'0 0 8px rgba(74,157,181,.5)',width:`${(info.msElapsed/(24*3600_000))*100}%`,transition:'width 1s linear'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'rgba(255,255,255,.3)',position:'relative',zIndex:1}}>
            <span>11:30 {t('بداية','start')}</span>
            <span>{Math.round((info.msElapsed/(24*3600_000))*100)}% {t('مضت','elapsed')}</span>
            <span>11:30 {t('نهاية','end')}</span>
          </div>
        </div>
      ) : (
        <div className="warn-box">
          <i className="ti ti-alert-circle" style={{fontSize:18,flexShrink:0}}/>
          <span style={{fontWeight:600}}>
            {t('لم تُضبط الدورة بعد — حدد الدورة الحالية أدناه.',
               'Cycle not set yet — select the current cycle below.')}
          </span>
        </div>
      )}

      {/* ── بانر حالة Supabase (يظهر فقط عند الاسترداد أو الغياب) ── */}
      {dbSynced === 'restored' && (
        <div className="info-box" style={{background:'rgba(29,158,117,.08)',borderColor:'rgba(29,158,117,.25)',color:'#1D9E75'}}>
          <i className="ti ti-database-check" style={{fontSize:16,flexShrink:0}}/>
          <span style={{fontSize:12}}>
            {t(
              'تم استرداد إعدادات الدورة من النسخة المحلية وإعادة حفظها في Supabase تلقائياً.',
              'Cycle settings were auto-restored from local backup and re-synced to Supabase.'
            )}
          </span>
        </div>
      )}
      {dbSynced === false && (
        <div className="warn-box">
          <i className="ti ti-database-exclamation" style={{fontSize:16,flexShrink:0}}/>
          <span style={{fontSize:12}}>
            {t(
              'Supabase متاح لكن لا يوجد إعداد محفوظ — حدد الدورة أدناه واحفظها.',
              'Supabase is available but no saved cycle was found — set the cycle below and save.'
            )}
          </span>
        </div>
      )}

      {/* ── بطاقة التنقل بين الدورات ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">{t('تحديد الدورة الحالية','Set Current Cycle')}</div>
            <div style={{fontSize:11,color:'var(--c-stone)',marginTop:2}}>
              {t('تنقل بين الدورات وحدد متى بدأت الدورة الصحيحة',
                 'Browse cycles and set when the correct one started')}
            </div>
          </div>
          <i className="ti ti-rotate" style={{fontSize:20,color:'var(--c-stone)'}}/>
        </div>
        <div className="card-body">

          {/* سيلكتور رقم الدورة */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,background:'var(--surface-2,rgba(44,31,14,.04))',borderRadius:14,padding:'10px 12px'}}>

            {/* زر السابق (رقم أصغر) — على اليمين في RTL */}
            <button
              onClick={() => setViewCycleNum(n => Math.max(1, n - 1))}
              disabled={viewCycleNum <= 1}
              style={{width:36,height:36,borderRadius:10,border:'1.5px solid rgba(44,31,14,.12)',background:'rgba(255,255,255,.8)',color: viewCycleNum<=1 ? 'rgba(44,31,14,.25)' : 'var(--c-soil)',cursor: viewCycleNum<=1 ? 'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <i className="ti ti-chevron-right" style={{fontSize:16}}/>
            </button>

            {/* عرض رقم الدورة والتاريخ */}
            <div style={{textAlign:'center',flex:1,padding:'0 8px'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'center',flexWrap:'wrap'}}>
                <span style={{fontSize:19,fontWeight:700,color:'var(--c-water)'}}>
                  {t('الدورة','Cycle')} {viewCycleNum}
                </span>
                {isViewingCurrentCycle && (
                  <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'rgba(29,158,117,.12)',color:'#1D9E75',fontWeight:600,border:'1px solid rgba(29,158,117,.2)',whiteSpace:'nowrap'}}>
                    {t('الحالية','Current')}
                  </span>
                )}
                {isViewingFutureCycle && (
                  <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'rgba(255,180,0,.12)',color:'#C68B00',fontWeight:600,border:'1px solid rgba(255,180,0,.2)',whiteSpace:'nowrap'}}>
                    {t('قادمة','Future')}
                  </span>
                )}
                {!isViewingCurrentCycle && !isViewingFutureCycle && (
                  <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'rgba(44,31,14,.08)',color:'var(--c-stone)',fontWeight:600,whiteSpace:'nowrap'}}>
                    {t('سابقة','Past')}
                  </span>
                )}
              </div>
              {parsedCycleAbdStart && viewedCycleEnd && (
                <div style={{fontSize:11,color:'var(--c-stone)',marginTop:3,direction:'ltr',fontFamily:'IBM Plex Mono,monospace'}}>
                  {parsedCycleAbdStart.toLocaleDateString('ar-OM',{day:'numeric',month:'short',timeZone:MUSCAT})}
                  {' — '}
                  {viewedCycleEnd.toLocaleDateString('ar-OM',{day:'numeric',month:'short',year:'numeric',timeZone:MUSCAT})}
                </div>
              )}
            </div>

            {/* زر التالي (رقم أكبر) — على اليسار في RTL */}
            <button
              onClick={() => setViewCycleNum(n => n + 1)}
              style={{width:36,height:36,borderRadius:10,border:'1.5px solid rgba(44,31,14,.12)',background:'rgba(255,255,255,.8)',color:'var(--c-soil)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <i className="ti ti-chevron-left" style={{fontSize:16}}/>
            </button>
          </div>

          {/* حقل بداية آد عبد */}
          <div className="form-group">
            <label className="form-label">
              {t('بداية آد عبد في هذه الدورة','Start of Aad Abd in this cycle')}
            </label>
            <input type="datetime-local" className="form-input"
              value={cycleAbdInput}
              onChange={e => setCycleAbdInput(e.target.value)}
              style={{fontFamily:'IBM Plex Mono,monospace',fontSize:13}}/>
            <div className="form-hint">
              {t('عادةً 11:30 صباحاً — عدّل لو بدأت في وقت مختلف فعلياً',
                 'Usually 11:30 AM — adjust if it actually started at a different time')}
            </div>
          </div>

          {/* جدول الآدات في الدورة المُعروضة */}
          {viewedAads.length > 0 && (
            <div style={{borderRadius:12,overflow:'hidden',border:'1px solid rgba(44,31,14,.08)',marginBottom:14}}>
              {viewedAads.map(({ day, start, isNow, isPast }, idx) => (
                <div key={day.id} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'9px 14px',
                  borderBottom: idx < viewedAads.length-1 ? '1px solid rgba(44,31,14,.05)' : 'none',
                  background: isNow ? 'rgba(26,107,138,.06)' : 'transparent',
                  opacity: isPast ? .5 : 1,
                }}>
                  <div style={{
                    width:7, height:7, borderRadius:'50%', flexShrink:0,
                    background: isNow ? '#1A6B8A' : isPast ? '#1D9E75' : 'rgba(44,31,14,.18)',
                    boxShadow: isNow ? '0 0 0 3px rgba(26,107,138,.2)' : 'none',
                  }}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:isNow?700:500,color:isNow?'var(--c-water)':'var(--c-soil)',display:'flex',alignItems:'center',gap:6}}>
                      {day.name}
                      {isNow && (
                        <span style={{fontSize:10,padding:'1px 6px',borderRadius:8,background:'rgba(26,107,138,.1)',color:'var(--c-water)',display:'flex',alignItems:'center',gap:3}}>
                          <span className="dot-live"/>{t('الآن','Now')}
                        </span>
                      )}
                      {isPast && <span style={{fontSize:11,color:'#1D9E75'}}>✓</span>}
                    </div>
                  </div>
                  <div style={{fontSize:11,color: isNow?'var(--c-water)':'var(--c-stone)',fontFamily:'IBM Plex Mono,monospace',direction:'ltr',textAlign:'left',flexShrink:0}}>
                    {fmtShort(start)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* زر الحفظ */}
          <button
            className={`btn ${cycleSaved ? 'btn-palm' : 'btn-primary'} btn-full`}
            onClick={handleSaveCycleRef}
            disabled={!cycleAbdInput || isViewingFutureCycle}>
            <i className={`ti ti-${cycleSaved ? 'check' : 'device-floppy'}`}/>
            {cycleSaved
              ? t('تم الحفظ ✓','Saved ✓')
              : isViewingFutureCycle
                ? t('لا يمكن حفظ دورة مستقبلية','Cannot save a future cycle')
                : t(`حفظ الدورة ${viewCycleNum} كمرجع`, `Save Cycle ${viewCycleNum} as Reference`)}
          </button>

          {settings?.updatedBy && (
            <div style={{marginTop:10,fontSize:11,color:'var(--c-stone)',textAlign:'center'}}>
              <i className="ti ti-clock" style={{fontSize:11,marginLeft:4}}/>
              {t('آخر تحديث:','Last updated:')} {settings.updatedBy}
              {' — '}{settings.updatedAt?.toLocaleString('ar-OM',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:MUSCAT})}
            </div>
          )}
        </div>
      </div>

      {/* ── قسم الضبط اليدوي (قابل للطيّ) ── */}
      <div className="card">
        <button
          onClick={() => setShowAdvanced(v => !v)}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',background:'none',border:'none',cursor:'pointer',color:'var(--c-soil)',textAlign:'right'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <i className="ti ti-adjustments" style={{fontSize:16,color:'var(--c-stone)'}}/>
            <span style={{fontSize:13,fontWeight:600}}>
              {t('ضبط يدوي (متقدم)','Manual Aad Setup (Advanced)')}
            </span>
          </div>
          <i className={`ti ti-chevron-${showAdvanced ? 'up' : 'down'}`} style={{fontSize:14,color:'var(--c-stone)'}}/>
        </button>

        {showAdvanced && (
          <div className="card-body" style={{paddingTop:0,borderTop:'1px solid rgba(44,31,14,.06)'}}>

            <div className="info-box" style={{marginBottom:16}}>
              <i className="ti ti-bulb" style={{fontSize:16,flexShrink:0}}/>
              <span style={{fontSize:12}}>
                {t(
                  'استخدم هذا لو تعرف أي آد نحن فيه الآن بدون معرفة رقم الدورة.',
                  'Use this if you know the current Aad but not the cycle number.'
                )}
              </span>
            </div>

            {/* الخطوة ١: اختيار الآد */}
            <div className="form-group">
              <label className="form-label">
                <span style={{background:'var(--c-water)',color:'#fff',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,marginLeft:6}}>1</span>
                {t('أي آد نحن فيه الآن؟','Which Aad are we in now?')}
              </label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                {AAD_DAYS.map(day => (
                  <button key={day.id}
                    onClick={() => setSelectedAadId(day.id)}
                    style={{
                      padding:'8px 6px', borderRadius:10, fontSize:12, fontWeight:600,
                      border: selectedAadId===day.id ? '2px solid var(--c-water)' : '1.5px solid rgba(44,31,14,.12)',
                      background: selectedAadId===day.id ? 'rgba(26,107,138,.1)' : 'rgba(255,255,255,.7)',
                      color: selectedAadId===day.id ? 'var(--c-water)' : 'var(--c-soil)',
                      cursor:'pointer', transition:'all .15s',
                    }}>
                    {day.name}
                  </button>
                ))}
              </div>
            </div>

            {/* الخطوة ٢: وقت البداية */}
            <div className="form-group">
              <label className="form-label">
                <span style={{background:'var(--c-water)',color:'#fff',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,marginLeft:6}}>2</span>
                {t('متى بدأ هذا الآد؟','When did this Aad start?')}
              </label>
              <input type="datetime-local" className="form-input"
                value={aadStartVal}
                onChange={e => setAadStartVal(e.target.value)}
                style={{fontFamily:'IBM Plex Mono,monospace',fontSize:13}}/>
              <div className="form-hint">
                {t('في الغالب يبدأ كل آد الساعة 11:30 صباحاً','Each Aad typically starts at 11:30 AM')}
              </div>
            </div>

            {/* معاينة */}
            {previewInfo && (
              <div style={{background:'rgba(26,107,138,.06)',borderRadius:14,padding:'12px 14px',marginBottom:14,border:'1px solid rgba(26,107,138,.12)'}}>
                <div style={{fontSize:12,fontWeight:600,color:'var(--c-water)',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
                  <i className="ti ti-eye" style={{fontSize:14}}/>
                  {t('معاينة النتيجة','Result Preview')}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                    <span style={{color:'var(--c-stone)'}}>{t('الآد الحالي:','Current Aad:')}</span>
                    <strong style={{color:'var(--c-water)'}}>{AAD_DAYS[previewInfo.aadIndex]?.name}</strong>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                    <span style={{color:'var(--c-stone)'}}>{t('رقم الدورة:','Cycle #:')}</span>
                    <strong>{previewInfo.cycleNumber}</strong>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                    <span style={{color:'var(--c-stone)'}}>{t('المتبقي من الآد:','Time remaining:')}</span>
                    <strong style={{fontFamily:'IBM Plex Mono,monospace',color:'var(--c-water)'}}>{formatCountdown(previewInfo.msRemaining)}</strong>
                  </div>
                </div>
              </div>
            )}

            <button className={`btn ${saved ? 'btn-palm' : 'btn-primary'} btn-full`}
              onClick={handleSave} disabled={!aadStartVal}>
              <i className={`ti ti-${saved ? 'check' : 'device-floppy'}`}/>
              {saved
                ? t('تم الحفظ والتفعيل ✓','Saved & Activated ✓')
                : t('حفظ وتفعيل الدورة','Save & Activate Cycle')}
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
