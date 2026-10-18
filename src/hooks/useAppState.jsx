import { createContext, useContext, useState } from 'react'
import { USERS_MOCK, PENDING_REGISTRATIONS, NOTIFICATIONS_MOCK } from '../data/falajData'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [lang, setLang] = useState('ar')
  const [pendingRegs, setPendingRegs] = useState(PENDING_REGISTRATIONS)
  const [notifications, setNotifications] = useState(NOTIFICATIONS_MOCK)
  const [reminderLogs, setReminderLogs] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  const login = (userId) => {
    const user = USERS_MOCK.find(u => u.id === userId)
    if (user) setCurrentUser(user)
  }
  const logout = () => setCurrentUser(null)

  const t = (ar, en) => lang === 'ar' ? ar : en

  const logAudit = ({ actor, action, entity }) => {
    const at = new Date().toLocaleString('ar-OM')
    setAuditLogs(prev => [{ actor, action, entity, at }, ...prev])
  }

  const approveReg = (regId) => {
    const reg = pendingRegs.find(r => r.id === regId)
    if (reg) logAudit({ actor: currentUser?.fullName || '—', action: 'اعتماد تسجيل', entity: reg.fullName })
    setPendingRegs(prev => prev.filter(r => r.id !== regId))
  }
  const rejectReg = (regId) => {
    const reg = pendingRegs.find(r => r.id === regId)
    if (reg) logAudit({ actor: currentUser?.fullName || '—', action: 'رفض تسجيل', entity: reg.fullName })
    setPendingRegs(prev => prev.filter(r => r.id !== regId))
  }

  const markNotifRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead:true} : n))
  }

  const logReminder = (entry) => {
    setReminderLogs(prev => [entry, ...prev])
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <AppCtx.Provider value={{
      currentUser, login, logout,
      lang, setLang, t,
      pendingRegs, approveReg, rejectReg,
      notifications, markNotifRead, unreadCount,
      reminderLogs, logReminder,
      auditLogs, logAudit,
    }}>
      {children}
    </AppCtx.Provider>
  )
}
