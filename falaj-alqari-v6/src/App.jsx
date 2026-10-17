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
import { AdminHome, RegistrationsPage, SplitsPage, ShareholdersPage } from './pages/AdminPages'
import { SuperAdminHome, BroadcastPage, AuditPage } from './pages/SuperAdminPages'
import CycleSettingsPage from './pages/CycleSettingsPage'

const BENEFICIARY_TABS = [
  { id:'home',         icon:'ti-home',     ar:'لوحتي',     en:'Home'     },
  { id:'transparency', icon:'ti-eye',      ar:'حصص الفلج', en:'Shares'   },
  { id:'cycle',        icon:'ti-calendar', ar:'دورتي',     en:'My Cycle' },
  { id:'farms',        icon:'ti-plant-2',  ar:'مزارعي',    en:'Farms'    },
  { id:'notes',        icon:'ti-notes',    ar:'ملاحظاتي',  en:'Notes'    },
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
  { id:'cycle_admin',  icon:'ti-clock-edit',       ar:'الدورة',    en:'Cycle'     },
  { id:'audit',        icon:'ti-shield-check',     ar:'التدقيق',   en:'Audit'     },
]

function renderPage(tab, page) {
  if (page) {
    switch(page) {
      case 'registrations':  return <RegistrationsPage/>
      case 'splits':         return <SplitsPage/>
      case 'shareholders':   return <ShareholdersPage/>
      case 'broadcast':      return <BroadcastPage/>
      case 'audit':          return <AuditPage/>
      case 'cycle_settings': return <CycleSettingsPage/>
      default: break
    }
  }
  switch(tab) {
    case 'transparency':   return <TransparencyPage/>
    case 'cycle':          return <MyCyclePage/>
    case 'farms':          return <FarmsPage/>
    case 'notes':          return <NotesPage/>
    case 'registrations':  return <RegistrationsPage/>
    case 'splits':         return <SplitsPage/>
    case 'shareholders':   return <ShareholdersPage/>
    case 'audit':          return <AuditPage/>
    case 'cycle_admin':    return <CycleSettingsPage/>
    default:               return null
  }
}

function AppShell({ tabs, homeRenderer }) {
  const { lang } = useApp()
  const { activeTab, goTab, push, current, canGoBack, stackDepth } = useNav()
  const [showNotif, setShowNotif] = useState(false)

  const TAB_TITLES = {
    home:'الرئيسية', transparency:'حصص الفلج', cycle:'دورتي',
    farms:'مزارعي', notes:'ملاحظاتي', registrations:'طلبات التسجيل',
    splits:'تقسيم الحصص', shareholders:'الملاك', audit:'سجل التدقيق',
    broadcast:'إشعار جماعي', cycle_admin:'إعدادات الدورة', cycle_settings:'إعدادات الدورة',
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
            <span className="breadcrumb-sep"><i className="ti ti-chevron-left" style={{fontSize:9}}/></span>
            <span className="breadcrumb-item active">{current.title}</span>
          </>}
        </div>
      )}

      <PageShell key={`${activeTab}-${page}-${stackDepth}`}>
        {content}
      </PageShell>

      <nav className="bottom-nav">
        {tabs.map(tab => (
          <button key={tab.id}
            className={`nav-tab${activeTab===tab.id&&!canGoBack?' active':''}`}
            onClick={()=>{ goTab(tab.id); setShowNotif(false) }}>
            <i className={`ti ${tab.icon}`}/>
            <span style={{fontSize:9.5}}>{lang==='ar'?tab.ar:tab.en}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function BeneficiaryApp() {
  const { t } = useApp()
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
          registrations: t('طلبات التسجيل','Registrations'),
          splits:        t('تقسيم الحصص','Share Splits'),
          shareholders:  t('إدارة الملاك','Shareholders'),
          cycle_settings:t('إعدادات الدورة','Cycle Settings'),
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
          registrations: t('طلبات التسجيل','Registrations'),
          splits:        t('تقسيم الحصص','Share Splits'),
          shareholders:  t('إدارة الملاك','Shareholders'),
          broadcast:     t('إشعار جماعي','Broadcast'),
          audit:         t('سجل التدقيق','Audit Log'),
          cycle_settings:t('إعدادات الدورة','Cycle Settings'),
        }
        push(page, titles[page] || page)
      }}/>
    )}/>
  )
}

function RootApp() {
  const { currentUser } = useApp()
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
