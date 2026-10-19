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
  // holderNames: { holderId → overriddenName } applied on top of SHARE_HOLDERS
  const [holderNames, setHolderNames] = useState({})
  const [nameChangeRequests, setNameChangeRequests] = useState([])
  const [loginLogs, setLoginLogs] = useState([])

  const login = (userId) => {
    const user = USERS_MOCK.find(u => u.id === userId)
    if (user) {
      setCurrentUser(user)
      const at = new Date().toLocaleString('ar-OM')
      setLoginLogs(prev => [
        { userId: user.id, fullName: user.fullName, role: user.role, username: user.username, at, ts: Date.now() },
        ...prev,
      ])
    }
  }

  const loginWithCredentials = (username, password) => {
    const user = USERS_MOCK.find(u =>
      u.username?.toLowerCase() === username.trim().toLowerCase() && u.password === password
    )
    if (user) {
      setCurrentUser(user)
      const at = new Date().toLocaleString('ar-OM')
      setLoginLogs(prev => [
        { userId: user.id, fullName: user.fullName, role: user.role, username: user.username, at, ts: Date.now() },
        ...prev,
      ])
      return { ok: true }
    }
    return { ok: false }
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

  // ─── Name-change: direct edit by admin ────────────────────────────────────
  const directEditName = ({ holderId, currentName, newName, reason, note }) => {
    setHolderNames(prev => ({ ...prev, [holderId]: newName }))
    logAudit({
      actor: currentUser?.fullName || '—',
      action: `تعديل اسم — ${reason}`,
      entity: `${currentName} ← ${newName}${note ? ' · ' + note : ''}`,
    })
  }

  // ─── Name-change: beneficiary request ─────────────────────────────────────
  const requestNameChange = ({ holderId, currentName, newName, reason, note }) => {
    const id = `ncr_${Date.now()}`
    setNameChangeRequests(prev => [
      {
        id, holderId, currentName, newName, reason, note,
        requestedBy: currentUser?.id,
        requestedByName: currentUser?.fullName,
        requestedAt: new Date().toLocaleString('ar-OM'),
        status: 'pending',
        reviewedBy: null, reviewedAt: null,
      },
      ...prev,
    ])
  }

  const approveNameChange = (reqId) => {
    const req = nameChangeRequests.find(r => r.id === reqId)
    if (!req) return
    setHolderNames(prev => ({ ...prev, [req.holderId]: req.newName }))
    setNameChangeRequests(prev => prev.map(r => r.id === reqId
      ? { ...r, status: 'approved', reviewedBy: currentUser?.fullName, reviewedAt: new Date().toLocaleString('ar-OM') }
      : r
    ))
    logAudit({
      actor: currentUser?.fullName || '—',
      action: `اعتماد تعديل اسم — ${req.reason}`,
      entity: `${req.currentName} ← ${req.newName}`,
    })
  }

  const rejectNameChange = (reqId) => {
    const req = nameChangeRequests.find(r => r.id === reqId)
    if (req) logAudit({
      actor: currentUser?.fullName || '—',
      action: 'رفض تعديل اسم',
      entity: req.currentName,
    })
    setNameChangeRequests(prev => prev.map(r => r.id === reqId
      ? { ...r, status: 'rejected', reviewedBy: currentUser?.fullName, reviewedAt: new Date().toLocaleString('ar-OM') }
      : r
    ))
  }

  const pendingNameChanges = nameChangeRequests.filter(r => r.status === 'pending')

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <AppCtx.Provider value={{
      currentUser, login, loginWithCredentials, logout,
      loginLogs,
      lang, setLang, t,
      pendingRegs, approveReg, rejectReg,
      notifications, markNotifRead, unreadCount,
      reminderLogs, logReminder,
      auditLogs, logAudit,
      holderNames, directEditName,
      nameChangeRequests, pendingNameChanges,
      requestNameChange, approveNameChange, rejectNameChange,
    }}>
      {children}
    </AppCtx.Provider>
  )
}
