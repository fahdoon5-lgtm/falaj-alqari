/**
 * صفحة المقايضات — تجميع الحصص
 * يرى المستفيد مقايضاته الحالية ويطلب مقايضات جديدة
 */
import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useAppState'
import { useCycle } from '../hooks/useCycleSettings'
import { AAD_DAYS, SHARES, SHARE_HOLDERS } from '../data/falajData'
import { getHolder } from '../utils/helpers'
import { getCurrentAadInfo, getAgreementStatus } from '../utils/cycleEngine'

const STATUS_LABELS = {
  pending_b:     { ar: 'بانتظار موافقة الطرف ب', en: 'Awaiting party B',  color: '#C8841A', icon: 'ti-clock'     },
  pending_admin: { ar: 'بانتظار موافقة الإدارة', en: 'Awaiting admin',    color: '#1A6B8A', icon: 'ti-shield'    },
  active:        { ar: 'فعّالة',                  en: 'Active',            color: '#1D9E75', icon: 'ti-check'     },
  completed:     { ar: 'منتهية',                  en: 'Completed',         color: '#666',    icon: 'ti-circle-check' },
  cancelled:     { ar: 'ملغاة',                   en: 'Cancelled',         color: '#c0392b', icon: 'ti-x'         },
}

function StatusBadge({ status, t }) {
  const s = STATUS_LABELS[status]
  if (!s) return null
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600,
      background: s.color + '1a', color: s.color, border: `1px solid ${s.color}33`,
    }}>
      <i className={`ti ${s.icon}`} style={{fontSize:11}}/>
      {t(s.ar, s.en)}
    </span>
  )
}

function AgreementCard({ ag, cycleNumber, currentUser, t, onApproveB, onRejectB, onCancel }) {
  const holderA  = getHolder(ag.holderAId)
  const holderB  = ag.holderBId ? getHolder(ag.holderBId) : null
  const aad      = AAD_DAYS.find(d => d.id === ag.aadId)
  const agStatus = ag.status === 'active' ? getAgreementStatus({
    status: ag.status,
    start_cycle_number: ag.startCycleNumber,
    accumulation_cycles: ag.accumulationCycles,
    is_recurring: ag.isRecurring,
    athars_per_cycle: ag.atharsPerCycle,
  }, cycleNumber) : null

  const isMyBApproval = ag.status === 'pending_b' && ag.holderBId === currentUser?.holderId
  const isMineA       = ag.holderAId === currentUser?.holderId
  const canCancel     = (isMineA || isMyBApproval) && ['pending_b','pending_admin','active'].includes(ag.status)

  return (
    <div style={{
      background:'rgba(255,255,255,.9)', borderRadius:16, padding:16,
      border: isMyBApproval ? '1.5px solid #C8841A' : '1px solid rgba(44,31,14,.08)',
      boxShadow: '0 2px 12px rgba(44,31,14,.06)', marginBottom:10,
    }}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'var(--c-soil)'}}>
            {aad?.name} · {t('الترتيب','Order')} {ag.shareOrder}
          </div>
          <div style={{fontSize:11,color:'var(--c-stone)',marginTop:2}}>
            {ag.atharsPerCycle} {t('أثر/دورة × ','athars/cycle ×')} {ag.accumulationCycles} {t('دورات','cycles')}
            {' → '}<strong style={{color:'var(--c-water)'}}>{ag.atharsPerCycle * ag.accumulationCycles}</strong> {t('أثر في الصرف','athars on payout')}
          </div>
        </div>
        <StatusBadge status={ag.status} t={t}/>
      </div>

      {/* Parties */}
      <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:100,background:'rgba(26,107,138,.06)',borderRadius:10,padding:'8px 10px'}}>
          <div style={{fontSize:10,color:'var(--c-stone)',marginBottom:2}}>{t('الطرف أ (المجمِّع)','Party A (Accumulator)')}</div>
          <div style={{fontSize:12,fontWeight:600,color:'var(--c-water)'}}>
            <i className="ti ti-user" style={{fontSize:11,marginLeft:4}}/>
            {holderA.name}
          </div>
        </div>
        {holderB && (
          <div style={{flex:1,minWidth:100,background:'rgba(45,106,45,.06)',borderRadius:10,padding:'8px 10px'}}>
            <div style={{fontSize:10,color:'var(--c-stone)',marginBottom:2}}>{t('الطرف ب','Party B')}</div>
            <div style={{fontSize:12,fontWeight:600,color:'#2D6A2D'}}>
              <i className="ti ti-user" style={{fontSize:11,marginLeft:4}}/>
              {holderB.name}
            </div>
          </div>
        )}
      </div>

      {/* Active phase indicator */}
      {agStatus && (
        <div style={{
          background: agStatus.phase === 'payout'
            ? 'linear-gradient(135deg,rgba(29,158,117,.1),rgba(29,158,117,.05))'
            : 'rgba(200,132,26,.07)',
          border: `1px solid ${agStatus.phase === 'payout' ? 'rgba(29,158,117,.25)' : 'rgba(200,132,26,.2)'}`,
          borderRadius:10, padding:'8px 12px', marginBottom:10,
          display:'flex', alignItems:'center', gap:8,
        }}>
          <i className={`ti ${agStatus.phase === 'payout' ? 'ti-trophy' : 'ti-refresh'}`}
            style={{fontSize:16, color: agStatus.phase === 'payout' ? '#1D9E75' : '#C8841A'}}/>
          <div>
            <div style={{fontSize:12,fontWeight:700,color: agStatus.phase === 'payout' ? '#1D9E75' : '#C8841A'}}>
              {agStatus.phase === 'payout'
                ? t(`دورة الصرف — تحصل على ${agStatus.payoutAthars} أثر`, `Payout cycle — you receive ${agStatus.payoutAthars} athars`)
                : t(`دورة تجميع ${agStatus.cycleInPeriod}/${agStatus.totalCycles}`, `Accumulating ${agStatus.cycleInPeriod}/${agStatus.totalCycles}`)}
            </div>
            {ag.isRecurring && (
              <div style={{fontSize:10,color:'var(--c-stone)',marginTop:1}}>
                <i className="ti ti-repeat" style={{fontSize:10,marginLeft:3}}/>
                {t('متكررة — الفترة','Recurring — period')} #{agStatus.periodNumber}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {ag.notes && (
        <div style={{fontSize:11,color:'var(--c-stone)',marginBottom:10}}>
          <i className="ti ti-notes" style={{fontSize:11,marginLeft:4}}/>
          {ag.notes}
        </div>
      )}
      {ag.adminNotes && (
        <div style={{fontSize:11,color:'#c0392b',marginBottom:10}}>
          <i className="ti ti-message-circle" style={{fontSize:11,marginLeft:4}}/>
          {t('ملاحظة الإدارة:','Admin note:')} {ag.adminNotes}
        </div>
      )}

      {/* Actions */}
      {isMyBApproval && (
        <div style={{display:'flex',gap:8,marginTop:4}}>
          <button
            className="btn btn-primary"
            style={{flex:1,fontSize:12}}
            onClick={() => onApproveB(ag.id)}
          >
            <i className="ti ti-check"/>{t('موافقة','Approve')}
          </button>
          <button
            className="btn"
            style={{flex:1,fontSize:12,background:'rgba(192,57,43,.08)',color:'#c0392b',border:'1px solid rgba(192,57,43,.2)'}}
            onClick={() => onRejectB(ag.id)}
          >
            <i className="ti ti-x"/>{t('رفض','Reject')}
          </button>
        </div>
      )}
      {canCancel && !isMyBApproval && (
        <button
          className="btn"
          style={{fontSize:11,color:'var(--c-stone)',background:'rgba(44,31,14,.04)',border:'1px solid rgba(44,31,14,.1)'}}
          onClick={() => onCancel(ag.id)}
        >
          <i className="ti ti-x"/>{t('إلغاء الاتفاقية','Cancel agreement')}
        </button>
      )}
    </div>
  )
}

/* ═══════════ FORM NEW AGREEMENT ═══════════ */
function NewAgreementForm({ onSubmit, onClose, currentUser, users, t }) {
  const myShares = useMemo(() => {
    if (!currentUser?.holderId) return []
    const result = []
    AAD_DAYS.forEach(day => {
      const dayShares = (SHARES[day.id] || []).filter(s => s.holderId === currentUser.holderId)
      dayShares.forEach(sh => result.push({ aad: day, share: sh }))
    })
    return result
  }, [currentUser?.holderId])

  const [selectedShare, setSelectedShare] = useState(myShares[0] || null)
  const [holderBId,   setHolderBId]   = useState('')
  const [cycles,      setCycles]      = useState(3)
  const [recurring,   setRecurring]   = useState(true)
  const [notes,       setNotes]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  // المستفيدون الآخرون في نفس الآد لاختيار الطرف ب
  const otherHoldersInAad = useMemo(() => {
    if (!selectedShare) return []
    const inAad = new Set(
      (SHARES[selectedShare.aad.id] || []).map(s => s.holderId)
    )
    return SHARE_HOLDERS.filter(h => h.id !== currentUser?.holderId && inAad.has(h.id))
  }, [selectedShare, currentUser?.holderId])

  const handleSubmit = async () => {
    if (!selectedShare) return
    setSubmitting(true)
    const partyBUser = holderBId
      ? users.find(u => u.holderId === holderBId && u.status === 'active')
      : null
    await onSubmit({
      holderAId: currentUser.holderId,
      userAId: currentUser.id,
      holderBId: holderBId || null,
      userBId: partyBUser?.id || null,
      aadId: selectedShare.aad.id,
      shareOrder: selectedShare.share.order,
      atharsPerCycle: selectedShare.share.athars,
      accumulationCycles: cycles,
      isRecurring: recurring,
      notes: notes || null,
    })
    setSubmitting(false)
    onClose()
  }

  if (myShares.length === 0) {
    return (
      <div className="warn-box">
        <i className="ti ti-alert-circle" style={{fontSize:16}}/>
        <span>{t('ليس لديك حصص مسجلة لطلب مقايضة.','You have no registered shares to request an agreement.')}</span>
      </div>
    )
  }

  return (
    <div style={{background:'rgba(255,255,255,.95)',borderRadius:16,padding:16,border:'1px solid rgba(44,31,14,.1)',boxShadow:'0 4px 20px rgba(44,31,14,.1)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:700,color:'var(--c-soil)'}}>
          <i className="ti ti-arrows-exchange" style={{fontSize:15,color:'var(--c-water)',marginLeft:6}}/>
          {t('طلب مقايضة جديدة','New Accumulation Agreement')}
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'var(--c-stone)',cursor:'pointer',padding:4}}>
          <i className="ti ti-x" style={{fontSize:16}}/>
        </button>
      </div>

      <div className="info-box" style={{marginBottom:14}}>
        <i className="ti ti-bulb" style={{fontSize:15,flexShrink:0}}/>
        <span style={{fontSize:11}}>
          {t(
            'تجميع الحصص: تتنازل عن حصتك في عدة دورات وتحصل على المجموع في دورة واحدة.',
            'Share accumulation: give up your share for several cycles and receive the total in one cycle.'
          )}
        </span>
      </div>

      {/* اختيار الحصة */}
      <div className="form-group">
        <label className="form-label">
          <span style={{background:'var(--c-water)',color:'#fff',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,marginLeft:6}}>1</span>
          {t('اختر الحصة المراد تجميعها','Select the share to accumulate')}
        </label>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {myShares.map(({ aad, share }) => (
            <button key={`${aad.id}-${share.order}`}
              onClick={() => { setSelectedShare({ aad, share }); setHolderBId('') }}
              style={{
                padding:'10px 12px', borderRadius:10, textAlign:'right',
                border: (selectedShare?.aad.id === aad.id && selectedShare?.share.order === share.order)
                  ? '2px solid var(--c-water)'
                  : '1.5px solid rgba(44,31,14,.1)',
                background: (selectedShare?.aad.id === aad.id && selectedShare?.share.order === share.order)
                  ? 'rgba(26,107,138,.06)' : 'rgba(255,255,255,.8)',
                cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:'var(--c-soil)'}}>{aad.name}</div>
                <div style={{fontSize:11,color:'var(--c-stone)'}}>{share.startTime} — {share.endTime}</div>
              </div>
              <span style={{fontWeight:700,fontSize:13,color:'var(--c-water)'}}>
                {share.athars} {t('أثر','athr')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* اختيار عدد الدورات */}
      <div className="form-group">
        <label className="form-label">
          <span style={{background:'var(--c-water)',color:'#fff',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,marginLeft:6}}>2</span>
          {t('عدد دورات التجميع','Number of accumulation cycles')}
        </label>
        <div style={{display:'flex',gap:6}}>
          {[2,3,4,6].map(n => (
            <button key={n} onClick={() => setCycles(n)}
              style={{
                flex:1, padding:'8px 0', borderRadius:10, fontSize:13, fontWeight:700,
                border: cycles === n ? '2px solid var(--c-water)' : '1.5px solid rgba(44,31,14,.1)',
                background: cycles === n ? 'rgba(26,107,138,.1)' : 'rgba(255,255,255,.8)',
                color: cycles === n ? 'var(--c-water)' : 'var(--c-soil)', cursor:'pointer',
              }}>
              {n}
            </button>
          ))}
        </div>
        {selectedShare && (
          <div style={{fontSize:11,color:'var(--c-water)',marginTop:6,fontWeight:600}}>
            {t('ستحصل على','You will receive')} {selectedShare.share.athars * cycles} {t('أثراً في دورة الصرف','athars on the payout cycle')}
          </div>
        )}
      </div>

      {/* الطرف ب (اختياري) */}
      <div className="form-group">
        <label className="form-label">
          <span style={{background:'var(--c-water)',color:'#fff',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,marginLeft:6}}>3</span>
          {t('الطرف ب (اختياري)','Party B (optional)')}
          <span style={{fontSize:10,color:'var(--c-stone)',marginRight:4}}>— {t('من يستفيد من حصتك خلال التجميع','who benefits from your share during accumulation')}</span>
        </label>
        <select className="form-input"
          value={holderBId}
          onChange={e => setHolderBId(e.target.value)}>
          <option value="">{t('بدون طرف ب — الحصة تبقى في مجرى الفلج','No party B — share remains in canal flow')}</option>
          {otherHoldersInAad.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <div className="form-hint">
          {holderBId
            ? t('سيحتاج الطرف ب للموافقة قبل عرض الطلب على الإدارة.','Party B must approve before it goes to admin.')
            : t('بدون طرف ب، يذهب الطلب مباشرة للإدارة.','Without party B, the request goes directly to admin.')}
        </div>
      </div>

      {/* متكررة */}
      <div className="form-group">
        <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
          <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)}
            style={{width:16,height:16,accentColor:'var(--c-water)'}}/>
          <span style={{fontSize:12,color:'var(--c-soil)',fontWeight:500}}>
            {t('مقايضة متكررة (يتجدد التجميع تلقائياً)','Recurring agreement (accumulation repeats automatically)')}
          </span>
        </label>
        <div className="form-hint">
          {t(
            'الإدارة هي من تحدد هذا الإعداد عند الاعتماد — قيمتك هنا للإشارة فقط.',
            'Admin sets this definitively on approval — your choice here is indicative only.'
          )}
        </div>
      </div>

      {/* ملاحظات */}
      <div className="form-group">
        <label className="form-label">{t('ملاحظات (اختياري)','Notes (optional)')}</label>
        <textarea className="form-input" rows={2}
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={t('أي تفاصيل إضافية…','Any additional details…')}
          style={{resize:'vertical',minHeight:56}}/>
      </div>

      <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={submitting || !selectedShare}>
        <i className="ti ti-send"/>
        {submitting ? t('جاري الإرسال…','Sending…') : t('إرسال الطلب','Submit Request')}
      </button>
    </div>
  )
}

/* ═══════════ MAIN PAGE ═══════════ */
export default function AgreementsPage() {
  const {
    t, currentUser, users,
    agreements, pendingAgreementsForMe,
    requestAgreement, approveAgreementByB, rejectAgreementByB, cancelAgreement,
  } = useApp()
  const { cycleStart } = useCycle()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]     = useState('all')

  const cycleInfo = getCurrentAadInfo(cycleStart, new Date())
  const cycleNumber = cycleInfo?.cycleNumber || null

  // مقايضاتي (كطرف أ أو ب)
  const myAgreements = agreements.filter(a =>
    a.holderAId === currentUser?.holderId ||
    a.holderBId === currentUser?.holderId
  )

  const filtered = myAgreements.filter(a => {
    if (filter === 'all')     return true
    if (filter === 'active')  return a.status === 'active'
    if (filter === 'pending') return ['pending_b','pending_admin'].includes(a.status)
    if (filter === 'closed')  return ['completed','cancelled'].includes(a.status)
    return true
  })

  return (
    <div className="page-content">

      {/* طلبات تحتاج موافقتي */}
      {pendingAgreementsForMe.length > 0 && (
        <div className="warn-box" style={{borderColor:'#C8841A33',background:'rgba(200,132,26,.06)'}}>
          <i className="ti ti-bell" style={{fontSize:16,color:'#C8841A',flexShrink:0}}/>
          <span style={{color:'#C8841A',fontWeight:600}}>
            {t(
              `لديك ${pendingAgreementsForMe.length} طلب مقايضة بانتظار موافقتك كطرف ب.`,
              `You have ${pendingAgreementsForMe.length} agreement request(s) awaiting your approval as Party B.`
            )}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:'var(--c-soil)'}}>
            <i className="ti ti-arrows-exchange" style={{fontSize:16,color:'var(--c-water)',marginLeft:6}}/>
            {t('المقايضات','Agreements')}
          </div>
          <div style={{fontSize:11,color:'var(--c-stone)',marginTop:2}}>
            {t('تجميع الحصص عبر الدورات','Share accumulation across cycles')}
          </div>
        </div>
        <button className="btn btn-primary" style={{fontSize:12}} onClick={() => setShowForm(v => !v)}>
          <i className={`ti ${showForm ? 'ti-x' : 'ti-plus'}`}/>
          {showForm ? t('إلغاء','Cancel') : t('طلب جديد','New Request')}
        </button>
      </div>

      {showForm && (
        <NewAgreementForm
          onSubmit={requestAgreement}
          onClose={() => setShowForm(false)}
          currentUser={currentUser}
          users={users}
          t={t}
        />
      )}

      {/* Filters */}
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:2}}>
        {[
          { id:'all',     ar:'الكل',    en:'All'     },
          { id:'pending', ar:'معلقة',   en:'Pending' },
          { id:'active',  ar:'فعّالة',  en:'Active'  },
          { id:'closed',  ar:'منتهية',  en:'Closed'  },
        ].map(f => (
          <button key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600,
              border: filter === f.id ? '1.5px solid var(--c-water)' : '1px solid rgba(44,31,14,.1)',
              background: filter === f.id ? 'rgba(26,107,138,.1)' : 'rgba(255,255,255,.8)',
              color: filter === f.id ? 'var(--c-water)' : 'var(--c-stone)',
              cursor:'pointer', whiteSpace:'nowrap',
            }}>
            {t(f.ar, f.en)}
            {f.id === 'pending' && pendingAgreementsForMe.length > 0 && (
              <span style={{marginRight:5,background:'#C8841A',color:'#fff',borderRadius:'50%',width:16,height:16,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10}}>
                {pendingAgreementsForMe.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'32px 16px',color:'var(--c-stone)'}}>
          <i className="ti ti-arrows-exchange" style={{fontSize:32,display:'block',marginBottom:8,opacity:.3}}/>
          <div style={{fontSize:13}}>
            {myAgreements.length === 0
              ? t('لا توجد مقايضات بعد — اضغط "طلب جديد" لبدء واحدة.','No agreements yet — tap "New Request" to start one.')
              : t('لا مقايضات في هذا التصنيف.','No agreements in this category.')}
          </div>
        </div>
      ) : (
        filtered.map(ag => (
          <AgreementCard
            key={ag.id}
            ag={ag}
            cycleNumber={cycleNumber}
            currentUser={currentUser}
            t={t}
            onApproveB={approveAgreementByB}
            onRejectB={rejectAgreementByB}
            onCancel={cancelAgreement}
          />
        ))
      )}
    </div>
  )
}
