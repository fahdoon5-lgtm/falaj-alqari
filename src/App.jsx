import { useState } from 'react'
import { useApp } from './hooks/useAppState'
import { useNav, NavProvider } from './hooks/useNavigation'
import LoginScreen from './components/LoginScreen'
import TopBar from './components/TopBar'
import PageShell from './components/PageShell'
import NotificationsPanel from './components/NotificationsPanel'
import BeneficiaryHome from './pages/BeneficiaryHome'
import TransparencyPage from './pages/TransparencyPage'
import { MyCyclePage, FarmsPage, NotesPage } from './pages/BeneficiaryPages'
import { AdminHome, RegistrationsPage, SplitsPage, ShareholdersPage, LoginLogsPage, AgreementsAdminPage } from './pages/AdminPages'
import AgreementsPage from './pages/AgreementsPage'
import { SuperAdminHome, BroadcastPage, AuditPage, UsersManagePage } from './pages/SuperAdminPages'
import CycleSettingsPage from './pages/CycleSettingsPage'

const BENEFICIARY_TABS = [
  { id:'home',         icon:'ti-home',             ar:'لوحتي',     en:'Home'       },
  { id:'transparency', icon:'ti-eye',              ar:'حصص الفلج', en:'Shares'     },
  { id:'cycle',        icon:'ti-calendar',         ar:'دورتي',     en:'My Cycle'   },
  { id:'agreements',   icon:'ti-arrows-exchange',  ar:'مقايضاتي',  en:'Agreements' },
  { id:'notes',        icon:'ti-notes',            ar:'ملاحظاتي',  en:'Notes'      },
]
const ADMIN_TABS = [
  { id:'home',         icon:'ti-layout-dashboard', ar:'الرئيسية',  en:'Dashboard'    },
  { id:'transparency', icon:'ti-eye',              ar:'حصص الفلج', en:'Shares'       },
  { id:'registrations',icon:'ti-user-check',       ar:'التسجيل',   en:'Registrations'},
  { id:'splits',       icon:'ti-git-branch',       ar:'التقسيم',   en:'Splits'       },
  { id:'shareholders', icon:'ti-users',            ar:'الملاك',    en:'Shareholders' },
]
const SUPER_TABS = [
  { id:'home',         icon:'ti-layout-dashboard', ar:'التحكم',    en:'Control'   },
  { id:'transparency', icon:'ti-eye',              ar:'حصص الفلج', en:'Shares'    },
  { id:'registrations',icon:'ti-user-check',       ar:'التسجيل',   en:'Register'  },
  { id:'audit',        icon:'ti-shield-check',     ar:'التدقيق',   en:'Audit'     },
  { id:'login_logs',   icon:'ti-clipboard-data',   ar:'السجلات',   en:'Logs'      },
]

function renderPage(tab, page) {
  if (page) {
    switch(page) {
      case 'registrations':  return <RegistrationsPage/>
      case 'splits':         return <SplitsPage/>
      case 'shareholders':   return <ShareholdersPage/>
      case 'broadcast':      return <BroadcastPage/>
      case 'audit':          return <AuditPage/>
      case 'login_logs':     return <LoginLogsPage/>
      case 'users_manage':   return <UsersManagePage/>
      case 'cycle_settings':    return <CycleSettingsPage/>
      case 'agreements_admin':  return <AgreementsAdminPage/>
      default: break
    }
  }
  switch(tab) {
    case 'transparency':   return <TransparencyPage/>
    case 'cycle':          return <MyCyclePage/>
    case 'farms':          return <FarmsPage/>
    case 'notes':          return <NotesPage/>
    case 'agreements':     return <AgreementsPage/>
    case 'registrations':  return <RegistrationsPage/>
    case 'splits':         return <SplitsPage/>
    case 'shareholders':   return <ShareholdersPage/>
    case 'audit':          return <AuditPage/>
    case 'login_logs':     return <LoginLogsPage/>
    case 'users_manage':   return <UsersManagePage/>
    case 'cycle_admin':    return <CycleSettingsPage/>
    default:               return null
  }
}

function AppShell({ tabs, homeRenderer }) {
  const { lang, t } = useApp()
  const { activeTab, goTab, push, current, canGoBack, stackDepth } = useNav()
  const [showNotif, setShowNotif] = useState(false)

  const TAB_TITLES = {
    home:'الرئيسية', transparency:'حصص الفلج', cycle:'دورتي',
    farms:'مزارعي', notes:'ملاحظاتي', agreements:'مقايضاتي',
    registrations:'طلبات التسجيل', splits:'تقسيم الحصص',
    shareholders:'الملاك', audit:'سجل التدقيق',
    broadcast:'إشعار جماعي', cycle_admin:'إعدادات الدورة', cycle_settings:'إعدادات الدورة',
    users_manage:'إدارة المستخدمين', login_logs:'السجلات',
    agreements_admin:'مقايضات الحصص',
  }

  const page    = current?.page || null
  const content = page
    ? renderPage(activeTab, page)
    : activeTab === 'home' && homeRenderer
      ? homeRenderer(push)
      : renderPage(activeTab, null)

  return (
    <div className={`app-layout${canGoBack?' can-go-back':''}`}>
      <div className="back-hint"/>
      <TopBar onNotifClick={()=>setShowNotif(v=>!v)}/>
      {showNotif && <NotificationsPanel onClose={()=>setShowNotif(false)}/>}

      {canGoBack && (
        <div className="breadcrumb">
          <span className="breadcrumb-item" onClick={()=>goTab(activeTab)}>
            {tabs.find(t=>t.id===activeTab)?.[lang==='ar'?'ar':'en'] || 'الرئيسية'}
          </span>
          {current && <>
            <span className="breadcrumb-sep"><i className={`ti ti-chevron-${lang==='ar'?'left':'right'}`} style={{fontSize:9}}/></span>
            <span className="breadcrumb-item active">{current.title}</span>
          </>}
        </div>
      )}

      <PageShell key={`${activeTab}-${page}-${stackDepth}`}>
        {content}
      </PageShell>

      <nav className="bottom-nav" aria-label={t('التنقل الرئيسي','Main navigation')}>
        {tabs.map(tab => (
          <button key={tab.id}
            className={`nav-tab${activeTab===tab.id&&!canGoBack?' active':''}`}
            aria-current={activeTab===tab.id&&!canGoBack?'page':undefined}
            onClick={()=>{ goTab(tab.id); setShowNotif(false) }}>
            <i className={`ti ${tab.icon}`}/>
            <span style={{fontSize:11}}>{lang==='ar'?tab.ar:tab.en}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function BeneficiaryApp() {
  return (
    <AppShell tabs={BENEFICIARY_TABS} homeRenderer={(push) => (
      <BeneficiaryHome
        onTabChange={() => {}}
        onPush={push}
      />
    )}/>
  )
}

function AdminApp() {
  const { t } = useApp()
  return (
    <AppShell tabs={ADMIN_TABS} homeRenderer={(push) => (
      <AdminHome onTab={(page) => {
        const titles = {
          registrations:    t('طلبات التسجيل','Registrations'),
          splits:           t('تقسيم الحصص','Share Splits'),
          shareholders:     t('إدارة الملاك','Shareholders'),
          cycle_settings:   t('إعدادات الدورة','Cycle Settings'),
          agreements_admin: t('مقايضات الحصص','Share Agreements'),
        }
        push(page, titles[page] || page)
      }}/>
    )}/>
  )
}

function SuperAdminApp() {
  const { t } = useApp()
  return (
    <AppShell tabs={SUPER_TABS} homeRenderer={(push) => (
      <SuperAdminHome onTab={(page) => {
        const titles = {
          registrations:    t('طلبات التسجيل','Registrations'),
          splits:           t('تقسيم الحصص','Share Splits'),
          shareholders:     t('أسماء الملاك','Shareholders'),
          broadcast:        t('إشعار جماعي','Broadcast'),
          audit:            t('سجل التدقيق','Audit Log'),
          cycle_settings:   t('إعدادات الدورة','Cycle Settings'),
          users_manage:     t('إدارة المستخدمين','Manage Users'),
          agreements_admin: t('مقايضات الحصص','Share Agreements'),
        }
        push(page, titles[page] || page)
      }}/>
    )}/>
  )
}

function SplashScreen() {
  return (
    <div style={{
      minHeight:'100dvh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16,
      background:'var(--bg)', color:'var(--text)',
    }}>
      <div style={{
        width:56, height:56, borderRadius:16,
        background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:28, boxShadow:'0 4px 20px var(--accent-a20)', color:'#fff',
      }}>
        <i className="ti ti-droplet"/>
      </div>
      <div style={{fontFamily:'var(--font-ar)', fontWeight:700, fontSize:18}}>فلج القري</div>
      <div style={{
        width:32, height:32, border:'3px solid var(--border)',
        borderTopColor:'var(--accent)', borderRadius:'50%',
        animation:'spin 0.7s linear infinite',
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function RootApp() {
  const { currentUser, appReady } = useApp()
  if (!appReady) return <SplashScreen/>
  if (!currentUser) return <LoginScreen/>
  switch(currentUser.role) {
    case 'beneficiary': return <BeneficiaryApp/>
    case 'admin':       return <AdminApp/>
    case 'super_admin': return <SuperAdminApp/>
    default:            return <LoginScreen/>
  }
}

export default function App() {
  return <NavProvider><RootApp/></NavProvider>
}
