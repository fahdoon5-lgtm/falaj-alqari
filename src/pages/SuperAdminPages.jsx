import { useState, useRef } from 'react'
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

/* ═══════════ AVATAR CROPPER ═══════════ */
function AvatarCropper({ src, onSave, onCancel }) {
  const SIZE = 240
  const { t } = useApp()
  const [pos,     setPos]     = useState({ x: 0, y: 0 })
  const [zoom,    setZoom]    = useState(1)
  const [imgSize, setImgSize] = useState(null)
  const [dragging,setDragging]= useState(false)
  const [lastP,   setLastP]   = useState(null)
  const imgRef = useRef(null)

  const baseScale   = imgSize ? Math.max(SIZE / imgSize.w, SIZE / imgSize.h) : 1
  const displayScale= baseScale * zoom
  const displayW    = imgSize ? imgSize.w * displayScale : SIZE
  const displayH    = imgSize ? imgSize.h * displayScale : SIZE

  const onDown = (cx, cy) => { setDragging(true); setLastP({ x: cx, y: cy }) }
  const onMove = (cx, cy) => {
    if (!dragging || !lastP) return
    setPos(prev => ({ x: prev.x + cx - lastP.x, y: prev.y + cy - lastP.y }))
    setLastP({ x: cx, y: cy })
  }
  const onUp = () => { setDragging(false); setLastP(null) }

  const saveCrop = () => {
    const img = imgRef.current
    if (!img || !imgSize) return
    const OUT = 200
    const cx  = SIZE / 2 - displayW / 2 + pos.x
    const cy  = SIZE / 2 - displayH / 2 + pos.y
    const srcX = -cx / displayScale
    const srcY = -cy / displayScale
    const srcW = SIZE / displayScale
    const srcH = SIZE / displayScale
    const canvas = document.createElement('canvas')
    canvas.width = OUT; canvas.height = OUT
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.beginPath()
    ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUT, OUT)
    ctx.restore()
    onSave(canvas.toDataURL('image/jpeg', 0.88))
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:300,
      background:'rgba(0,0,0,.88)',backdropFilter:'blur(4px)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>

      <div style={{color:'#fff',fontSize:14,fontWeight:700,marginBottom:6}}>
        {t('حرّك الصورة وضبّط الحجم','Move & crop your photo')}
      </div>
      <div style={{color:'rgba(255,255,255,.5)',fontSize:11,marginBottom:20}}>
        {t('اسحب لتعديل الموضع · المزلقة للتكبير','Drag to reposition · slider to zoom')}
      </div>

      {/* Circle viewport */}
      <div style={{
        width:SIZE, height:SIZE, borderRadius:'50%', overflow:'hidden',
        cursor: dragging ? 'grabbing' : 'grab',
        border:'3px solid rgba(255,255,255,.55)',
        position:'relative', background:'#222', userSelect:'none',
        boxShadow:'0 0 0 9999px rgba(0,0,0,.5)',
        touchAction:'none',
      }}
        onMouseDown={e => onDown(e.clientX, e.clientY)}
        onMouseMove={e => onMove(e.clientX, e.clientY)}
        onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={e => { e.preventDefault(); onDown(e.touches[0].clientX, e.touches[0].clientY) }}
        onTouchMove={e  => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY) }}
        onTouchEnd={onUp}>
        <img ref={imgRef} src={src} draggable={false}
          onLoad={e => {
            setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
            setPos({ x: 0, y: 0 })
          }}
          style={{
            position:'absolute',
            width: displayW, height: displayH,
            left: SIZE / 2 - displayW / 2 + pos.x,
            top:  SIZE / 2 - displayH / 2 + pos.y,
            pointerEvents:'none', userSelect:'none',
          }}/>
      </div>

      {/* Zoom slider */}
      <div style={{width:SIZE,marginTop:18,display:'flex',alignItems:'center',gap:10}}>
        <i className="ti ti-zoom-out" style={{color:'rgba(255,255,255,.5)',fontSize:16,flexShrink:0}}/>
        <input type="range" min="1" max="3" step="0.04" value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          style={{flex:1, accentColor:'var(--c-water)', height:4}}/>
        <i className="ti ti-zoom-in" style={{color:'rgba(255,255,255,.5)',fontSize:16,flexShrink:0}}/>
      </div>

      {/* Buttons */}
      <div style={{display:'flex',gap:10,marginTop:22,width:SIZE}}>
        <button onClick={saveCrop} disabled={!imgSize}
          style={{flex:1,padding:'12px 0',borderRadius:12,border:'none',
            background:'var(--c-water)',color:'#fff',fontWeight:700,
            fontSize:13,cursor:'pointer',opacity:imgSize?1:.5}}>
          <i className="ti ti-crop" style={{marginInlineEnd:6}}/>{t('قص وحفظ','Crop & Save')}
        </button>
        <button onClick={onCancel}
          style={{flex:1,padding:'12px 0',borderRadius:12,
            border:'1.5px solid rgba(255,255,255,.22)',background:'transparent',
            color:'rgba(255,255,255,.8)',fontSize:13,cursor:'pointer'}}>
          {t('إلغاء','Cancel')}
        </button>
      </div>
    </div>
  )
}

/* ═══════════ PROFILE EDIT SHEET ═══════════ */
function ProfileEditSheet({ user, rm, onClose }) {
  const { t, updateUserName, updateAvatar, updatePhone } = useApp()
  const [name,     setName]     = useState(user.fullName || '')
  const [phone,    setPhone]    = useState(user.phone    || '')
  const [avatarUrl,setAvatarUrl]= useState(user.avatar   || null)
  const [cropSrc,  setCropSrc]  = useState(null)
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCropSrc(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const save = () => {
    if (name.trim() && name.trim() !== user.fullName)
      updateUserName(user.id, name.trim(), user.fullName)
    if (phone.trim() !== (user.phone || ''))
      updatePhone(user.id, phone.trim())
    if (avatarUrl !== user.avatar)
      updateAvatar(user.id, avatarUrl)
    onClose()
  }

  return (
    <>
      {cropSrc && (
        <AvatarCropper
          src={cropSrc}
          onSave={url => { setAvatarUrl(url); setCropSrc(null) }}
          onCancel={() => setCropSrc(null)}/>
      )}

      {/* Backdrop */}
      <div style={{position:'fixed',inset:0,zIndex:100,
        background:'rgba(0,0,0,.4)',backdropFilter:'blur(2px)'}}
        onClick={onClose}/>

      {/* Sheet */}
      <div style={{
        position:'fixed',left:0,right:0,bottom:0,zIndex:101,
        background:'#fff',borderRadius:'20px 20px 0 0',
        padding:'16px 20px 36px',
        boxShadow:'0 -8px 40px rgba(0,0,0,.18)',
        maxHeight:'88vh',overflowY:'auto',
      }}>
        {/* Drag handle */}
        <div style={{width:40,height:4,borderRadius:2,background:'rgba(44,31,14,.14)',margin:'0 auto 18px'}}/>

        <div style={{fontSize:14,fontWeight:700,color:'var(--c-soil)',marginBottom:20}}>
          {t('تعديل البروفايل','Edit Profile')}
        </div>

        {/* Avatar row */}
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:22,
          padding:'14px',background:'rgba(44,31,14,.03)',borderRadius:14,
          border:'1px solid rgba(44,31,14,.07)'}}>
          <div style={{position:'relative',cursor:'pointer',flexShrink:0}}
            onClick={() => fileRef.current?.click()}>
            <div style={{width:72,height:72,borderRadius:'50%',overflow:'hidden',
              background:rm.color+'22',display:'flex',alignItems:'center',justifyContent:'center',
              border:`3px solid ${rm.color}35`}}>
              {avatarUrl
                ? <img src={avatarUrl} alt={user.fullName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <i className={`ti ${rm.icon}`} style={{fontSize:28,color:rm.color}}/>
              }
            </div>
            <div style={{position:'absolute',bottom:1,right:1,
              width:22,height:22,borderRadius:'50%',
              background:'var(--c-water)',border:'2px solid #fff',
              display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className="ti ti-camera" style={{fontSize:10,color:'#fff'}}/>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--c-soil)',marginBottom:6}}>
              {t('الصورة الشخصية','Profile photo')}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button onClick={() => fileRef.current?.click()}
                style={{fontSize:11,padding:'5px 12px',borderRadius:8,cursor:'pointer',
                  background:'var(--c-water)',color:'#fff',border:'none',fontWeight:600}}>
                <i className="ti ti-upload" style={{fontSize:11,marginInlineEnd:4}}/>
                {t('رفع صورة','Upload')}
              </button>
              {avatarUrl && (
                <button onClick={() => setAvatarUrl(null)}
                  style={{fontSize:11,padding:'5px 12px',borderRadius:8,cursor:'pointer',
                    background:'rgba(192,57,43,.08)',color:'#C0392B',
                    border:'1px solid rgba(192,57,43,.2)'}}>
                  {t('حذف الصورة','Remove')}
                </button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
        </div>

        {/* Name */}
        <div className="form-group">
          <label className="form-label">{t('الاسم الكامل','Full Name')}</label>
          <input className="form-input" value={name} onChange={e=>setName(e.target.value)}
            placeholder={t('الاسم الكامل','Full name')}/>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">{t('رقم الهاتف','Phone Number')}</label>
          <div style={{position:'relative'}}>
            <i className="ti ti-phone" style={{
              position:'absolute',top:'50%',transform:'translateY(-50%)',
              right:12,fontSize:15,color:'var(--c-stone)',pointerEvents:'none'}}/>
            <input className="form-input"
              value={phone} onChange={e=>setPhone(e.target.value)}
              type="tel" inputMode="tel"
              placeholder="+968 9XXX XXXX"
              style={{paddingRight:38,direction:'ltr',textAlign:'right'}}/>
          </div>
        </div>

        {/* Info row */}
        <div style={{display:'flex',gap:8,marginBottom:16,padding:'10px 12px',
          background:'rgba(44,31,14,.04)',borderRadius:10,
          border:'1px solid rgba(44,31,14,.07)'}}>
          <code style={{fontSize:11,color:'var(--c-stone)',background:'rgba(44,31,14,.06)',
            padding:'2px 6px',borderRadius:4}}>@{user.username}</code>
          <span style={{fontSize:11,padding:'2px 8px',borderRadius:8,fontWeight:700,
            background:rm.color+'18',color:rm.color}}>
            {rm.ar}
          </span>
        </div>

        {/* Buttons */}
        <div className="btn-row">
          <button className="btn btn-primary" style={{flex:1}} onClick={save}>
            <i className="ti ti-check"/>{t('حفظ التغييرات','Save Changes')}
          </button>
          <button className="btn btn-outline" style={{flex:1}} onClick={onClose}>
            {t('إلغاء','Cancel')}
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════ USERS MANAGE PAGE ═══════════ */
export function UsersManagePage() {
  const { t, lang, users } = useApp()
  const [editUser, setEditUser] = useState(null)
  const [query,    setQuery]    = useState('')

  const ROLE_META = {
    beneficiary:{ ar:'مستفيد',    en:'Beneficiary', color:'#1A6B8A', icon:'ti-user'       },
    admin:      { ar:'أدمن',       en:'Admin',       color:'#2D6A2D', icon:'ti-shield-half' },
    super_admin:{ ar:'سوبر أدمن', en:'Super Admin', color:'#7A3055', icon:'ti-crown'       },
  }

  const filtered = users.filter(u =>
    !query || u.fullName?.includes(query) || u.username?.includes(query)
  )

  return (
    <div className="page-content">
      {editUser && (
        <ProfileEditSheet
          user={editUser}
          rm={ROLE_META[editUser.role] || ROLE_META.beneficiary}
          onClose={() => setEditUser(null)}/>
      )}

      <div className="search-wrap">
        <i className="ti ti-search" aria-hidden="true"/>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          placeholder={t('بحث باسم أو اسم المستخدم...','Search by name or username...')}/>
        {query && <i className="ti ti-x" style={{cursor:'pointer'}} onClick={()=>setQuery('')}/>}
      </div>

      <div className="section-lbl">{t('المستخدمون المسجّلون','Registered Users')} ({filtered.length})</div>
      <div className="card">
        {filtered.map(u => {
          const rm = ROLE_META[u.role] || ROLE_META.beneficiary
          return (
            <div key={u.id}
              onClick={() => setEditUser(u)}
              style={{borderBottom:'1px solid rgba(44,31,14,.06)',cursor:'pointer',transition:'background .12s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(26,107,138,.04)'}
              onMouseLeave={e=>e.currentTarget.style.background=''}>
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px'}}>
                {/* Avatar */}
                <div style={{width:44,height:44,borderRadius:'50%',flexShrink:0,overflow:'hidden',
                  background:rm.color+'22',display:'flex',alignItems:'center',justifyContent:'center',
                  border:`2px solid ${rm.color}35`}}>
                  {u.avatar
                    ? <img src={u.avatar} alt={u.fullName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : <i className={`ti ${rm.icon}`} style={{fontSize:19,color:rm.color}}/>
                  }
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--c-soil)'}}>{u.fullName}</div>
                  <div style={{fontSize:11,color:'var(--c-stone)',marginTop:2,display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}}>
                    <code style={{background:'rgba(44,31,14,.06)',padding:'1px 5px',borderRadius:4}}>@{u.username}</code>
                    {u.phone && <span>{u.phone}</span>}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                  <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:8,
                    background:rm.color+'18',color:rm.color,border:`1px solid ${rm.color}28`}}>
                    {lang==='ar'?rm.ar:rm.en}
                  </span>
                  <i className="ti ti-chevron-left" style={{fontSize:13,color:'rgba(44,31,14,.25)'}}/>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'32px 20px',color:'var(--c-stone)'}}>
            <i className="ti ti-users" style={{fontSize:36,display:'block',marginBottom:8,opacity:.25}}/>
            <div style={{fontSize:13}}>{t('لا توجد نتائج','No results found')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export function BroadcastPage() {
  const { t, broadcastNotif } = useApp()
  const [msg,  setMsg]  = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!msg.trim()) return
    broadcastNotif(msg.trim())
    setSent(true)
    setMsg('')
    setTimeout(() => setSent(false), 3500)
  }

  return (
    <div className="page-content">
      <div className="card">
        <div className="card-head">
          <span className="card-title">{t('إشعار جماعي','Broadcast Notification')}</span>
        </div>
        <div className="card-body">
          <div className="info-box" style={{marginBottom:12}}>
            <i className="ti ti-speakerphone" style={{fontSize:15,flexShrink:0,color:'var(--c-water)'}}/>
            <span style={{fontSize:12}}>{t('سيظهر الإشعار فوراً في جرس التنبيهات لجميع المستخدمين.','Notification appears instantly in every user\'s bell.')}</span>
          </div>
          <div className="form-group">
            <label className="form-label">{t('نص الإشعار','Notification Text')}</label>
            <textarea className="form-textarea" rows={4} value={msg} onChange={e=>{setMsg(e.target.value);setSent(false)}}
              placeholder={t('اكتب الرسالة هنا...','Write message here...')} style={{width:'100%'}}/>
            <div style={{fontSize:10,color:'var(--c-stone)',marginTop:4,textAlign:'left'}}>
              {msg.length} {t('حرف','chars')}
            </div>
          </div>
          {sent && (
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',borderRadius:10,
              background:'rgba(45,106,45,.07)',border:'1px solid rgba(45,106,45,.2)',
              color:'#2D6A2D',fontSize:12,marginBottom:12}}>
              <i className="ti ti-circle-check" style={{fontSize:16}}/>
              {t('تم الإرسال! يمكنك التحقق من سجل التدقيق.','Sent! Check the audit log to confirm.')}
            </div>
          )}
          <button className="btn btn-soil btn-full" disabled={!msg.trim() || sent} onClick={handleSend}
            style={{opacity: sent ? .6 : 1}}>
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
