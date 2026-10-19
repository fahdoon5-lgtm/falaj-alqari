import { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react'
import { useApp } from '../hooks/useAppState'
import { useCycle } from '../hooks/useCycleSettings'
import { AAD_DAYS, SHARES } from '../data/falajData'
import { getHolder, formatAtharDuration, initials, openWhatsApp, buildReminderMessage, getAvatar, saveAvatar, removeAvatar } from '../utils/helpers'
import { getCurrentAadInfo, getMyTurns, formatCountdown, formatDate } from '../utils/cycleEngine'

const TRIBE_COLORS = {
  'التوبي':'linear-gradient(135deg,#1A6B8A,#4A9DB5)',
  'الجابري':'linear-gradient(135deg,#2D6A2D,#4A9A4A)',
  'الحضرمي':'linear-gradient(135deg,#8B4513,#A0522D)',
  'الراشدي':'linear-gradient(135deg,#6B3A8A,#9A5AB5)',
  'السليمي':'linear-gradient(135deg,#1A5A6A,#2A8AAA)',
  'الرمضاني':'linear-gradient(135deg,#7A3055,#A84A7A)',
  'default':'linear-gradient(135deg,#1A6B8A,#2D6A2D)',
}

const ProfileCard = memo(function ProfileCard({ user }) {
  const { t } = useApp()
  const holder  = getHolder(user.holderId)
  const ini     = initials(user.fullName)
  const tribe   = holder.tribe || 'default'
  const bg      = TRIBE_COLORS[tribe] || TRIBE_COLORS.default
  const myDays  = AAD_DAYS.filter(d =>
    (SHARES[d.id]||[]).some(s=>s.holderId===user.holderId)
  )
  const fileRef = useRef(null)
  const [avatarUrl, setAvatarUrl] = useState(() => getAvatar(user.holderId))
  const [menuOpen, setMenuOpen]   = useState(false)

  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      saveAvatar(user.holderId, dataUrl)
      setAvatarUrl(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setMenuOpen(false)
  }, [user.holderId])

  const handleRemove = () => {
    removeAvatar(user.holderId)
    setAvatarUrl(null)
    setMenuOpen(false)
  }

  return (
    <div style={{background:'linear-gradient(135deg,#0D1F2D,#1a3a4a,#0a2a1a)',borderRadius:20,padding:18,color:'#fff',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(13,31,45,.25)'}}>
      <div style={{position:'absolute',top:-30,right:-30,width:100,height:100,borderRadius:'50%',background:'rgba(74,157,181,.08)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-20,left:20,width:70,height:70,borderRadius:'50%',background:'rgba(45,106,45,.08)',pointerEvents:'none'}}/>
      <div style={{display:'flex',alignItems:'center',gap:14,position:'relative',zIndex:1}}>

        {/* Avatar — قابل للنقر لتغيير الصورة */}
        <div style={{position:'relative',flexShrink:0}}>
          <div
            onClick={() => setMenuOpen(v => !v)}
            style={{
              width:58, height:58, borderRadius:'50%',
              background: avatarUrl ? 'transparent' : bg,
              color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, fontWeight:700,
              border:'3px solid rgba(255,255,255,.25)',
              boxShadow:'0 4px 16px rgba(0,0,0,.2)',
              cursor:'pointer', overflow:'hidden', position:'relative',
            }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : ini
            }
            {/* طبقة كاميرا عند المرور */}
            <div style={{
              position:'absolute', inset:0, borderRadius:'50%',
              background:'rgba(0,0,0,.45)',
              display:'flex', alignItems:'center', justifyContent:'center',
              opacity: menuOpen ? 1 : 0,
              transition:'opacity .15s',
            }}>
              <i className="ti ti-camera" style={{fontSize:18}}/>
            </div>
          </div>

          {/* قائمة الخيارات */}
          {menuOpen && (
            <div style={{
              position:'absolute', top:66, right:0,
              background:'#fff', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,.18)',
              overflow:'hidden', zIndex:50, minWidth:160,
            }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'10px 14px',border:'none',background:'none',cursor:'pointer',fontSize:12,color:'#1a3a4a',fontFamily:'inherit'}}
              >
                <i className="ti ti-upload" style={{fontSize:15,color:'var(--c-water)'}}/>
                {t('رفع صورة','Upload photo')}
              </button>
              {avatarUrl && (
                <button
                  onClick={handleRemove}
                  style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'10px 14px',border:'none',borderTop:'1px solid rgba(44,31,14,.07)',background:'none',cursor:'pointer',fontSize:12,color:'#c0392b',fontFamily:'inherit'}}
                >
                  <i className="ti ti-trash" style={{fontSize:15}}/>
                  {t('حذف الصورة','Remove photo')}
                </button>
              )}
              <button
                onClick={() => setMenuOpen(false)}
                style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'10px 14px',border:'none',borderTop:'1px solid rgba(44,31,14,.07)',background:'none',cursor:'pointer',fontSize:12,color:'var(--c-stone)',fontFamily:'inherit'}}
              >
                <i className="ti ti-x" style={{fontSize:15}}/>
                {t('إلغاء','Cancel')}
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={onFileChange}/>
        </div>

        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700}}>{user.fullName}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginTop:2}}>
            <i className="ti ti-map-pin" style={{fontSize:11,marginLeft:3}}/>{tribe}
          </div>
          <div style={{display:'flex',gap:7,marginTop:8,flexWrap:'wrap'}}>
            <div style={{background:'rgba(255,255,255,.1)',borderRadius:8,padding:'4px 10px',fontSize:11}}>
              <span style={{color:'rgba(255,255,255,.45)',marginLeft:4}}>{t('الحصة','Share')}</span>
              <span style={{fontWeight:600}}>{holder.name.split(' ').slice(0,3).join(' ')}</span>
            </div>
            <div style={{background:'rgba(74,157,181,.2)',borderRadius:8,padding:'4px 10px',fontSize:11,color:'#9ACFE0'}}>
              <i className="ti ti-calendar" style={{fontSize:11,marginLeft:4}}/>
              {myDays.length} {t('أيام','days')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default function BeneficiaryHome({ onTabChange, onPush }) {
  const { currentUser, t, lang, logReminder } = useApp()
  const { cycleStart } = useCycle()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const info = getCurrentAadInfo(cycleStart, now)

  // P-2: memoize stable turn schedule (realStart/realEnd don't change within a cycle)
  // نُعيد الحساب فقط عند تغيير cycleNumber حتى لا تبقى التواريخ من الدورة السابقة
  const turnSchedule = useMemo(
    () => getMyTurns(currentUser.holderId, cycleStart, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.holderId, cycleStart, info?.cycleNumber]
  )
  // Re-derive time-based flags every tick from cached schedule
  const myTurns = turnSchedule.map(turn => ({
    ...turn,
    isPast:  turn.realEnd < now,
    isNow:   turn.realStart <= now && now < turn.realEnd,
    isSoon:  turn.realEnd >= now && turn.realStart > now && (turn.realStart - now) < 24 * 3600_000,
    msUntil: Math.max(0, turn.realStart - now),
  }))

  const currentAad   = info ? AAD_DAYS[info.aadIndex] : null
  const nextMyTurn   = myTurns.find(t => !t.isPast)
  const currentMyTurn= myTurns.find(t => t.isNow)
  const activeTurn   = currentMyTurn || nextMyTurn

  const handleRemind = () => {
    if (!currentUser.workerPhone) { alert(t('لا يوجد رقم عامل محفوظ','No worker phone saved')); return }
    if (!activeTurn) return
    const msg = buildReminderMessage(
      getHolder(currentUser.holderId).name,
      activeTurn.day.name,
      activeTurn.share.startTime,
      activeTurn.share.endTime,
      activeTurn.share.athars, lang
    )
    openWhatsApp(currentUser.workerPhone, msg)
    logReminder({ channel:'whatsapp', sentAt: now.toISOString(), aad: activeTurn.day.name })
    alert(t('سيتم فتح واتساب ✓','Opening WhatsApp ✓'))
  }

  return (
    <div className="page-content">

      <ProfileCard user={currentUser}/>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-val">{activeTurn?.share.athars ?? '—'}</div>
          <div className="metric-lbl">{t('آثار دوري القادم','Athars next turn')}</div>
          <div className="metric-badge">
            {activeTurn ? <span className="badge badge-sun">{activeTurn.day.name}</span>
              : <span className="badge badge-stone">{t('لا دور قريب','No turn soon')}</span>}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-val" style={{fontSize:18,fontFamily:'IBM Plex Mono,monospace'}}>
            {activeTurn ? activeTurn.share.startTime : '—'}
          </div>
          <div className="metric-lbl">{t('وقت الدور القادم','Next turn time')}</div>
          <div className="metric-badge">
            {activeTurn && !activeTurn.isNow && (
              <span className="badge badge-sun">
                {activeTurn.realStart.toLocaleDateString(lang==='ar'?'ar-OM':'en-OM',{weekday:'short',day:'numeric',month:'short',timeZone:'Asia/Muscat'})}
              </span>
            )}
            {activeTurn?.isNow && <span className="badge badge-palm"><span className="dot-live" style={{marginLeft:4}}/>{t('الآن','Now')}</span>}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-val">{myTurns.length}</div>
          <div className="metric-lbl">{t('أدواري في الدورة','My turns this cycle')}</div>
          <div className="metric-badge"><span className="badge badge-water">{t('دورة كاملة','Full cycle')}</span></div>
        </div>
        <div className="metric-card">
          <div className="metric-val">{currentAad ? info.cycleNumber : '—'}</div>
          <div className="metric-lbl">{t('رقم الدورة الحالية','Current cycle #')}</div>
          <div className="metric-badge">
            {currentAad && <span className="badge badge-stone">{currentAad.name}</span>}
          </div>
        </div>
      </div>

      {/* Current Aad Banner or My Turn Banner */}
      {activeTurn ? (
        <div style={{background:'linear-gradient(135deg,#0D1F2D,#1a3a4a,#0a2a1a)',borderRadius:20,padding:18,color:'#fff',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(13,31,45,.3)'}}>
          <div style={{position:'absolute',top:-40,right:-40,width:140,height:140,borderRadius:'50%',background:'radial-gradient(circle,rgba(74,157,181,.2),transparent 70%)'}}/>
          <div style={{position:'absolute',bottom:-30,left:-30,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(45,106,45,.2),transparent 70%)'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.5)',marginBottom:4}}>
                  {activeTurn.isNow ? t('دورك الآن —','Your turn NOW —') : t('دورك القادم —','Your next turn —')} {activeTurn.day.name}
                </div>
                <div style={{fontSize:30,fontWeight:700,fontFamily:'IBM Plex Mono,monospace',lineHeight:1.1}}>
                  {activeTurn.share.startTime} — {activeTurn.share.endTime}
                </div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.5)',marginTop:4}}>
                  {activeTurn.share.athars} {t('أثر','athars')} · {formatAtharDuration(activeTurn.share.athars)}
                </div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:2}}>
                  {formatDate(activeTurn.realStart, lang)}
                </div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:4}}>
                  {activeTurn.isNow ? t('المتبقي','Remaining') : t('العد التنازلي','Countdown')}
                </div>
                <div style={{fontSize:22,fontWeight:700,fontFamily:'IBM Plex Mono,monospace',color:'#4A9DB5',textShadow:'0 0 20px rgba(74,157,181,.4)'}}>
                  {activeTurn.isNow
                    ? formatCountdown(activeTurn.realEnd - now)
                    : formatCountdown(activeTurn.msUntil)}
                </div>
              </div>
            </div>
            {/* progress bar — only if now */}
            {activeTurn.isNow && (
              <>
                <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2,overflow:'hidden',margin:'12px 0 4px'}}>
                  <div style={{height:'100%',background:'linear-gradient(90deg,#1A6B8A,#4A9DB5)',borderRadius:2,boxShadow:'0 0 8px rgba(74,157,181,.6)',width:`${Math.min(100,((now-activeTurn.realStart)/(activeTurn.realEnd-activeTurn.realStart))*100)}%`,transition:'width 1s linear'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'rgba(255,255,255,.35)'}}>
                  <span>{activeTurn.share.startTime}</span>
                  <span>{activeTurn.share.endTime}</span>
                </div>
              </>
            )}
            <div className="btn-row">
              <button className="btn btn-primary" style={{flex:1,fontSize:12}} onClick={handleRemind}>
                <i className="ti ti-brand-whatsapp"/>{t('تذكير العامل','Remind worker')}
              </button>
              <button className="btn" style={{flex:1,fontSize:12,background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.8)',border:'1px solid rgba(255,255,255,.15)'}} onClick={()=>onTabChange('transparency')}>
                <i className="ti ti-eye"/>{t('كل الحصص','All shares')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Current Aad (no turn for me) */
        currentAad && (
          <div style={{background:'rgba(255,255,255,.9)',borderRadius:20,padding:16,border:'1px solid rgba(44,31,14,.07)',boxShadow:'0 2px 16px rgba(44,31,14,.07)'}}>
            <div style={{fontSize:11,color:'var(--c-stone)',marginBottom:6}}>{t('الآد الجاري حالياً','Currently active Aad')}</div>
            <div style={{fontSize:18,fontWeight:700,color:'var(--c-soil)',marginBottom:4}}>{currentAad.name}</div>
            <div style={{fontSize:12,color:'var(--c-stone)',marginBottom:10}}>
              {t('لا دور لك في هذا الآد','No turn for you in this Aad')}
            </div>
            <div style={{display:'flex',alignItems:'center',justify:'space-between',gap:10}}>
              <div style={{flex:1,height:4,background:'rgba(44,31,14,.08)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',background:'var(--c-water-mid)',borderRadius:2,width:`${Math.min(100,(info.msElapsed/(24*3600000))*100)}%`}}/>
              </div>
              <span style={{fontSize:11,fontFamily:'IBM Plex Mono,monospace',color:'var(--c-water)',fontWeight:600}}>
                {formatCountdown(info.msRemaining)}
              </span>
            </div>
          </div>
        )
      )}

      {/* My turns timeline */}
      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('أدواري في هذه الدورة','My turns this cycle')}</span>
          <span className="card-link" onClick={()=>onTabChange('cycle')}>{t('التفاصيل','Details')}</span>
        </div>
        <div className="card-body">
          <div className="timeline">
            {myTurns.slice(0,5).map((turn, i) => (
              <div className="tl-item" key={i}>
                <div className="tl-left">
                  <div className="tl-dot" style={{
                    background: turn.isPast?'#1D9E75':turn.isNow?'#1A6B8A':turn.isSoon?'#C8841A':'rgba(44,31,14,.15)',
                    boxShadow: turn.isNow?'0 0 0 3px rgba(26,107,138,.2)':turn.isSoon?'0 0 0 2px rgba(200,132,26,.2)':'none',
                  }}/>
                  {i < Math.min(myTurns.length,5)-1 && <div className="tl-line"/>}
                </div>
                <div className="tl-body">
                  <div className="tl-name" style={{color:turn.isNow?'var(--c-water)':turn.isSoon?'var(--c-sun)':'var(--c-soil)'}}>
                    {turn.day.name}
                    {turn.isNow && <span style={{fontSize:10,marginRight:6,color:'var(--c-water)'}}> ← {t('الآن','Now')}</span>}
                    {turn.isSoon && !turn.isNow && <span style={{fontSize:10,marginRight:6,color:'var(--c-sun)'}}> ← {t('قريباً','Soon')}</span>}
                  </div>
                  <div className="tl-time">
                    {turn.isPast
                      ? t('مضى','Passed')
                      : formatDate(turn.realStart, lang).replace(/،/g,'')}
                  </div>
                  <span className={`tl-pill${turn.isNow?' water':''}`}>
                    {turn.share.athars} {t('أثر','athars')} · {turn.share.startTime}–{turn.share.endTime}
                    {!turn.isPast && !turn.isNow && ` · ${formatCountdown(turn.msUntil)}`}
                  </span>
                </div>
              </div>
            ))}
            {myTurns.length === 0 && (
              <div style={{textAlign:'center',padding:'20px',color:'var(--c-stone)',fontSize:13}}>
                {t('لا أدوار في هذه الدورة','No turns this cycle')}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
