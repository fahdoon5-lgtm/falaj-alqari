import { useState, useEffect } from 'react'
import { useApp } from '../hooks/useAppState'
import { useCycle } from '../hooks/useCycleSettings'
import { AAD_DAYS, SHARES } from '../data/falajData'
import { getHolder, holderColor, initials } from '../utils/helpers'
import { getCurrentAadInfo, resolveShareTimes, formatCountdown } from '../utils/cycleEngine'

export default function TransparencyPage() {
  const { currentUser, t } = useApp()
  const { cycleStart } = useCycle()
  const [now, setNow] = useState(() => new Date())

  // تحديث الوقت كل ثانية حتى لا تتجمد مؤشرات "الآن"
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const info = getCurrentAadInfo(cycleStart, now)

  // Live current Aad and currently-active slot
  const CURRENT_AAD = info?.aadId ?? null
  let NOW_ORDER = null
  let nowTimes = null
  if (info && CURRENT_AAD) {
    const aadShares = SHARES[CURRENT_AAD] || []
    for (const s of aadShares) {
      const times = resolveShareTimes(info.aadStartTime, s.startTime, s.endTime)
      if (times.start <= now && now < times.end) { NOW_ORDER = s.order; nowTimes = times; break }
    }
  }

  // صاحب الدور الآن
  const nowShare  = NOW_ORDER != null ? (SHARES[CURRENT_AAD] || []).find(s => s.order === NOW_ORDER) : null
  const nowHolder = nowShare ? getHolder(nowShare.holderId) : null
  const nowColor  = nowShare ? holderColor(nowShare.holderId) : '#1A6B8A'
  const nowIni    = nowHolder ? initials(nowHolder.name) : '?'
  const isMyTurn  = nowShare?.holderId === currentUser?.holderId

  const [selectedAad, setSelectedAad] = useState(CURRENT_AAD || (AAD_DAYS[0]?.id ?? ''))

  // تتبع الآد الجاري تلقائياً عند انتقاله (مرة كل 24 ساعة)
  useEffect(() => {
    if (CURRENT_AAD) setSelectedAad(CURRENT_AAD)
  }, [CURRENT_AAD])
  const [query, setQuery] = useState('')

  const shares = SHARES[selectedAad] || []
  const filtered = query
    ? shares.filter(s => getHolder(s.holderId).name.includes(query))
    : shares

  const total = filtered.reduce((sum, s) => sum + s.athars, 0)

  const rowClass = (s) => {
    if (s.holderId === currentUser?.holderId) return 'row-me'
    if (s.order === NOW_ORDER && selectedAad === CURRENT_AAD) return 'row-now'
    if (s.order < NOW_ORDER && selectedAad === CURRENT_AAD) return 'row-done'
    return ''
  }

  const statusBadge = (s) => {
    if (s.holderId === currentUser?.holderId)
      return <span className="badge badge-me">{t('دوري','My turn')}</span>
    if (s.order === NOW_ORDER && selectedAad === CURRENT_AAD)
      return <span className="badge badge-sun"><span className="dot-live" style={{marginLeft:4}}/>{t('الآن','Now')}</span>
    if (s.order < NOW_ORDER && selectedAad === CURRENT_AAD)
      return <span className="badge badge-stone">{t('انتهى','Done')}</span>
    return <span className="badge badge-stone">{t('لاحقاً','Later')}</span>
  }

  return (
    <div className="page-content">

      {/* ══ بانر صاحب الدور الحالي ══ */}
      {cycleStart && (
        <div style={{
          background: 'linear-gradient(135deg,#0D1F2D,#1a3a4a,#0a2a1a)',
          borderRadius: 20, padding: 18, color: '#fff',
          boxShadow: '0 8px 32px rgba(13,31,45,.3)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{position:'absolute',top:-30,right:-30,width:110,height:110,borderRadius:'50%',background:'rgba(74,157,181,.1)',pointerEvents:'none'}}/>
          <div style={{fontSize:11, color:'rgba(255,255,255,.45)', marginBottom:8, display:'flex', alignItems:'center', gap:6}}>
            <span className="dot-live"/>
            {t('الدور الجاري الآن','Currently on duty')}
            {info && <span style={{marginRight:'auto', fontFamily:'IBM Plex Mono,monospace', fontSize:11, color:'rgba(255,255,255,.35)'}}>
              {AAD_DAYS.find(d=>d.id===CURRENT_AAD)?.name}
            </span>}
          </div>

          {nowHolder ? (
            <div style={{display:'flex', alignItems:'center', gap:14, position:'relative', zIndex:1}}>
              <div style={{
                width:54, height:54, borderRadius:'50%', flexShrink:0,
                background: isMyTurn ? 'linear-gradient(135deg,#1A6B8A,#4A9DB5)' : nowColor,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, fontWeight:700, color:'#fff',
                border: isMyTurn ? '3px solid rgba(74,157,181,.6)' : '2px solid rgba(255,255,255,.2)',
                boxShadow: isMyTurn ? '0 0 20px rgba(74,157,181,.5)' : 'none',
              }}>{nowIni}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16, fontWeight:700, lineHeight:1.2}}>
                  {isMyTurn && <span style={{fontSize:11, color:'#4A9DB5', marginLeft:6}}>{t('(أنت)','(You)')}</span>}
                  {nowHolder.name}
                </div>
                <div style={{fontSize:12, color:'rgba(255,255,255,.5)', marginTop:3, fontFamily:'IBM Plex Mono,monospace'}}>
                  {nowShare.startTime} — {nowShare.endTime}
                  <span style={{marginRight:10, color:'rgba(255,255,255,.3)'}}>·</span>
                  {nowShare.athars} {t('أثر','athars')}
                </div>
              </div>
              <div style={{textAlign:'center', flexShrink:0}}>
                <div style={{fontSize:9, color:'rgba(255,255,255,.35)', marginBottom:3}}>{t('المتبقي','Remaining')}</div>
                <div style={{fontSize:20, fontWeight:700, fontFamily:'IBM Plex Mono,monospace', color:'#4A9DB5', textShadow:'0 0 16px rgba(74,157,181,.4)'}}>
                  {nowTimes ? formatCountdown(nowTimes.end - now) : '—'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{fontSize:14, color:'rgba(255,255,255,.45)', textAlign:'center', padding:'8px 0', position:'relative', zIndex:1}}>
              {cycleStart
                ? t('لا يوجد دور جارٍ حالياً — ربما فترة انتقال','No active slot right now — transition period')
                : t('لم يتم ضبط الدورة بعد','Cycle not configured yet')}
            </div>
          )}
        </div>
      )}

      <div className="info-box">
        <i className="ti ti-eye" style={{fontSize:16, flexShrink:0, marginTop:1}} aria-hidden="true"/>
        <span>{t('صفحة الشفافية — للاطلاع فقط. تعرض حصص جميع المستفيدين لضمان وضوح الحقوق.',
                   'Transparency page — read only. Shows all beneficiary shares for clarity.')}</span>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">{t('حصص فلج القري — الدورة الكاملة','Falaj Al-Qari Shares — Full Cycle')}</div>
            <div style={{fontSize:11, color:'var(--c-stone)', marginTop:2}}>
              {t('اختر يوم الآد لعرض توزيعه','Select an Aad day to view its distribution')}
            </div>
          </div>
          {selectedAad === CURRENT_AAD && (
            <span className="badge badge-sun"><span className="dot-live" style={{marginLeft:4}}/>{t('جارٍ الآن','Live now')}</span>
          )}
        </div>

        <div className="card-body">
          <div className="aad-tabs">
            {AAD_DAYS.map(day => (
              <button
                key={day.id}
                className={`aad-tab${selectedAad===day.id?' active':''}`}
                onClick={()=>{ setSelectedAad(day.id); setQuery('') }}
              >
                {day.name}
                {day.id === CURRENT_AAD && <span className="dot-live" style={{marginRight:4, width:5, height:5}}/>}
              </button>
            ))}
          </div>

          <div className="search-wrap">
            <i className="ti ti-search" aria-hidden="true"/>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder={t('بحث باسم المستفيد...','Search by name...')}
            />
            {query && <i className="ti ti-x" style={{cursor:'pointer'}} onClick={()=>setQuery('')} aria-hidden="true"/>}
          </div>

          <table className="shares-table">
            <thead>
              <tr>
                <th style={{width:26}}>#</th>
                <th style={{width:'40%'}}>{t('صاحب الفلج','Shareholder')}</th>
                <th style={{width:'13%'}}>{t('الآثار','Athars')}</th>
                <th style={{width:'23%'}}>{t('التوقيت','Time')}</th>
                <th style={{width:'16%'}}>{t('الحالة','Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const holder = getHolder(s.holderId)
                const color  = holderColor(s.holderId)
                const ini    = initials(holder.name)
                const isMe   = s.holderId === currentUser?.holderId
                return (
                  <tr key={i} className={rowClass(s)}>
                    <td style={{color:'var(--c-stone)', fontSize:11}}>{s.order}</td>
                    <td>
                      <div className="name-cell">
                        <div className="av" style={{background: color}}>{ini}</div>
                        <span style={{fontWeight: isMe ? 600 : 400, color: isMe ? 'var(--c-water)' : 'var(--c-soil)', fontSize:12}}>
                          {isMe ? `${t('أنت — ','')}` : ''}{holder.name}
                          {(holder.type==='heirs'||holder.type==='joint') && (
                            <span style={{fontSize:10, color:'var(--c-stone)', display:'block'}}>{t(holder.tribe, holder.tribe)}</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td style={{fontWeight: isMe?600:400, fontFamily:'IBM Plex Mono, monospace', fontSize:12}}>{s.athars}</td>
                    <td style={{fontFamily:'IBM Plex Mono, monospace', fontSize:11, color:'var(--c-stone)'}}>{s.startTime}–{s.endTime}</td>
                    <td>{statusBadge(s)}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{textAlign:'center', padding:'20px', color:'var(--c-stone)'}}>
                  {t('لا نتائج','No results')}
                </td></tr>
              )}
            </tbody>
          </table>

          <div style={{display:'flex', justifyContent:'space-between', marginTop:10, fontSize:11, color:'var(--c-stone)', flexWrap:'wrap', gap:6}}>
            <div style={{display:'flex', gap:12}}>
              <span style={{display:'flex', alignItems:'center', gap:4}}>
                <span style={{width:10, height:10, background:'#FFF8E8', border:'1px solid #C8841A', borderRadius:2, display:'inline-block'}}/>
                {t('جارٍ الآن','Now')}
              </span>
              <span style={{display:'flex', alignItems:'center', gap:4}}>
                <span style={{width:10, height:10, background:'var(--c-water-light)', border:'1px solid var(--c-water)', borderRadius:2, display:'inline-block'}}/>
                {t('دوري','My turn')}
              </span>
              <span style={{display:'flex', alignItems:'center', gap:4}}>
                <span style={{width:10, height:10, background:'var(--c-sand)', borderRadius:2, opacity:.5, display:'inline-block'}}/>
                {t('انتهى','Done')}
              </span>
            </div>
            <span>{t('الإجمالي','Total')}: {total} {t('أثراً','athars')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
