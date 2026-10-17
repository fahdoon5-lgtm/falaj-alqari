import { useState } from 'react'
import { useApp } from '../hooks/useAppState'
import { AAD_DAYS, SHARES } from '../data/falajData'
import { formatAtharDuration } from '../utils/helpers'

const CURRENT_ORDER = 3

/* ═══════════ MY CYCLE ═══════════ */
export function MyCyclePage() {
  const { currentUser, t } = useApp()

  return (
    <div className="page-content">
      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('دورتي الكاملة — 12 يوماً','My Full Cycle — 12 Days')}</span>
          <span className="badge badge-water">
            {t('سبتمبر 2024','September 2024')}
          </span>
        </div>
        <div className="card-body">
          <div className="timeline">
            {AAD_DAYS.map((day, i) => {
              const sh = SHARES[day.id]?.filter(s => s.holderId === currentUser.holderId) || []
              const hasShare = sh.length > 0
              const isCurrent = i === CURRENT_ORDER - 1
              const isPast = i < CURRENT_ORDER - 1

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

/* ═══════════ NOTES ═══════════ */
export function NotesPage() {
  const { t } = useApp()
  const [note, setNote] = useState(
    'العامل: سعيد — رقمه محفوظ.\nالدور القادم: فتح قناة الشمال أولاً.\nآد الخيلانين: 21.5 أثر — تجهيز البستان مسبقاً.'
  )
  const [saved, setSaved] = useState(false)

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000) }

  return (
    <div className="page-content">
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
