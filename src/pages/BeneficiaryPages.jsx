import { useState } from 'react'
import { useApp } from '../hooks/useAppState'
import { useCycle } from '../hooks/useCycleSettings'
import { AAD_DAYS, SHARES, SHARE_HOLDERS } from '../data/falajData'
import { formatAtharDuration } from '../utils/helpers'
import { getCurrentAadInfo } from '../utils/cycleEngine'

const BEN_REASONS = [
  { id:'spelling',   ar:'تصحيح إملائي',     en:'Spelling correction'  },
  { id:'full_name',  ar:'إضافة اسم الجد',    en:'Add grandfather name' },
  { id:'other',      ar:'سبب آخر',           en:'Other reason'         },
]

/* ═══════════ MY CYCLE ═══════════ */
export function MyCyclePage() {
  const { currentUser, t, lang } = useApp()
  const { cycleStart } = useCycle()
  const [now] = useState(() => new Date())
  const info = getCurrentAadInfo(cycleStart, now)

  // Dynamic month badge from cycle start
  const monthLabel = info
    ? new Date(info.aadStartTime).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-OM', { month: 'long', year: 'numeric' })
    : t('—', '—')

  return (
    <div className="page-content">
      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('دورتي الكاملة — 12 يوماً','My Full Cycle — 12 Days')}</span>
          <span className="badge badge-water">{monthLabel}</span>
        </div>
        <div className="card-body">
          <div className="timeline">
            {AAD_DAYS.map((day, i) => {
              const sh = SHARES[day.id]?.filter(s => s.holderId === currentUser.holderId) || []
              const hasShare = sh.length > 0
              const isCurrent = i === (info?.aadIndex ?? -1)
              const isPast = i < (info?.aadIndex ?? -1)

              return (
                <div className="tl-item" key={day.id}>
                  <div className="tl-left">
                    <div className="tl-dot" style={{
                      background: isPast ? '#1D9E75' : isCurrent ? 'var(--c-water)' : 'rgba(44,31,14,.15)',
                      boxShadow: isCurrent ? '0 0 0 3px rgba(26,107,138,.2)' : 'none',
                    }}/>
                    {i < AAD_DAYS.length - 1 && <div className="tl-line"/>}
                  </div>
                  <div className="tl-body">
                    <div className="tl-name" style={{color: isCurrent ? 'var(--c-water)' : 'var(--c-soil)'}}>
                      {day.name}
                      {isCurrent && <span style={{fontSize:11, color:'var(--c-water)', marginRight:6}}>← {t('دوري','My turn')}</span>}
                    </div>
                    <div className="tl-time">
                      {isPast ? t('مضى','Passed') : isCurrent ? t('غداً','Tomorrow') : t('لاحقاً','Later')}
                    </div>
                    {hasShare ? sh.map((s, j) => (
                      <span key={j} className={`tl-pill${isCurrent?' water':''}`}>
                        {s.athars} {t('أثر','athars')} · {s.startTime}–{s.endTime} · {formatAtharDuration(s.athars)}
                      </span>
                    )) : (
                      <span className="tl-pill">{t('لا دور في هذا اليوم','No turn this day')}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════ FARMS ═══════════ */
const INIT_FARMS = [
  { id:'f1', name:'مزرعة الشمال',   lastIrr:'آد عبد — 1 سبتمبر',  status:'irrigated' },
  { id:'f2', name:'الحقل الرئيسي', lastIrr:'آد مالك — 2 سبتمبر', status:'irrigated' },
  { id:'f3', name:'البستان الصغير',lastIrr:null,                   status:'pending'   },
]

export function FarmsPage() {
  const { t } = useApp()
  const [farms, setFarms] = useState(INIT_FARMS)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const addFarm = () => {
    if (!newName.trim()) return
    setFarms(prev => [...prev, { id:'f'+Date.now(), name:newName.trim(), lastIrr:null, status:'pending' }])
    setNewName(''); setAdding(false)
  }

  return (
    <div className="page-content">
      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('مزارعي المسقية','My Irrigated Farms')}</span>
          <button className="btn btn-primary btn-sm" onClick={()=>setAdding(true)}>
            <i className="ti ti-plus" aria-hidden="true"/>{t('إضافة','Add')}
          </button>
        </div>
        <div>
          {farms.map(f => (
            <div key={f.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid rgba(44,31,14,.06)'}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:36, height:36, borderRadius:'50%', background:'var(--c-palm-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18}}>
                  <i className="ti ti-plant-2" style={{color:'var(--c-palm)'}} aria-hidden="true"/>
                </div>
                <div>
                  <div style={{fontSize:13, fontWeight:600, color:'var(--c-soil)'}}>{f.name}</div>
                  <div style={{fontSize:11, color:'var(--c-stone)', marginTop:2}}>
                    {f.lastIrr ? `${t('آخر سقي:','Last irrigated:')} ${f.lastIrr}` : t('لم تُسقَ بعد في هذه الدورة','Not irrigated this cycle yet')}
                  </div>
                </div>
              </div>
              <span className={`badge ${f.status==='irrigated'?'badge-palm':'badge-stone'}`}>
                {f.status==='irrigated' ? t('مسقية','Irrigated') : t('بانتظار الدور','Pending')}
              </span>
            </div>
          ))}

          {adding && (
            <div style={{padding:'12px 16px', borderTop:'1px solid rgba(44,31,14,.06)'}}>
              <div className="form-group" style={{marginBottom:8}}>
                <input className="form-input" value={newName} onChange={e=>setNewName(e.target.value)}
                  placeholder={t('اسم المزرعة الجديدة...','New farm name...')} autoFocus/>
              </div>
              <div className="btn-row" style={{marginTop:0}}>
                <button className="btn btn-palm btn-sm" onClick={addFarm}>{t('حفظ','Save')}</button>
                <button className="btn btn-outline btn-sm" onClick={()=>{setAdding(false);setNewName('')}}>{t('إلغاء','Cancel')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════ NAME CHANGE REQUEST (inside NotesPage) ═══════════ */
function NameChangeCard() {
  const { t, lang, currentUser, holderNames, nameChangeRequests, requestNameChange } = useApp()

  // All share holders linked to this user
  const myHolders = SHARE_HOLDERS.filter(sh => sh.id === currentUser?.holderId)
  const holder = myHolders[0]
  if (!holder) return null

  const displayName = holderNames[holder.id] || holder.name
  const myReqs = nameChangeRequests.filter(r => r.holderId === holder.id)
  const pending = myReqs.find(r => r.status === 'pending')
  const lastApproved = myReqs.find(r => r.status === 'approved')

  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [reason, setReason] = useState(BEN_REASONS[0].id)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    if (!newName.trim() || newName.trim() === displayName) return
    const reasonLabel = BEN_REASONS.find(r => r.id === reason)?.[lang==='ar'?'ar':'en'] || reason
    requestNameChange({ holderId: holder.id, currentName: displayName, newName: newName.trim(), reason: reasonLabel, note: note.trim() })
    setOpen(false); setNewName(''); setNote(''); setSubmitted(true)
  }

  return (
    <div className="card" style={{marginBottom:0}}>
      <div className="card-head">
        <span className="card-title">{t('بيانات الحصة','Share Details')}</span>
        <span className="badge badge-stone" style={{fontSize:10}}>{holder.tribe}</span>
      </div>
      <div className="card-body">
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12, padding:'10px 12px', background:'rgba(44,31,14,.04)', borderRadius:10}}>
          <i className="ti ti-user-circle" style={{fontSize:22, color:'var(--c-water)'}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13, fontWeight:600, color:'var(--c-soil)'}}>{displayName}</div>
            {lastApproved && <div style={{fontSize:10, color:'#1D9E75', marginTop:2}}>
              <i className="ti ti-check" style={{fontSize:10}}/> {t('آخر تعديل معتمد','Last approved edit')}
            </div>}
          </div>
        </div>

        {/* Status banners */}
        {pending && (
          <div className="warn-box" style={{marginBottom:10, background:'rgba(200,132,26,.07)', borderColor:'rgba(200,132,26,.2)', color:'var(--c-sun)'}}>
            <i className="ti ti-clock" style={{fontSize:14, flexShrink:0}}/>
            <span style={{fontSize:12}}>
              {t('طلب تعديل الاسم قيد المراجعة','Name change request under review')}
              {' — '}<strong>{pending.newName}</strong>
            </span>
          </div>
        )}
        {submitted && !pending && (
          <div className="info-box" style={{marginBottom:10}}>
            <i className="ti ti-check" style={{fontSize:14, flexShrink:0}}/>
            <span style={{fontSize:12}}>{t('تم إرسال طلبك بنجاح — بانتظار اعتماد الأدمن','Request sent — awaiting admin approval')}</span>
          </div>
        )}

        {/* Request form */}
        {!pending && (
          <>
            {!open ? (
              <button className="btn btn-outline btn-full" style={{fontSize:12}} onClick={()=>setOpen(true)}>
                <i className="ti ti-pencil" style={{fontSize:14}}/>
                {t('طلب تعديل الاسم','Request name change')}
              </button>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label" style={{fontSize:11}}>{t('الاسم المقترح','Proposed name')}</label>
                  <input
                    className="form-input"
                    value={newName}
                    onChange={e=>setNewName(e.target.value)}
                    placeholder={displayName}
                    autoFocus
                    style={{fontSize:13}}
                  />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label" style={{fontSize:11}}>{t('سبب الطلب','Reason')}</label>
                  <select className="form-input" value={reason} onChange={e=>setReason(e.target.value)} style={{fontSize:12}}>
                    {BEN_REASONS.map(r=>(
                      <option key={r.id} value={r.id}>{lang==='ar'?r.ar:r.en}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label" style={{fontSize:11}}>{t('تفاصيل (اختياري)','Details (optional)')}</label>
                  <input
                    className="form-input"
                    value={note}
                    onChange={e=>setNote(e.target.value)}
                    placeholder={t('مثال: الاسم الصحيح هو...','e.g. The correct name is...')}
                    style={{fontSize:12}}
                  />
                </div>
                <div className="btn-row" style={{marginTop:2}}>
                  <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={submit} disabled={!newName.trim() || newName.trim()===displayName}>
                    <i className="ti ti-send"/>{t('إرسال الطلب','Send request')}
                  </button>
                  <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={()=>{setOpen(false);setNewName('');setNote('')}}>
                    {t('إلغاء','Cancel')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════════ NOTES ═══════════ */
export function NotesPage() {
  const { t, currentUser } = useApp()
  const storageKey = `falaj_notes_${currentUser?.id || 'guest'}`
  const [note, setNote] = useState(() => {
    try { return localStorage.getItem(storageKey) ?? 'العامل: سعيد — رقمه محفوظ.\nالدور القادم: فتح قناة الشمال أولاً.\nآد الخيلانين: 21.5 أثر — تجهيز البستان مسبقاً.' }
    catch { return '' }
  })
  const [saved, setSaved] = useState(false)

  const save = () => {
    try { localStorage.setItem(storageKey, note) } catch {}
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-content">

      <NameChangeCard/>

      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('ملاحظاتي الخاصة','My Private Notes')}</span>
          <span style={{fontSize:11, color:'var(--c-stone)', display:'flex', alignItems:'center', gap:4}}>
            <i className="ti ti-lock" style={{fontSize:13}} aria-hidden="true"/>
            {t('خاصة بك فقط','Private to you')}
          </span>
        </div>
        <div className="card-body">
          <textarea
            className="form-textarea"
            value={note}
            onChange={e=>setNote(e.target.value)}
            rows={8}
            placeholder={t('اكتب ملاحظاتك الخاصة هنا...','Write your private notes here...')}
            style={{width:'100%'}}
          />
          <div className="btn-row">
            <button className="btn btn-primary btn-full" onClick={save}>
              <i className={`ti ti-${saved?'check':'device-floppy'}`} aria-hidden="true"/>
              {saved ? t('تم الحفظ ✓','Saved ✓') : t('حفظ الملاحظات','Save Notes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
