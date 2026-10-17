import { useApp } from '../hooks/useAppState'
import { useNav } from '../hooks/useNavigation'

export default function TopBar({ onNotifClick }) {
  const { currentUser, lang, setLang, t, unreadCount } = useApp()
  const { canGoBack, pop, current, activeTab } = useNav()
  if (!currentUser) return null

  const name = currentUser.fullName
  const initials = name.split(' ').slice(0,2).map(w=>w[0]).join('')

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
        <div className="avatar-sm">{initials}</div>
      </div>
    </div>
  )
}
