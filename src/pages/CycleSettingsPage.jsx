import { useState, useEffect } from 'react'
import { useApp } from '../hooks/useAppState'
import { useCycle } from '../hooks/useCycleSettings'
import { AAD_DAYS } from '../data/falajData'
import { getCurrentAadInfo, formatCountdown, deriveCycleStart } from '../utils/cycleEngine'

const MUSCAT = 'Asia/Muscat'

// تحويل تاريخ → قيمة datetime-local بتوقيت عُمان (بغض النظر عن توقيت الجهاز)
function toInputVal(d) {
  if (!d) return ''
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: MUSCAT,
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hour12:false
  }).format(d).replace(' ', 'T').slice(0, 16)
}

// تحويل قيمة datetime-local → Date، مع اعتبار الإدخال بتوقيت عُمان
function parseMuscatInput(v) {
  if (!v) return null
  return new Date(v + ':00+04:00')  // UTC+4 = عُمان
}

export default function CycleSettingsPage() {
  const { t, currentUser } = useApp()
  const { cycleStart, settings, saveCycleSettings } = useCycle()

  // الإعداد المختار
  const [selectedAadId, setSelectedAadId] = useState(
    settings?.currentAadId || AAD_DAYS[0].id
  )
  const [aadStartVal, setAadStartVal] = useState(
    settings?.aadStartedAt ? toInputVal(settings.aadStartedAt) : toInputVal(new Date())
  )
  const [saved, setSaved]   = useState(false)
  const [now, setNow]       = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // معاينة حقيقية من الإدخال (نفسّر القيمة كتوقيت عُمان)
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
      aadStartedAt: parseMuscatInput(aadStartVal),  // دائماً UTC+4
      updatedBy: currentUser.fullName,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const info = cycleStart ? getCurrentAadInfo(cycleStart, now) : null

  // جدول الآدات بناءً على الإعداد الحالي المحفوظ
  const schedule = cycleStart ? AAD_DAYS.map((day, idx) => {
    const cycleNum   = info?.cycleNumber || 1
    const thisStart  = new Date(cycleStart.getTime() + (cycleNum-1)*12*24*3600_000 + idx*24*3600_000)
    const thisEnd    = new Date(thisStart.getTime() + 24*3600_000)
    return {
      day,
      start: thisStart,
      end: thisEnd,
      isNow: thisStart <= now && now < thisEnd,
      isPast: thisEnd < now,
    }
  }) : []

  return (
    <div className="page-content">

      {/* الحالة الحالية */}
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
          {/* progress bar */}
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
            {t('لم يتم ضبط الدورة بعد — حدد الآد الحالي أدناه لتفعيل التطبيق.',
               'Cycle not set yet — select the current Aad below to activate the app.')}
          </span>
        </div>
      )}

      {/* إعداد الدورة */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">{t('ضبط الآد الحالي','Set Current Aad')}</div>
            <div style={{fontSize:11,color:'var(--c-stone)',marginTop:2}}>
              {t('اختر أي آد نحن فيه الآن ومتى بدأ','Choose which Aad is active now and when it started')}
            </div>
          </div>
          <i className="ti ti-settings" style={{fontSize:20,color:'var(--c-stone)'}}/>
        </div>
        <div className="card-body">

          <div className="info-box" style={{marginBottom:16}}>
            <i className="ti ti-bulb" style={{fontSize:16,flexShrink:0}}/>
            <span style={{fontSize:12}}>
              {t(
                'مثال: لو الآن في آد قيس وبدأ اليوم الساعة 11:30 — اختر "آد قيس" وحدد وقت البداية. التطبيق يحسب باقي الدورة تلقائياً.',
                'Example: if we\'re in Aad Qais and it started today at 11:30 — select "Aad Qais" and set the start time. The app calculates the rest.'
              )}
            </span>
          </div>

          {/* Step 1: اختر الآد */}
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

          {/* Step 2: متى بدأ */}
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
              <div style={{fontSize:12,fontWeight:600,color:'var(--c-water)',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                <i className="ti ti-eye" style={{fontSize:14}}/>
                {t('معاينة النتيجة','Result Preview')}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                  <span style={{color:'var(--c-stone)'}}>{t('الآد الحالي حسب الحساب:','Current Aad by calculation:')}</span>
                  <strong style={{color:'var(--c-water)'}}>{AAD_DAYS[previewInfo.aadIndex]?.name}</strong>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                  <span style={{color:'var(--c-stone)'}}>{t('رقم الدورة:','Cycle number:')}</span>
                  <strong>{previewInfo.cycleNumber}</strong>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                  <span style={{color:'var(--c-stone)'}}>{t('المتبقي من الآد:','Time remaining in Aad:')}</span>
                  <strong style={{fontFamily:'IBM Plex Mono,monospace',color:'var(--c-water)'}}>{formatCountdown(previewInfo.msRemaining)}</strong>
                </div>
              </div>
            </div>
          )}

          <button className={`btn ${saved?'btn-palm':'btn-primary'} btn-full`}
            onClick={handleSave} disabled={!aadStartVal}>
            <i className={`ti ti-${saved?'check':'device-floppy'}`}/>
            {saved
              ? t('تم الحفظ والتفعيل ✓','Saved & Activated ✓')
              : t('حفظ وتفعيل الدورة','Save & Activate Cycle')}
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

      {/* جدول الدورة */}
      {schedule.length > 0 && (
        <div className="card">
          <div className="card-head">
            <span className="card-title">{t('جدول الدورة الحالية','Current Cycle Schedule')}</span>
            <span className="badge badge-water">{t('12 يوماً','12 days')}</span>
          </div>
          <div style={{maxHeight:380,overflowY:'auto'}}>
            {schedule.map(({ day, start, end, isNow, isPast }) => (
              <div key={day.id} style={{
                display:'flex',alignItems:'center',gap:12,
                padding:'10px 16px',
                borderBottom:'1px solid rgba(44,31,14,.05)',
                background: isNow ? 'rgba(26,107,138,.06)' : 'transparent',
                opacity: isPast ? .5 : 1,
              }}>
                <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
                  background: isNow?'#1A6B8A':isPast?'#1D9E75':'rgba(44,31,14,.15)',
                  boxShadow: isNow?'0 0 0 3px rgba(26,107,138,.2)':'none',
                }}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:isNow?700:500,color:isNow?'var(--c-water)':'var(--c-soil)',display:'flex',alignItems:'center',gap:6}}>
                    {day.name}
                    {isNow && <span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'rgba(26,107,138,.1)',color:'var(--c-water)',display:'flex',alignItems:'center',gap:3}}>
                      <span className="dot-live"/>{t('الآن','Now')}
                    </span>}
                    {isPast && <span style={{fontSize:11,color:'#1D9E75'}}>✓</span>}
                  </div>
                  <div style={{fontSize:11,color:'var(--c-stone)',marginTop:1,fontFamily:'IBM Plex Mono,monospace'}}>
                    {start.toLocaleDateString('ar-OM',{weekday:'short',day:'numeric',month:'short',timeZone:MUSCAT})}
                    {' '}{start.toLocaleTimeString('ar-OM',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:MUSCAT})}
                  </div>
                </div>
                <span style={{fontSize:11,fontFamily:'IBM Plex Mono,monospace',color:isNow?'var(--c-water)':'var(--c-stone)',fontWeight:isNow?700:400}}>
                  {isNow ? formatCountdown(end-now) : isPast ? t('انتهى','Done') : t('لاحقاً','Later')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
