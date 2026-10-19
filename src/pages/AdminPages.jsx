import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useAppState'
import { SHARES, AAD_DAYS, SHARE_HOLDERS } from '../data/falajData'
import { getHolder, holderColor, initials, relTypeLabel } from '../utils/helpers'

// Computed once from domain data — stays correct if share data changes
const ATHARS_PER_DAY = (SHARES[AAD_DAYS[0]?.id] || []).reduce((s, sh) => s + sh.athars, 0) || 96

/* ═══════════ ADMIN HOME ═══════════ */
export function AdminHome({ onTab }) {
  const { t, pendingRegs } = useApp()

  return (
    <div className="page-content">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-val">{pendingRegs.length}</div>
          <div className="metric-lbl">{t('طلبات تسجيل معلقة','Pending registrations')}</div>
          <div className="metric-badge">
            {pendingRegs.length > 0
              ? <span className="badge badge-sun">{t('تحتاج مراجعة','Needs review')}</span>
              : <span className="badge badge-palm">{t('لا شيء','All clear')}</span>}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-val">{SHARE_HOLDERS.length}</div>
          <div className="metric-lbl">{t('إجمالي الملاك','Total shareholders')}</div>
          <div className="metric-badge"><span className="badge badge-water">{t('مسجلون','Registered')}</span></div>
        </div>
        <div className="metric-card">
          <div className="metric-val">12</div>
          <div className="metric-lbl">{t('أيام الدورة','Cycle days')}</div>
          <div className="metric-badge"><span className="badge badge-stone">{t('ثابتة','Fixed')}</span></div>
        </div>
        <div className="metric-card">
          <div className="metric-val">{ATHARS_PER_DAY}</div>
          <div className="metric-lbl">{t('آثار كل يوم','Athars per day')}</div>
          <div className="metric-badge"><span className="badge badge-water">{t('إجمالي','Total')}</span></div>
        </div>
      </div>

      {pendingRegs.length > 0 && (
        <div className="warn-box" style={{cursor:'pointer'}} onClick={()=>onTab('registrations')}>
          <i className="ti ti-alert-circle" style={{fontSize:16, flexShrink:0}} aria-hidden="true"/>
          <span>{t(`يوجد ${pendingRegs.length} طلب تسجيل بانتظار موافقتك. اضغط للمراجعة.`,
                    `${pendingRegs.length} registration request(s) awaiting your approval.`)}</span>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('إجراءات سريعة','Quick Actions')}</span>
        </div>
        <div className="card-body" style={{display:'flex', flexDirection:'column', gap:8}}>
          {[
            { icon:'ti-user-check', label: t('مراجعة طلبات التسجيل','Review Registrations'), tab:'registrations', badge: pendingRegs.length > 0 ? pendingRegs.length : null },
            { icon:'ti-droplet',    label: t('تعديل توزيعات الفلج','Edit Share Distributions'), tab:'shares' },
            { icon:'ti-git-branch', label: t('تقسيم حصة الورثة','Split Heir Shares'), tab:'splits' },
            { icon:'ti-users',      label: t('إدارة الملاك','Manage Shareholders'), tab:'shareholders' },
          ].map(item => (
            <button key={item.tab} className="btn btn-outline btn-full"
              style={{justifyContent:'flex-start', gap:10}} onClick={()=>onTab(item.tab)}>
              <i className={`ti ${item.icon}`} style={{fontSize:18, color:'var(--c-water)'}} aria-hidden="true"/>
              <span style={{flex:1, textAlign:'right'}}>{item.label}</span>
              {item.badge && <span className="badge badge-sun">{item.badge}</span>}
              <i className="ti ti-chevron-left" style={{fontSize:14, color:'var(--c-stone)'}} aria-hidden="true"/>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════ REGISTRATIONS ═══════════ */
export function RegistrationsPage() {
  const { t, lang, pendingRegs, approveReg, rejectReg } = useApp()

  if (pendingRegs.length === 0) return (
    <div className="page-content">
      <div style={{textAlign:'center', padding:'40px 20px', color:'var(--c-stone)'}}>
        <i className="ti ti-circle-check" style={{fontSize:48, color:'var(--c-palm)', display:'block', marginBottom:12}} aria-hidden="true"/>
        <div style={{fontSize:15, fontWeight:600, color:'var(--c-soil)', marginBottom:6}}>{t('لا توجد طلبات معلقة','No pending requests')}</div>
        <div style={{fontSize:13}}>{t('جميع طلبات التسجيل تمت معالجتها','All registration requests have been processed')}</div>
      </div>
    </div>
  )

  return (
    <div className="page-content">
      <div className="section-lbl">{t('طلبات التسجيل المعلقة','Pending Registration Requests')} ({pendingRegs.length})</div>
      {pendingRegs.map(reg => {
        const holder = getHolder(reg.requestedHolderId)
        return (
          <div className="card" key={reg.id}>
            <div className="card-body">
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                <div style={{width:40, height:40, borderRadius:'50%', background:'var(--c-water-light)', color:'var(--c-water)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600}}>
                  {initials(reg.fullName)}
                </div>
                <div>
                  <div className="reg-name">{reg.fullName}</div>
                  <div className="reg-detail">{reg.phone}</div>
                </div>
                <span className="badge badge-sun" style={{marginRight:'auto'}}>{t('معلق','Pending')}</span>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:4, fontSize:12, color:'var(--c-soil)'}}>
                <div style={{display:'flex', gap:6}}>
                  <span style={{color:'var(--c-stone)', minWidth:80}}>{t('يطلب تتبع:','Tracking:')}</span>
                  <span style={{fontWeight:500}}>{holder.name}</span>
                </div>
                <div style={{display:'flex', gap:6}}>
                  <span style={{color:'var(--c-stone)', minWidth:80}}>{t('الصلة:','Relation:')}</span>
                  <span>{relTypeLabel(reg.relationType, lang)}</span>
                </div>
                <div style={{display:'flex', gap:6}}>
                  <span style={{color:'var(--c-stone)', minWidth:80}}>{t('تاريخ الطلب:','Submitted:')}</span>
                  <span>{new Date(reg.submittedAt).toLocaleDateString('ar-OM')}</span>
                </div>
              </div>

              {reg.relationNote && (
                <div className="reg-note" style={{marginTop:8}}>
                  <span style={{color:'var(--c-stone)', fontSize:11}}>{t('ملاحظة: ','Note: ')}</span>
                  {reg.relationNote}
                </div>
              )}

              <div className="btn-row">
                <button className="btn btn-palm btn-sm" style={{flex:1}} onClick={()=>approveReg(reg.id)}>
                  <i className="ti ti-check" aria-hidden="true"/>{t('قبول','Approve')}
                </button>
                <button className="btn btn-danger btn-sm" style={{flex:1}} onClick={()=>rejectReg(reg.id)}>
                  <i className="ti ti-x" aria-hidden="true"/>{t('رفض','Reject')}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════ SHARE SPLITS ═══════════ */
export function SplitsPage() {
  const { t } = useApp()
  const [mode, setMode] = useState('manual')
  const [splitHolderId, setSplitHolderId] = useState('sh26')
  const [splitAadId, setSplitAadId]       = useState('muhammad')
  const [heirs, setHeirs] = useState([
    { name:'سالم بن خلفان الحضرمي', athars:4, startTime:'11:30', endTime:'02:15' },
    { name:'محمد بن خلفان الحضرمي', athars:4, startTime:'02:15', endTime:'05:45' },
    { name:'علي بن خلفان الحضرمي',  athars:3, startTime:'05:45', endTime:'08:00' },
  ])
  const [saved, setSaved] = useState(false)

  const holder = getHolder(splitHolderId)
  // Total athars for selected holder in selected Aad day
  const TOTAL_ATHARS = useMemo(() => {
    const dayShares = (SHARES[splitAadId] || []).filter(s => s.holderId === splitHolderId)
    return dayShares.reduce((sum, s) => sum + s.athars, 0) || 11
  }, [splitHolderId, splitAadId])

  const sumAthars = heirs.reduce((s, h) => s + parseFloat(h.athars || 0), 0)
  const isValid = Math.abs(sumAthars - TOTAL_ATHARS) < 0.01

  const update = (i, field, val) => {
    setHeirs(prev => prev.map((h, idx) => idx === i ? {...h, [field]: val} : h))
  }
  const remove = (i) => setHeirs(prev => prev.filter((_, idx) => idx !== i))
  const add = () => setHeirs(prev => [...prev, { name:'وارث جديد', athars:0, startTime:'', endTime:'' }])

  const save = () => {
    if (!isValid) { alert(t(`المجموع (${sumAthars}) لا يساوي ${TOTAL_ATHARS} آثار`,`Sum (${sumAthars}) ≠ ${TOTAL_ATHARS} athars`)); return }
    setSaved(true); setTimeout(()=>setSaved(false), 2500)
  }

  const colors = ['#1A6B8A','#2D6A2D','#C8841A','#8B3A62','#5C3D1E']

  return (
    <div className="page-content">
      <div className="card">
        <div className="card-head">
          <div style={{flex:1}}>
            <div className="card-title">{t('تقسيم حصة الورثة','Split Heir Share')}</div>
            <div style={{display:'flex', gap:6, marginTop:6, flexWrap:'wrap'}}>
              <select value={splitHolderId} onChange={e=>{setSplitHolderId(e.target.value);setHeirs([])}}
                style={{fontSize:11,border:'1px solid rgba(44,31,14,.15)',borderRadius:6,padding:'3px 6px',background:'#fff',color:'var(--c-soil)',maxWidth:160}}>
                {SHARE_HOLDERS.map(sh=>(
                  <option key={sh.id} value={sh.id}>{sh.name}</option>
                ))}
              </select>
              <select value={splitAadId} onChange={e=>{setSplitAadId(e.target.value);setHeirs([])}}
                style={{fontSize:11,border:'1px solid rgba(44,31,14,.15)',borderRadius:6,padding:'3px 6px',background:'#fff',color:'var(--c-soil)'}}>
                {AAD_DAYS.map(d=>(
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <span style={{fontSize:11,color:'var(--c-stone)',alignSelf:'center'}}>{TOTAL_ATHARS} {t('أثر','athars')}</span>
            </div>
          </div>
          <div style={{display:'flex', gap:3, border:'1px solid rgba(44,31,14,.15)', borderRadius:'var(--radius-md)', overflow:'hidden'}}>
            {['manual','auto'].map(m => (
              <button key={m} style={{padding:'4px 10px', fontSize:11, border:'none', background: mode===m?'var(--c-soil)':'transparent', color: mode===m?'#fff':'var(--c-stone)', cursor:'pointer'}} onClick={()=>setMode(m)}>
                {m==='manual' ? t('يدوي','Manual') : t('تلقائي','Auto')}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <div className="info-box" style={{marginBottom:12}}>
            <i className="ti ti-info-circle" style={{fontSize:15, flexShrink:0}} aria-hidden="true"/>
            <span style={{fontSize:11}}>
              {mode==='manual'
                ? t('الوضع اليدوي: أدخل الآثار والأوقات لكل وارث مباشرةً. يقبل الأعداد الكسرية.','Manual mode: Enter athars and times per heir. Accepts decimals.')
                : t('الوضع التلقائي: أدخل نسبة كل وارث (%) وسيحسب النظام الآثار.','Auto mode: Enter percentage per heir and the system calculates athars.')}
            </span>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <span style={{fontSize:12, color:'var(--c-stone)'}}>{t('توزيع الآثار والأوقات','Athar & Time Distribution')}</span>
            <span style={{fontSize:12, fontWeight:600}} className={isValid?'split-total-ok':'split-total-over'}>
              {sumAthars} / {TOTAL_ATHARS}
            </span>
          </div>

          {heirs.map((h, i) => (
            <div key={i} className="split-row">
              <div className="av" style={{background:colors[i%colors.length], width:28, height:28, fontSize:10, flexShrink:0}}>{initials(h.name)}</div>
              <input style={{flex:1, border:'none', background:'transparent', fontSize:12, color:'var(--c-soil)', fontFamily:'inherit', outline:'none'}}
                value={h.name} onChange={e=>update(i,'name',e.target.value)}/>
              <div className="split-bar-wrap">
                <div className="split-bar" style={{width:`${Math.min(100,(h.athars/TOTAL_ATHARS)*100)}%`, background:colors[i%colors.length]}}/>
              </div>
              <input className="split-input" type="number" min="0" max={TOTAL_ATHARS} step="0.5"
                value={h.athars} onChange={e=>update(i,'athars',parseFloat(e.target.value)||0)}/>
              <span style={{fontSize:10, color:'var(--c-stone)'}}>أثر</span>
              <input style={{width:48, fontSize:11, border:'1px solid rgba(44,31,14,.15)', borderRadius:4, padding:'3px 5px', textAlign:'center', fontFamily:'IBM Plex Mono,monospace'}}
                value={h.startTime} onChange={e=>update(i,'startTime',e.target.value)} placeholder="00:00"/>
              <span style={{fontSize:10, color:'var(--c-stone)'}}>–</span>
              <input style={{width:48, fontSize:11, border:'1px solid rgba(44,31,14,.15)', borderRadius:4, padding:'3px 5px', textAlign:'center', fontFamily:'IBM Plex Mono,monospace'}}
                value={h.endTime} onChange={e=>update(i,'endTime',e.target.value)} placeholder="00:00"/>
              <button style={{border:'none', background:'none', color:'var(--c-danger)', cursor:'pointer', fontSize:14}} onClick={()=>remove(i)}>✕</button>
            </div>
          ))}

          <button style={{display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--c-water)', background:'none', border:'none', cursor:'pointer', padding:'6px 0'}} onClick={add}>
            <i className="ti ti-plus" style={{fontSize:14}} aria-hidden="true"/>
            {t('إضافة وارث','Add heir')}
          </button>

          <div style={{marginTop:12, paddingTop:12, borderTop:'1px solid rgba(44,31,14,.06)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{fontSize:11, color:'var(--c-stone)', display:'flex', alignItems:'center', gap:4}}>
              <i className="ti ti-lock" style={{fontSize:12}} aria-hidden="true"/>
              {t('يحتاج موافقة السوبر أدمن','Requires Super Admin approval')}
            </div>
            <button className="btn btn-primary btn-sm" onClick={save}>
              <i className={`ti ti-${saved?'check':'send'}`} aria-hidden="true"/>
              {saved ? t('تم الإرسال ✓','Sent ✓') : t('إرسال للموافقة','Send for Approval')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════ SHAREHOLDERS LIST ═══════════ */
const NAME_CHANGE_REASONS = [
  { id:'beneficiary_request', ar:'طلب من المستفيد',   en:'Beneficiary request'   },
  { id:'sale',                ar:'بيع حصة',            en:'Share sale'             },
  { id:'inheritance',         ar:'إرث',                en:'Inheritance'            },
  { id:'spelling',            ar:'تصحيح إملائي',       en:'Spelling correction'    },
  { id:'other',               ar:'أخرى',               en:'Other'                  },
]

export function ShareholdersPage() {
  const { t, lang, holderNames, directEditName, pendingNameChanges, approveNameChange, rejectNameChange } = useApp()
  const [query, setQuery]       = useState('')
  const [editId, setEditId]     = useState(null)   // holderId being edited
  const [editName, setEditName] = useState('')
  const [editReason, setEditReason] = useState(NAME_CHANGE_REASONS[0].id)
  const [editNote, setEditNote] = useState('')

  const filtered = useMemo(
    () => SHARE_HOLDERS.filter(s => !query || s.name.includes(query) || s.tribe.includes(query)),
    [query]
  )

  const startEdit = (sh) => {
    setEditId(sh.id)
    setEditName(holderNames[sh.id] || sh.name)
    setEditReason(NAME_CHANGE_REASONS[0].id)
    setEditNote('')
  }

  const cancelEdit = () => { setEditId(null); setEditName(''); setEditNote('') }

  const saveEdit = (sh) => {
    if (!editName.trim() || editName.trim() === (holderNames[sh.id] || sh.name)) { cancelEdit(); return }
    const reasonLabel = NAME_CHANGE_REASONS.find(r => r.id === editReason)?.[lang==='ar'?'ar':'en'] || editReason
    directEditName({ holderId: sh.id, currentName: holderNames[sh.id] || sh.name, newName: editName.trim(), reason: reasonLabel, note: editNote.trim() })
    cancelEdit()
  }

  return (
    <div className="page-content">

      {/* Pending name-change requests from beneficiaries */}
      {pendingNameChanges.length > 0 && (
        <div className="card" style={{borderRight:'3px solid var(--c-sun)'}}>
          <div className="card-head">
            <span className="card-title">{t('طلبات تعديل الاسم','Name Change Requests')}</span>
            <span className="badge badge-sun">{pendingNameChanges.length}</span>
          </div>
          <div className="card-body" style={{padding:0}}>
            {pendingNameChanges.map(req => (
              <div key={req.id} style={{padding:'12px 14px', borderBottom:'1px solid rgba(44,31,14,.06)'}}>
                <div style={{fontSize:12, color:'var(--c-stone)', marginBottom:6}}>
                  <span style={{fontWeight:600, color:'var(--c-soil)'}}>{req.requestedByName}</span>
                  {' · '}{req.requestedAt}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap'}}>
                  <span style={{fontSize:12, color:'var(--c-stone)', textDecoration:'line-through'}}>{req.currentName}</span>
                  <i className="ti ti-arrow-left" style={{fontSize:11, color:'var(--c-stone)'}}/>
                  <span style={{fontSize:13, fontWeight:600, color:'var(--c-soil)'}}>{req.newName}</span>
                </div>
                <div style={{fontSize:11, color:'var(--c-water)', marginBottom:10}}>
                  {t('السبب:','Reason:')} {req.reason}{req.note ? ` · ${req.note}` : ''}
                </div>
                <div className="btn-row" style={{marginTop:0}}>
                  <button className="btn btn-palm btn-sm" style={{flex:1}} onClick={()=>approveNameChange(req.id)}>
                    <i className="ti ti-check"/>{t('اعتماد','Approve')}
                  </button>
                  <button className="btn btn-danger btn-sm" style={{flex:1}} onClick={()=>rejectNameChange(req.id)}>
                    <i className="ti ti-x"/>{t('رفض','Reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="search-wrap">
        <i className="ti ti-search" aria-hidden="true"/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('بحث باسم الملك أو القبيلة...','Search by name or tribe...')}/>
        {query && <i className="ti ti-x" style={{cursor:'pointer'}} onClick={()=>setQuery('')} aria-hidden="true"/>}
      </div>

      <div className="card">
        <div style={{maxHeight:520, overflowY:'auto'}}>
          {filtered.map(sh => {
            const displayName = holderNames[sh.id] || sh.name
            const isEditing = editId === sh.id
            const wasEdited = !!holderNames[sh.id]
            return (
              <div key={sh.id} style={{borderBottom:'1px solid rgba(44,31,14,.05)'}}>
                <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 14px'}}>
                  <div className="av" style={{background:holderColor(sh.id), width:32, height:32, fontSize:11, flexShrink:0}}>{initials(displayName)}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', alignItems:'center', gap:5}}>
                      <div style={{fontSize:12.5, fontWeight:500, color:'var(--c-soil)'}}>{displayName}</div>
                      {wasEdited && <i className="ti ti-pencil-check" style={{fontSize:10, color:'var(--c-water)'}} title={sh.name}/>}
                    </div>
                    {wasEdited && <div style={{fontSize:10, color:'var(--c-stone)', textDecoration:'line-through', marginTop:1}}>{sh.name}</div>}
                    <div style={{fontSize:11, color:'var(--c-stone)', marginTop:wasEdited?0:1}}>{sh.tribe}</div>
                  </div>
                  <span className={`badge ${sh.type==='heirs'||sh.type==='joint'?'badge-dusk':sh.type==='mosque'?'badge-water':'badge-stone'}`} style={{fontSize:10}}>
                    {sh.type==='heirs'?t('ورثة','Heirs'):sh.type==='joint'?t('مشترك','Joint'):sh.type==='mosque'?t('مسجد','Mosque'):t('فرد','Individual')}
                  </span>
                  {sh.type !== 'mosque' && (
                    <button
                      style={{background:'none', border:'none', cursor:'pointer', padding:'4px 6px', borderRadius:6, color:'var(--c-stone)'}}
                      onClick={()=> isEditing ? cancelEdit() : startEdit(sh)}
                      title={t('تعديل الاسم','Edit name')}
                    >
                      <i className={`ti ti-${isEditing?'x':'pencil'}`} style={{fontSize:14}}/>
                    </button>
                  )}
                </div>

                {/* Inline edit form */}
                {isEditing && (
                  <div style={{margin:'0 14px 12px', padding:12, background:'rgba(26,107,138,.05)', borderRadius:10, border:'1px solid rgba(26,107,138,.15)'}}>
                    <div className="form-group" style={{marginBottom:8}}>
                      <label className="form-label" style={{fontSize:11}}>{t('الاسم الجديد','New name')}</label>
                      <input
                        className="form-input"
                        value={editName}
                        onChange={e=>setEditName(e.target.value)}
                        placeholder={t('أدخل الاسم...','Enter name...')}
                        autoFocus
                        style={{fontSize:13}}
                      />
                    </div>
                    <div className="form-group" style={{marginBottom:8}}>
                      <label className="form-label" style={{fontSize:11}}>{t('سبب التعديل','Reason')}</label>
                      <select
                        className="form-input"
                        value={editReason}
                        onChange={e=>setEditReason(e.target.value)}
                        style={{fontSize:12}}
                      >
                        {NAME_CHANGE_REASONS.map(r=>(
                          <option key={r.id} value={r.id}>{lang==='ar'?r.ar:r.en}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{marginBottom:10}}>
                      <label className="form-label" style={{fontSize:11}}>{t('ملاحظة (اختياري)','Note (optional)')}</label>
                      <input
                        className="form-input"
                        value={editNote}
                        onChange={e=>setEditNote(e.target.value)}
                        placeholder={t('تفاصيل إضافية...','Additional details...')}
                        style={{fontSize:12}}
                      />
                    </div>
                    <div className="btn-row" style={{marginTop:0}}>
                      <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={()=>saveEdit(sh)}>
                        <i className="ti ti-check"/>{t('حفظ','Save')}
                      </button>
                      <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={cancelEdit}>
                        {t('إلغاء','Cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════ LOGIN LOGS ═══════════ */
export function LoginLogsPage() {
  const { t, lang, loginLogs, auditLogs } = useApp()
  const [tab, setTab] = useState('login')

  const ROLE_COLOR = {
    beneficiary:'#1A6B8A', admin:'#2D6A2D', super_admin:'#7A3055',
  }
  const ROLE_LABEL = {
    beneficiary:{ar:'مستفيد',en:'Beneficiary'},
    admin:{ar:'أدمن',en:'Admin'},
    super_admin:{ar:'سوبر أدمن',en:'Super Admin'},
  }

  return (
    <div className="page-content">
      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('سجلات النظام','System Logs')}</span>
          <span className="badge badge-stone">{tab==='login'?loginLogs.length:auditLogs.length}</span>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:0,borderBottom:'1px solid rgba(44,31,14,.08)',marginBottom:16,padding:'0 16px'}}>
          {[
            {id:'login', ar:'سجل الدخول', en:'Login Log', icon:'ti-login'},
            {id:'audit', ar:'سجل التدقيق', en:'Audit Log', icon:'ti-clipboard-list'},
          ].map(tb=>(
            <button key={tb.id} onClick={()=>setTab(tb.id)}
              style={{padding:'10px 16px',background:'none',border:'none',cursor:'pointer',
                borderBottom:`2.5px solid ${tab===tb.id?'var(--c-water)':'transparent'}`,
                color:tab===tb.id?'var(--c-water)':'var(--c-stone)',
                fontWeight:tab===tb.id?700:400,fontSize:12,
                display:'flex',alignItems:'center',gap:5,transition:'all .15s'}}>
              <i className={`ti ${tb.icon}`} style={{fontSize:13}}/>
              {lang==='ar'?tb.ar:tb.en}
            </button>
          ))}
        </div>

        {tab === 'login' && (
          <div style={{padding:'0 16px 16px'}}>
            {loginLogs.length === 0 ? (
              <div style={{textAlign:'center',padding:'24px 0',color:'var(--c-stone)',fontSize:12}}>
                <i className="ti ti-clock" style={{fontSize:28,display:'block',marginBottom:8,opacity:.3}}/>
                {t('لا توجد جلسات مسجّلة بعد','No sessions recorded yet')}
              </div>
            ) : loginLogs.map((log, i) => {
              const rc = ROLE_COLOR[log.role] || '#888'
              const rl = ROLE_LABEL[log.role]
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,
                  padding:'10px 0',borderBottom:'1px solid rgba(44,31,14,.05)'}}>
                  <div style={{width:38,height:38,borderRadius:'50%',flexShrink:0,
                    background:rc+'22',display:'flex',alignItems:'center',
                    justifyContent:'center'}}>
                    <i className="ti ti-user-check" style={{fontSize:16,color:rc}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--c-soil)'}}>{log.fullName}</div>
                    <div style={{fontSize:10,color:'var(--c-stone)',marginTop:2,display:'flex',gap:6,flexWrap:'wrap'}}>
                      <code style={{background:'rgba(44,31,14,.06)',padding:'1px 5px',borderRadius:4}}>@{log.username}</code>
                      <span style={{padding:'1px 6px',borderRadius:8,fontWeight:700,
                        background:rc+'18',color:rc,border:`1px solid ${rc}30`,fontSize:9}}>
                        {lang==='ar'?rl?.ar:rl?.en}
                      </span>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:'var(--c-stone)',textAlign:'end',flexShrink:0}}>{log.at}</div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'audit' && (
          <div style={{padding:'0 16px 16px'}}>
            {auditLogs.length === 0 ? (
              <div style={{textAlign:'center',padding:'24px 0',color:'var(--c-stone)',fontSize:12}}>
                <i className="ti ti-clipboard-list" style={{fontSize:28,display:'block',marginBottom:8,opacity:.3}}/>
                {t('لا توجد أحداث مسجّلة بعد','No events recorded yet')}
              </div>
            ) : auditLogs.map((log, i) => (
              <div key={i} style={{display:'flex',gap:10,padding:'10px 0',
                borderBottom:'1px solid rgba(44,31,14,.05)'}}>
                <div style={{width:38,height:38,borderRadius:'50%',flexShrink:0,
                  background:'rgba(26,107,138,.1)',display:'flex',alignItems:'center',
                  justifyContent:'center'}}>
                  <i className="ti ti-clipboard-check" style={{fontSize:16,color:'var(--c-water)'}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--c-soil)'}}>{log.action}</div>
                  <div style={{fontSize:11,color:'var(--c-stone)',marginTop:2}}>{log.entity}</div>
                  <div style={{fontSize:10,color:'var(--c-stone)',marginTop:3,display:'flex',gap:6,alignItems:'center'}}>
                    <i className="ti ti-user" style={{fontSize:10}}/>
                    {log.actor}
                  </div>
                </div>
                <div style={{fontSize:10,color:'var(--c-stone)',textAlign:'end',flexShrink:0,paddingTop:2}}>{log.at}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
