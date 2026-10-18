import { useState } from 'react'
import { useApp } from '../hooks/useAppState'
import { useCycle } from '../hooks/useCycleSettings'
import { AAD_DAYS, SHARE_HOLDERS } from '../data/falajData'
import { getCurrentAadInfo, formatCountdown } from '../utils/cycleEngine'

export function SuperAdminHome({ onTab }) {
  const { t, pendingRegs } = useApp()
  const { cycleStart, settings } = useCycle()
  const [now] = useState(new Date())
  const info = getCurrentAadInfo(cycleStart, now)

  const actions = [
    { icon:'ti-clock-edit',      label:t('إعدادات الدورة — ضبط بداية الآد','Cycle Settings — Set Aad start'), tab:'cycle_settings', color:'#1A6B8A', highlight:true },
    { icon:'ti-user-check',      label:t('طلبات التسجيل','Registrations'),      tab:'registrations', badge:pendingRegs.length||null, color:'#C8841A' },
    { icon:'ti-git-branch',      label:t('تقسيم الحصص','Share Splits'),         tab:'splits',        color:'#2D6A2D' },
    { icon:'ti-arrows-exchange', label:t('المقايضات','Swaps'),                  tab:'swaps',         color:'#8B3A62' },
    { icon:'ti-chart-bar',       label:t('التقارير الإحصائية','Reports'),       tab:'reports',       color:'#5C3D1E' },
    { icon:'ti-shield-check',    label:t('سجل التدقيق','Audit Log'),            tab:'audit',         color:'#0D4F6A' },
    { icon:'ti-file-text',       label:t('أرشيف الوثائق','Documents Archive'), tab:'documents',     color:'#993C1D' },
    { icon:'ti-send',            label:t('إشعارات جماعية','Broadcast'),         tab:'broadcast',     color:'#6B4A2D' },
  ]

  return (
    <div className="page-content">

      {/* Cycle Status */}
      {info && (
        <div style={{background:'linear-gradient(135deg,#0D1F2D,#1a3a4a)',borderRadius:20,padding:16,color:'#fff',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(13,31,45,.3)'}}>
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
          <button onClick={()=>onTab('cycle_settings')} style={{marginTop:12,width:'100%',padding:'8px',borderRadius:10,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.8)',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'background .15s',position:'relative',zIndex:1}}>
            <i className="ti ti-settings" style={{fontSize:14}}/>
            {t('تعديل بداية الدورة','Edit cycle start')}
            {settings?.updatedAt && <span style={{fontSize:10,opacity:.6,marginRight:6}}>({settings.updatedAt.toLocaleDateString('ar-OM',{day:'numeric',month:'short'})})</span>}
          </button>
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-val">{SHARE_HOLDERS.length}</div>
          <div className="metric-lbl">{t('إجمالي الملاك','Total shareholders')}</div>
        </div>
        <div className="metric-card">
          <div className="metric-val">{AAD_DAYS.length}</div>
          <div className="metric-lbl">{t('أيام الدورة','Cycle days')}</div>
        </div>
        <div className="metric-card">
          <div className="metric-val">{pendingRegs.length}</div>
          <div className="metric-lbl">{t('طلبات معلقة','Pending requests')}</div>
          <div className="metric-badge">
            {pendingRegs.length>0
              ? <span className="badge badge-sun">{t('مراجعة','Review')}</span>
              : <span className="badge badge-palm">{t('لا شيء','Clear')}</span>}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-val">{info?.cycleNumber ?? '—'}</div>
          <div className="metric-lbl">{t('رقم الدورة الحالية','Current cycle #')}</div>
          <div className="metric-badge"><span className="badge badge-water">2024</span></div>
        </div>
      </div>

      <div className="section-lbl">{t('لوحة التحكم الكاملة','Full Control Panel')}</div>
      <div className="card">
        <div className="card-body" style={{display:'flex',flexDirection:'column',gap:8}}>
          {actions.map(a => (
            <button key={a.tab} className="btn btn-outline btn-full"
              style={{justifyContent:'flex-start',gap:10,border: a.highlight?'1.5px solid rgba(26,107,138,.3)':'',background:a.highlight?'rgba(26,107,138,.05)':''}}
              onClick={()=>onTab(a.tab)}>
              <div style={{width:36,height:36,borderRadius:'50%',background:`${a.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <i className={`ti ${a.icon}`} style={{fontSize:17,color:a.color}}/>
              </div>
              <span style={{flex:1,textAlign:'right',fontSize:13,fontWeight:a.highlight?600:400,color:a.highlight?'var(--c-water)':'var(--c-soil)'}}>{a.label}</span>
              {a.badge && <span className="badge badge-sun">{a.badge}</span>}
              <i className="ti ti-chevron-left" style={{fontSize:13,color:'var(--c-stone)'}}/>
            </button>
          ))}
        </div>
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
