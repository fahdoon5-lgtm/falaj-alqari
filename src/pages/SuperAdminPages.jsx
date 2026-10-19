import { useState } from 'react'
import { useApp } from '../hooks/useAppState'
import { useCycle } from '../hooks/useCycleSettings'
import { AAD_DAYS, SHARE_HOLDERS } from '../data/falajData'
import { getCurrentAadInfo, formatCountdown } from '../utils/cycleEngine'

export function SuperAdminHome({ onTab }) {
  const { t, pendingRegs, users } = useApp()
  const { cycleStart, settings } = useCycle()
  const [now] = useState(new Date())
  const info = getCurrentAadInfo(cycleStart, now)

  const activeUsers   = users.filter(u => u.status === 'active' && u.role !== 'super_admin')
  const beneficiaries = users.filter(u => u.role === 'beneficiary')
  const admins        = users.filter(u => u.role === 'admin')

  // Grouped actions for the control panel
  const groups = [
    {
      title: t('إدارة المستخدمين','User Management'),
      color: '#C8841A',
      items: [
        { icon:'ti-user-check',  label:t('طلبات التسجيل','Registrations'),           tab:'registrations', badge:pendingRegs.length||null, color:'#C8841A' },
        { icon:'ti-users-group', label:t('إدارة المستخدمين المسجّلين','Manage Users'), tab:'users_manage',  color:'#7A3055' },
      ],
    },
    {
      title: t('إدارة الأسماء والحصص','Names & Shares'),
      color: '#1A6B8A',
      items: [
        { icon:'ti-users',        label:t('أسماء الملاك — تعديل مباشر','Shareholders — Direct Edit'), tab:'shareholders', color:'#1A6B8A' },
        { icon:'ti-git-branch',   label:t('تقسيم الحصص','Share Splits'),                              tab:'splits',       color:'#2D6A2D' },
      ],
    },
    {
      title: t('إعدادات النظام','System Settings'),
      color: '#0D4F6A',
      items: [
        { icon:'ti-clock-edit',  label:t('إعدادات الدورة — ضبط بداية الآد','Cycle Settings'), tab:'cycle_settings', color:'#1A6B8A', highlight:true },
        { icon:'ti-send',        label:t('إشعارات جماعية','Broadcast'),                        tab:'broadcast',      color:'#6B4A2D' },
        { icon:'ti-shield-check',label:t('سجل التدقيق','Audit Log'),                           tab:'audit',          color:'#0D4F6A' },
      ],
    },
  ]

  return (
    <div className="page-content">

      {/* Cycle Status Card */}
      {info && (
        <div style={{background:'linear-gradient(135deg,#0D1F2D,#1a3a4a)',borderRadius:20,padding:16,color:'#fff',
          position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(13,31,45,.3)'}}>
          <div style={{position:'absolute',top:-30,right:-30,width:100,height:100,borderRadius:'50%',background:'rgba(74,157,181,.1)'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',position:'relative',zIndex:1}}>
            <div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',marginBottom:4}}>{t('الآد الجاري الآن','Current Aad')}</div>
              <div style={{fontSize:20,fontWeight:700}}>{AAD_DAYS[info.aadIndex]?.name}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.5)',marginTop:2}}>{t('الدورة رقم','Cycle #')}{info.cycleNumber}</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:4}}>{t('المتبقي','Remaining')}</div>
              <div style={{fontSize:20,fontWeight:700,fontFamily:'IBM Plex Mono,monospace',color:'#4A9DB5'}}>
                {formatCountdown(info.msRemaining)}
              </div>
            </div>
          </div>
          <button onClick={()=>onTab('cycle_settings')}
            style={{marginTop:12,width:'100%',padding:'8px',borderRadius:10,
              background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',
              color:'rgba(255,255,255,.8)',fontSize:12,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
              transition:'background .15s',position:'relative',zIndex:1}}>
            <i className="ti ti-settings" style={{fontSize:14}}/>
            {t('تعديل بداية الدورة','Edit cycle start')}
            {settings?.updatedAt && <span style={{fontSize:10,opacity:.6,marginRight:6}}>({settings.updatedAt.toLocaleDateString('ar-OM',{day:'numeric',month:'short'})})</span>}
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="metrics-grid">
        <div className="metric-card" style={{cursor:'pointer'}} onClick={()=>onTab('users_manage')}>
          <div className="metric-val">{activeUsers.length}</div>
          <div className="metric-lbl">{t('مستخدمون نشطون','Active users')}</div>
          <div className="metric-badge"><span className="badge badge-water">{t('مسجّل','Registered')}</span></div>
        </div>
        <div className="metric-card" style={{cursor:'pointer'}} onClick={()=>onTab('registrations')}>
          <div className="metric-val">{pendingRegs.length}</div>
          <div className="metric-lbl">{t('طلبات معلقة','Pending requests')}</div>
          <div className="metric-badge">
            {pendingRegs.length>0
              ? <span className="badge badge-sun">{t('مراجعة','Review')}</span>
              : <span className="badge badge-palm">{t('لا شيء','Clear')}</span>}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-val">{SHARE_HOLDERS.length}</div>
          <div className="metric-lbl">{t('إجمالي الملاك','Total shareholders')}</div>
        </div>
        <div className="metric-card">
          <div className="metric-val">{AAD_DAYS.length}</div>
          <div className="metric-lbl">{t('أيام الدورة','Cycle days')}</div>
        </div>
      </div>

      {/* User breakdown */}
      {activeUsers.length > 0 && (
        <div style={{display:'flex',gap:8,marginBottom:4}}>
          <div style={{flex:1,borderRadius:12,padding:'10px 12px',background:'rgba(26,107,138,.07)',border:'1px solid rgba(26,107,138,.15)',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:700,color:'var(--c-water)'}}>{beneficiaries.length}</div>
            <div style={{fontSize:10,color:'var(--c-stone)',marginTop:2}}>{t('مستفيدون','Beneficiaries')}</div>
          </div>
          <div style={{flex:1,borderRadius:12,padding:'10px 12px',background:'rgba(45,106,45,.07)',border:'1px solid rgba(45,106,45,.15)',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:700,color:'#2D6A2D'}}>{admins.length}</div>
            <div style={{fontSize:10,color:'var(--c-stone)',marginTop:2}}>{t('مديرون','Admins')}</div>
          </div>
        </div>
      )}

      {/* Grouped control panel */}
      {groups.map(grp => (
        <div key={grp.title}>
          <div className="section-lbl">{grp.title}</div>
          <div className="card">
            <div className="card-body" style={{display:'flex',flexDirection:'column',gap:6}}>
              {grp.items.map(a => (
                <button key={a.tab} className="btn btn-outline btn-full"
                  style={{justifyContent:'flex-start',gap:10,
                    border: a.highlight?'1.5px solid rgba(26,107,138,.3)':'',
                    background:a.highlight?'rgba(26,107,138,.05)':''}}
                  onClick={()=>onTab(a.tab)}>
                  <div style={{width:34,height:34,borderRadius:'50%',
                    background:`${a.color}18`,display:'flex',alignItems:'center',
                    justifyContent:'center',flexShrink:0}}>
                    <i className={`ti ${a.icon}`} style={{fontSize:16,color:a.color}}/>
                  </div>
                  <span style={{flex:1,textAlign:'right',fontSize:13,
                    fontWeight:a.highlight?600:400,
                    color:a.highlight?'var(--c-water)':'var(--c-soil)'}}>
                    {a.label}
                  </span>
                  {a.badge ? <span className="badge badge-sun">{a.badge}</span> : null}
                  <i className="ti ti-chevron-left" style={{fontSize:13,color:'var(--c-stone)'}}/>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════ USERS MANAGE PAGE ═══════════ */
export function UsersManagePage() {
  const { t, lang, users, updateUserName, updateAvatar } = useApp()
  const [editId,   setEditId]   = useState(null)
  const [editName, setEditName] = useState('')
  const [query,    setQuery]    = useState('')

  const ROLE_META = {
    beneficiary:{ ar:'مستفيد',      en:'Beneficiary', color:'#1A6B8A', icon:'ti-user'        },
    admin:      { ar:'أدمن',         en:'Admin',       color:'#2D6A2D', icon:'ti-shield-half'  },
    super_admin:{ ar:'سوبر أدمن',   en:'Super Admin', color:'#7A3055', icon:'ti-crown'        },
  }

  const filtered = users.filter(u =>
    !query ||
    u.fullName?.includes(query) ||
    u.username?.includes(query)
  )

  const startEdit = (u) => { setEditId(u.id); setEditName(u.fullName) }
  const cancelEdit = () => { setEditId(null); setEditName('') }
  const saveEdit   = (u) => {
    if (editName.trim() && editName.trim() !== u.fullName)
      updateUserName(u.id, editName.trim(), u.fullName)
    cancelEdit()
  }

  return (
    <div className="page-content">
      <div className="search-wrap">
        <i className="ti ti-search" aria-hidden="true"/>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          placeholder={t('بحث باسم أو اسم المستخدم...','Search by name or username...')}/>
        {query && <i className="ti ti-x" style={{cursor:'pointer'}} onClick={()=>setQuery('')}/>}
      </div>

      <div className="section-lbl">{t('المستخدمون المسجّلون','Registered Users')} ({filtered.length})</div>
      <div className="card">
        {filtered.map(u => {
          const rm   = ROLE_META[u.role] || ROLE_META.beneficiary
          const isMe = u.role === 'super_admin'
          const isEditing = editId === u.id
          return (
            <div key={u.id} style={{borderBottom:'1px solid rgba(44,31,14,.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px'}}>
                {/* Avatar */}
                <div style={{width:42,height:42,borderRadius:'50%',flexShrink:0,overflow:'hidden',
                  background:rm.color+'22',display:'flex',alignItems:'center',justifyContent:'center',
                  border:`2px solid ${rm.color}30`}}>
                  {u.avatar
                    ? <img src={u.avatar} alt={u.fullName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : <i className={`ti ${rm.icon}`} style={{fontSize:18,color:rm.color}}/>
                  }
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--c-soil)'}}>{u.fullName}</div>
                  <div style={{fontSize:11,color:'var(--c-stone)',marginTop:2,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                    <code style={{background:'rgba(44,31,14,.06)',padding:'1px 5px',borderRadius:4}}>@{u.username}</code>
                    {u.phone && <span>{u.phone}</span>}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:8,
                    background:rm.color+'18',color:rm.color,border:`1px solid ${rm.color}30`}}>
                    {lang==='ar'?rm.ar:rm.en}
                  </span>
                  {!isMe && (
                    <button
                      style={{background:'none',border:'none',cursor:'pointer',
                        padding:'3px 6px',borderRadius:6,color:'var(--c-stone)',fontSize:13}}
                      onClick={()=> isEditing ? cancelEdit() : startEdit(u)}
                      title={t('تعديل الاسم','Edit name')}>
                      <i className={`ti ti-${isEditing?'x':'pencil'}`} style={{fontSize:13}}/>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline name edit */}
              {isEditing && (
                <div style={{margin:'0 14px 12px',padding:12,
                  background:'rgba(26,107,138,.05)',borderRadius:10,
                  border:'1px solid rgba(26,107,138,.15)'}}>
                  <div className="form-group" style={{marginBottom:10}}>
                    <label className="form-label" style={{fontSize:11}}>{t('الاسم الجديد','New display name')}</label>
                    <input className="form-input" value={editName}
                      onChange={e=>setEditName(e.target.value)}
                      placeholder={t('أدخل الاسم...','Enter name...')}
                      autoFocus style={{fontSize:13}}/>
                  </div>
                  <div className="btn-row" style={{marginTop:0}}>
                    <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={()=>saveEdit(u)}>
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

        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'30px 20px',color:'var(--c-stone)'}}>
            <i className="ti ti-users" style={{fontSize:36,display:'block',marginBottom:8,opacity:.3}}/>
            <div style={{fontSize:13}}>{t('لا توجد نتائج','No results found')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export function BroadcastPage() {
  const { t } = useApp()
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div className="page-content">
      <div className="card">
        <div className="card-head"><span className="card-title">{t('إشعار جماعي','Broadcast Notification')}</span></div>
        <div className="card-body">
          <div className="warn-box" style={{marginBottom:12}}>
            <i className="ti ti-alert-triangle" style={{fontSize:15,flexShrink:0}}/>
            <span style={{fontSize:12}}>{t('سيصل هذا الإشعار لجميع المستفيدين المسجلين.','This notification reaches all registered beneficiaries.')}</span>
          </div>
          <div className="form-group">
            <label className="form-label">{t('نص الإشعار','Notification Text')}</label>
            <textarea className="form-textarea" rows={4} value={msg} onChange={e=>setMsg(e.target.value)}
              placeholder={t('اكتب الرسالة هنا...','Write message here...')} style={{width:'100%'}}/>
          </div>
          <button className="btn btn-soil btn-full" disabled={!msg.trim()} onClick={()=>{setSent(true);setMsg('')}}>
            <i className={`ti ti-${sent?'check':'send'}`}/>
            {sent ? t('تم الإرسال ✓','Sent ✓') : t('إرسال للجميع','Send to All')}
          </button>
        </div>
      </div>
    </div>
  )
}

const SAMPLE_AUDIT_LOGS = [
  { actor:'أحمد الرمضاني', action:'اعتماد تسجيل',      entity:'محمد بن خلفان',      at:'2024-09-02 10:30' },
  { actor:'سيف الرمضاني',  action:'تعديل بداية الدورة', entity:'آد عبد — 1 سبتمبر',  at:'2024-09-01 11:25' },
  { actor:'أحمد الرمضاني', action:'رفض تسجيل',          entity:'طلب غير مكتمل',       at:'2024-08-30 09:15' },
]

export function AuditPage() {
  const { t, auditLogs } = useApp()
  const logs = auditLogs.length > 0 ? auditLogs : SAMPLE_AUDIT_LOGS
  const isSample = auditLogs.length === 0
  return (
    <div className="page-content">
      <div className="section-lbl">{t('سجل التدقيق — آخر العمليات','Audit Log — Recent Operations')}</div>
      {isSample && (
        <div className="info-box" style={{marginBottom:8}}>
          <i className="ti ti-info-circle" style={{fontSize:15,flexShrink:0}}/>
          <span style={{fontSize:12}}>{t('لا توجد عمليات مسجلة بعد — يُعرض هنا مثال توضيحي.','No operations recorded yet — showing a sample below.')}</span>
        </div>
      )}
      <div className="card">
        {logs.map((l,i) => (
          <div key={i} style={{padding:'12px 14px',borderBottom:'1px solid rgba(44,31,14,.06)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{fontSize:13,fontWeight:600,color:'var(--c-soil)'}}>{l.action}</div>
              <span style={{fontSize:10,color:'var(--c-stone)',fontFamily:'monospace'}}>{l.at}</span>
            </div>
            <div style={{fontSize:12,color:'var(--c-stone)',marginTop:3}}>
              {t('بواسطة:','By:')} {l.actor} · {l.entity}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
