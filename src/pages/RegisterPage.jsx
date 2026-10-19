import { useState } from 'react'
import { useApp } from '../hooks/useAppState'
import { SHARE_HOLDERS } from '../data/falajData'
import { initials, holderColor } from '../utils/helpers'

const STEPS = ['personal', 'share', 'relation', 'confirm']

const RELATION_TYPES = [
  { id:'individual', ar:'أنا صاحب الحصة مباشرة',  en:'I am the direct shareholder', icon:'ti-user'         },
  { id:'son',        ar:'ابن / ابنة صاحب الحصة',   en:'Son / Daughter of holder',    icon:'ti-users'        },
  { id:'grandson',   ar:'حفيد / حفيدة',             en:'Grandchild of holder',        icon:'ti-users-group'  },
  { id:'heir',       ar:'وارث آخر',                 en:'Other heir',                  icon:'ti-file-text'    },
  { id:'agent',      ar:'وكيل / مفوَّض',            en:'Agent / Representative',      icon:'ti-briefcase'    },
]

function StepIndicator({ current }) {
  const labels = ['البيانات الشخصية','اختيار الحصة','نوع العلاقة','التأكيد']
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,marginBottom:20,padding:'0 4px'}}>
      {labels.map((label, i) => {
        const done    = i < STEPS.indexOf(current)
        const active  = i === STEPS.indexOf(current)
        return (
          <div key={i} style={{display:'flex',alignItems:'center',flex: i<labels.length-1?1:'unset'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,minWidth:48}}>
              <div style={{
                width:28,height:28,borderRadius:'50%',
                background: done?'#1D9E75':active?'#1A6B8A':'rgba(44,31,14,.1)',
                color: done||active?'#fff':'rgba(44,31,14,.3)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:11,fontWeight:700,transition:'all .25s',
                boxShadow: active?'0 0 0 3px rgba(26,107,138,.2)':'none',
              }}>
                {done ? <i className="ti ti-check" style={{fontSize:13}}/> : i+1}
              </div>
              <span style={{fontSize:9,color:active?'var(--c-water)':done?'#1D9E75':'var(--c-stone)',fontWeight:active?700:400,textAlign:'center',whiteSpace:'nowrap'}}>
                {label}
              </span>
            </div>
            {i < labels.length-1 && (
              <div style={{flex:1,height:2,background: done?'#1D9E75':'rgba(44,31,14,.08)',margin:'0 4px',marginBottom:16,borderRadius:1,transition:'background .25s'}}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function RegisterPage({ onBack, onSuccess }) {
  const { t, lang, submitRegistration } = useApp()
  const [step, setStep]   = useState('personal')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    holderId: '', relationType: '', relationNote: '',
  })

  const set = (k, v) => {
    setForm(f => ({...f, [k]: v}))
    setErrors(e => ({...e, [k]: ''}))
  }

  // ── التحقق من كل خطوة ──
  const validate = () => {
    const e = {}
    if (step === 'personal') {
      if (!form.fullName.trim() || form.fullName.trim().split(' ').length < 2)
        e.fullName = t('أدخل الاسم كاملاً (اسمان على الأقل)','Enter full name (at least 2 words)')
      if (!form.phone.trim() || !/^[+\d\s]{8,15}$/.test(form.phone.trim()))
        e.phone = t('أدخل رقم هاتف صحيح','Enter a valid phone number')
    }
    if (step === 'share') {
      if (!form.holderId)
        e.holderId = t('اختر الحصة التي تمثلها','Select the share you represent')
    }
    if (step === 'relation') {
      if (!form.relationType)
        e.relationType = t('حدد نوع علاقتك بصاحب الحصة','Specify your relation to the shareholder')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep(STEPS[STEPS.indexOf(step)+1]) }
  const back = () => {
    const idx = STEPS.indexOf(step)
    if (idx === 0) onBack()
    else setStep(STEPS[idx-1])
  }

  const submit = async () => {
    setSubmitting(true)
    const result = await submitRegistration({
      fullName: form.fullName,
      phone: form.phone,
      requestedHolderId: form.holderId,
      relationType: form.relationType,
      relationNote: form.relationNote,
    })
    setSubmitting(false)
    if (result?.ok) {
      onSuccess({ ...form, submittedAt: new Date().toISOString() })
    } else {
      setErrors({ submit: t('حدث خطأ، حاول مرة أخرى', 'An error occurred, please try again') })
    }
  }

  const holder = SHARE_HOLDERS.find(s => s.id === form.holderId)
  const filteredHolders = SHARE_HOLDERS.filter(s =>
    !searchQuery ||
    s.name.includes(searchQuery) ||
    s.tribe.includes(searchQuery)
  )

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0D1F2D,#1a3a2a,#2C1F0E)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden'}}>
      {/* خلفية زخرفية */}
      <div style={{position:'absolute',inset:0,opacity:.04,backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)'}}/>
      <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(26,107,138,.2),transparent 70%)'}}/>
      <div style={{position:'absolute',bottom:-40,left:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(45,106,45,.15),transparent 70%)'}}/>

      {/* Header */}
      <div style={{textAlign:'center',marginBottom:24,position:'relative',zIndex:1}}>
        <div style={{width:60,height:60,borderRadius:'50%',background:'linear-gradient(135deg,#1A6B8A,#4A9DB5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,color:'#fff',margin:'0 auto 12px',boxShadow:'0 8px 32px rgba(26,107,138,.4)'}}>
          <i className="ti ti-droplet"/>
        </div>
        <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>{t('التسجيل في فلج القري','Register — Falaj Al-Qari')}</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.45)',marginTop:4}}>{t('سيتم مراجعة طلبك من الأدمن','Your request will be reviewed by admin')}</div>
      </div>

      {/* Card */}
      <div style={{background:'rgba(255,255,255,.97)',borderRadius:24,padding:24,width:'100%',maxWidth:400,position:'relative',zIndex:1,boxShadow:'0 20px 60px rgba(13,31,45,.4)'}}>

        <StepIndicator current={step}/>

        {/* ── الخطوة 1: البيانات الشخصية ── */}
        {step === 'personal' && (
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            <div style={{fontSize:14,fontWeight:700,color:'var(--c-soil)',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
              <i className="ti ti-user-circle" style={{fontSize:18,color:'var(--c-water)'}}/>
              {t('بياناتك الشخصية','Your Personal Info')}
            </div>

            <div className="form-group">
              <label className="form-label">{t('الاسم الكامل','Full Name')} *</label>
              <input className="form-input" value={form.fullName}
                onChange={e=>set('fullName',e.target.value)}
                placeholder={t('مثال: خليفة بن محفوظ التوبي','e.g. Khalifa bin Mahfouz Al-Tobi')}/>
              {errors.fullName && <div style={{fontSize:11,color:'var(--c-danger)',marginTop:4}}><i className="ti ti-alert-circle" style={{fontSize:11,marginLeft:3}}/>{errors.fullName}</div>}
              <div className="form-hint">{t('كما هو في الوثائق الرسمية','As shown in official documents')}</div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('رقم الهاتف','Phone Number')} *</label>
              <input className="form-input" value={form.phone} type="tel"
                onChange={e=>set('phone',e.target.value)}
                placeholder="+968 9X XXX XXX"
                style={{fontFamily:'IBM Plex Mono,monospace',letterSpacing:'.05em'}}/>
              {errors.phone && <div style={{fontSize:11,color:'var(--c-danger)',marginTop:4}}><i className="ti ti-alert-circle" style={{fontSize:11,marginLeft:3}}/>{errors.phone}</div>}
              <div className="form-hint">{t('سيُستخدم لتسجيل الدخول والتذكيرات','Used for login and reminders')}</div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('البريد الإلكتروني','Email')} <span style={{color:'var(--c-stone)',fontWeight:400}}>{t('(اختياري)','(optional)')}</span></label>
              <input className="form-input" value={form.email} type="email"
                onChange={e=>set('email',e.target.value)}
                placeholder="example@email.com"
                style={{direction:'ltr',textAlign:'left'}}/>
            </div>
          </div>
        )}

        {/* ── الخطوة 2: اختيار الحصة ── */}
        {step === 'share' && (
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--c-soil)',marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
              <i className="ti ti-droplet" style={{fontSize:18,color:'var(--c-water)'}}/>
              {t('اختر الحصة التي تمثلها','Select Your Share')}
            </div>
            <div style={{fontSize:12,color:'var(--c-stone)',marginBottom:14}}>
              {t('ابحث عن اسم صاحب الحصة الأصلي كما هو في وثيقة الفلج','Search for the original shareholder name as in the Falaj document')}
            </div>

            {errors.holderId && (
              <div style={{fontSize:11,color:'var(--c-danger)',marginBottom:10,display:'flex',alignItems:'center',gap:4}}>
                <i className="ti ti-alert-circle" style={{fontSize:12}}/>{errors.holderId}
              </div>
            )}

            <div className="search-wrap" style={{marginBottom:10}}>
              <i className="ti ti-search" style={{color:'var(--c-stone)',fontSize:15}}/>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder={t('ابحث بالاسم أو القبيلة...','Search by name or tribe...')}
                autoFocus/>
              {searchQuery && <i className="ti ti-x" style={{cursor:'pointer',color:'var(--c-stone)',fontSize:14}} onClick={()=>setSearchQuery('')}/>}
            </div>

            {/* المحدد */}
            {form.holderId && (
              <div style={{background:'rgba(26,107,138,.08)',border:'1.5px solid rgba(26,107,138,.25)',borderRadius:12,padding:'10px 12px',marginBottom:10,display:'flex',alignItems:'center',gap:10}}>
                <div className="av" style={{background:holderColor(form.holderId),width:32,height:32,fontSize:11,flexShrink:0}}>
                  {initials(holder?.name||'')}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--c-water)'}}>{holder?.name}</div>
                  <div style={{fontSize:11,color:'var(--c-stone)',marginTop:1}}>{holder?.tribe}</div>
                </div>
                <i className="ti ti-circle-check-filled" style={{fontSize:20,color:'var(--c-water)'}}/>
              </div>
            )}

            <div style={{maxHeight:260,overflowY:'auto',borderRadius:12,border:'1px solid rgba(44,31,14,.08)'}}>
              {filteredHolders.length === 0 ? (
                <div style={{padding:'24px',textAlign:'center',color:'var(--c-stone)',fontSize:13}}>
                  {t('لا نتائج — جرّب كلمة أخرى','No results — try another word')}
                </div>
              ) : filteredHolders.map(sh => (
                <div key={sh.id}
                  onClick={()=>{ set('holderId', sh.id); setSearchQuery('') }}
                  style={{
                    display:'flex',alignItems:'center',gap:10,
                    padding:'10px 12px',cursor:'pointer',
                    borderBottom:'1px solid rgba(44,31,14,.05)',
                    background: form.holderId===sh.id ? 'rgba(26,107,138,.06)' : 'transparent',
                    transition:'background .15s',
                  }}>
                  <div className="av" style={{background:holderColor(sh.id),width:30,height:30,fontSize:10,flexShrink:0}}>
                    {initials(sh.name)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5,fontWeight:500,color:'var(--c-soil)'}}>{sh.name}</div>
                    <div style={{fontSize:11,color:'var(--c-stone)',marginTop:1}}>
                      {sh.tribe}
                      {sh.type==='heirs'&&<span style={{marginRight:6,fontSize:10,color:'var(--c-dusk)'}}>· {t('ورثة','Heirs')}</span>}
                      {sh.type==='joint'&&<span style={{marginRight:6,fontSize:10,color:'var(--c-water)'}}>· {t('مشترك','Joint')}</span>}
                    </div>
                  </div>
                  {form.holderId===sh.id && <i className="ti ti-check" style={{fontSize:16,color:'var(--c-water)'}}/>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── الخطوة 3: نوع العلاقة ── */}
        {step === 'relation' && (
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--c-soil)',marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
              <i className="ti ti-heart-handshake" style={{fontSize:18,color:'var(--c-water)'}}/>
              {t('ما علاقتك بصاحب الحصة؟','Your relation to the shareholder?')}
            </div>

            {holder && (
              <div style={{background:'var(--c-sand)',borderRadius:10,padding:'8px 12px',marginBottom:14,fontSize:12,color:'var(--c-stone)',display:'flex',alignItems:'center',gap:8}}>
                <i className="ti ti-droplet" style={{color:'var(--c-water)',fontSize:14}}/>
                <span>{t('الحصة المختارة:','Selected share:')} <strong style={{color:'var(--c-soil)'}}>{holder.name}</strong></span>
              </div>
            )}

            {errors.relationType && (
              <div style={{fontSize:11,color:'var(--c-danger)',marginBottom:10,display:'flex',alignItems:'center',gap:4}}>
                <i className="ti ti-alert-circle" style={{fontSize:12}}/>{errors.relationType}
              </div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
              {RELATION_TYPES.map(rt => (
                <div key={rt.id}
                  onClick={()=>set('relationType', rt.id)}
                  style={{
                    display:'flex',alignItems:'center',gap:12,
                    padding:'12px 14px',borderRadius:12,cursor:'pointer',
                    border: form.relationType===rt.id ? '2px solid var(--c-water)' : '1.5px solid rgba(44,31,14,.1)',
                    background: form.relationType===rt.id ? 'rgba(26,107,138,.07)' : 'rgba(247,242,234,.5)',
                    transition:'all .18s',
                  }}>
                  <div style={{width:36,height:36,borderRadius:'50%',background: form.relationType===rt.id?'rgba(26,107,138,.15)':'rgba(44,31,14,.06)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <i className={`ti ${rt.icon}`} style={{fontSize:17,color: form.relationType===rt.id?'var(--c-water)':'var(--c-stone)'}}/>
                  </div>
                  <span style={{fontSize:13,fontWeight: form.relationType===rt.id?600:400,color: form.relationType===rt.id?'var(--c-water)':'var(--c-soil)'}}>
                    {lang==='ar'?rt.ar:rt.en}
                  </span>
                  {form.relationType===rt.id && <i className="ti ti-circle-check-filled" style={{fontSize:18,color:'var(--c-water)',marginRight:'auto'}}/>}
                </div>
              ))}
            </div>

            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">
                {t('ملاحظة للأدمن','Note for admin')}
                <span style={{color:'var(--c-stone)',fontWeight:400,fontSize:11,marginRight:6}}>{t('(اختياري)','(optional)')}</span>
              </label>
              <textarea className="form-textarea" rows={3} value={form.relationNote}
                onChange={e=>set('relationNote',e.target.value)}
                placeholder={t('أي معلومة إضافية تساعد الأدمن في التحقق من طلبك...','Any additional info to help admin verify your request...')}
                style={{width:'100%'}}/>
            </div>
          </div>
        )}

        {/* ── الخطوة 4: التأكيد ── */}
        {step === 'confirm' && (
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--c-soil)',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
              <i className="ti ti-clipboard-check" style={{fontSize:18,color:'var(--c-water)'}}/>
              {t('مراجعة وتأكيد الطلب','Review & Confirm')}
            </div>

            {/* ملخص */}
            {[
              { icon:'ti-user',            label:t('الاسم','Name'),        value:form.fullName },
              { icon:'ti-phone',           label:t('الهاتف','Phone'),      value:form.phone    },
              { icon:'ti-mail',            label:t('البريد','Email'),      value:form.email||t('—','—') },
              { icon:'ti-droplet',         label:t('الحصة','Share'),       value:holder?.name  },
              { icon:'ti-heart-handshake', label:t('الصلة','Relation'),    value:RELATION_TYPES.find(r=>r.id===form.relationType)?.[lang==='ar'?'ar':'en'] },
            ].map((row,i) => (
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 0',borderBottom:'1px solid rgba(44,31,14,.06)'}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(26,107,138,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <i className={`ti ${row.icon}`} style={{fontSize:14,color:'var(--c-water)'}}/>
                </div>
                <div>
                  <div style={{fontSize:11,color:'var(--c-stone)'}}>{row.label}</div>
                  <div style={{fontSize:13,fontWeight:500,color:'var(--c-soil)',marginTop:2}}>{row.value}</div>
                </div>
              </div>
            ))}

            {form.relationNote && (
              <div style={{background:'var(--c-sand)',borderRadius:10,padding:'10px 12px',marginTop:10,fontSize:12,color:'var(--c-soil)'}}>
                <div style={{fontSize:11,color:'var(--c-stone)',marginBottom:4}}>{t('ملاحظتك:','Your note:')}</div>
                {form.relationNote}
              </div>
            )}

            <div className="info-box" style={{marginTop:14}}>
              <i className="ti ti-clock" style={{fontSize:15,flexShrink:0}}/>
              <span style={{fontSize:12}}>
                {t(
                  'سيراجع الأدمن طلبك ويتواصل معك على رقم هاتفك عند الاعتماد.',
                  'Admin will review your request and contact you on your phone when approved.'
                )}
              </span>
            </div>
          </div>
        )}

        {/* ── الأزرار ── */}
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button className="btn btn-outline" style={{flex:0,paddingRight:14,paddingLeft:14}} onClick={back}>
            <i className={`ti ti-arrow-${lang==='ar'?'right':'left'}`}/>
          </button>
          {step !== 'confirm' ? (
            <button className="btn btn-primary" style={{flex:1}} onClick={next}>
              {t('التالي','Next')} <i className={`ti ti-arrow-${lang==='ar'?'left':'right'}`}/>
            </button>
          ) : (
            <button className="btn btn-palm" style={{flex:1}} onClick={submit} disabled={submitting}>
              {submitting ? (
                <><i className="ti ti-loader-2" style={{animation:'spin 1s linear infinite'}}/>{t('جارٍ الإرسال...','Sending...')}</>
              ) : (
                <><i className="ti ti-send"/>{t('إرسال الطلب','Submit Request')}</>
              )}
            </button>
          )}
        </div>

        <div style={{marginTop:14,textAlign:'center',fontSize:12,color:'var(--c-stone)'}}>
          {t('لديك حساب؟','Have an account?')}{' '}
          <span style={{color:'var(--c-water)',cursor:'pointer',fontWeight:600}} onClick={onBack}>
            {t('تسجيل الدخول','Sign In')}
          </span>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
