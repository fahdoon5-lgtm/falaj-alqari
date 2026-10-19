import { useRef } from 'react'
import { useApp } from '../hooks/useAppState'
import { useNav } from '../hooks/useNavigation'

export default function TopBar({ onNotifClick }) {
  const { currentUser, lang, setLang, t, unreadCount, updateAvatar } = useApp()
  const { canGoBack, pop, current, activeTab } = useNav()
  const fileRef = useRef(null)
  if (!currentUser) return null

  const name = currentUser.fullName

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 200
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const w = Math.round(img.width  * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width  = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const compressed = canvas.toDataURL('image/jpeg', 0.82)
        updateAvatar(currentUser.id, compressed)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // عنوان الصفحة الحالية
  const TAB_TITLES = {
    home:         { ar:'لوحتي',        en:'Dashboard'      },
    transparency: { ar:'حصص الفلج',   en:'All Shares'     },
    cycle:        { ar:'دورتي',        en:'My Cycle'       },
    farms:        { ar:'مزارعي',       en:'My Farms'       },
    notes:        { ar:'ملاحظاتي',     en:'My Notes'       },
    registrations:{ ar:'طلبات التسجيل', en:'Registrations' },
    splits:       { ar:'تقسيم الحصص', en:'Share Splits'   },
    shareholders: { ar:'الملاك',       en:'Shareholders'   },
    audit:        { ar:'سجل التدقيق', en:'Audit Log'      },
    broadcast:    { ar:'إشعار جماعي', en:'Broadcast'      },
  }

  const pageTitle = current?.title
    || TAB_TITLES[activeTab]?.[lang]
    || (lang==='ar' ? 'فلج القري' : 'Falaj Al-Qari')

  return (
    <div className="topbar" style={{transition:'all .25s'}}>
      <div className="topbar-brand">
        {canGoBack ? (
          <button className="icon-btn" onClick={pop} aria-label={t('رجوع','Back')}
            style={{background:'rgba(255,255,255,.12)', borderColor:'rgba(255,255,255,.15)'}}>
            <i className={`ti ti-arrow-${lang==='ar'?'right':'left'}`} aria-hidden="true"/>
          </button>
        ) : (
          <div className="topbar-logo"><i className="ti ti-droplet" aria-hidden="true"/></div>
        )}
        <div>
          <div className="topbar-title" style={{fontSize: canGoBack ? 14 : 15}}>
            {canGoBack ? pageTitle : t('فلج القري','Falaj Al-Qari')}
          </div>
          {!canGoBack && (
            <div className="topbar-sub">{name}</div>
          )}
        </div>
      </div>

      <div className="topbar-actions">
        {!canGoBack && (
          <div className="lang-toggle">
            <button className={`lang-btn${lang==='ar'?' active':''}`} onClick={()=>setLang('ar')}>ع</button>
            <button className={`lang-btn${lang==='en'?' active':''}`} onClick={()=>setLang('en')}>EN</button>
          </div>
        )}
        <button className="icon-btn" onClick={onNotifClick} aria-label={t('الإشعارات','Notifications')}>
          <i className="ti ti-bell" aria-hidden="true"/>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>
        {/* Avatar with upload */}
        <label style={{position:'relative',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}
          title={t('تغيير الصورة','Change photo')}>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarChange}/>
          <div className="avatar-sm" style={{overflow:'hidden',padding:0,
            background: currentUser.avatar ? 'transparent' : 'rgba(255,255,255,.18)',
            border: currentUser.avatar ? '2px solid rgba(255,255,255,.4)' : '2px dashed rgba(255,255,255,.35)'}}>
            {currentUser.avatar
              ? <img src={currentUser.avatar} alt={name}
                  style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%',display:'block'}}/>
              : <i className="ti ti-user" style={{fontSize:17,color:'rgba(255,255,255,.85)'}}/>
            }
          </div>
          <div style={{position:'absolute',bottom:-2,right:-2,
            width:14,height:14,borderRadius:'50%',
            background:'var(--c-water)',
            display:'flex',alignItems:'center',justifyContent:'center',
            border:'1.5px solid rgba(255,255,255,.9)',pointerEvents:'none'}}>
            <i className="ti ti-camera" style={{fontSize:7,color:'#fff'}}/>
          </div>
        </label>
      </div>
    </div>
  )
}
