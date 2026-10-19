import { createContext, useContext, useState, useEffect } from 'react'
import { USERS_MOCK, PENDING_REGISTRATIONS, NOTIFICATIONS_MOCK } from '../data/falajData'

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS = {
  USERS:        'athar_v1_users',
  HOLDER_NAMES: 'athar_v1_holder_names',
  PENDING_REGS: 'athar_v1_pending_regs',
  SESSION:      'athar_v1_session',
  LOGIN_LOGS:   'athar_v1_login_logs',
  AUDIT_LOGS:   'athar_v1_audit_logs',
  NAME_CHANGES: 'athar_v1_name_changes',
}

const lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
const lsSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) }
  catch (e) { console.warn('[athar] localStorage write failed:', key, e.message) }
}

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }) {
  const [lang, setLang] = useState('ar')

  // ── State — initialised from localStorage (lazy init) ──────────────────────
  const [users, setUsers] = useState(() => lsGet(LS.USERS, USERS_MOCK))

  const [pendingRegs, setPendingRegs] = useState(
    () => lsGet(LS.PENDING_REGS, PENDING_REGISTRATIONS)
  )
  const [notifications, setNotifications] = useState(NOTIFICATIONS_MOCK)
  const [reminderLogs, setReminderLogs]   = useState([])
  const [auditLogs, setAuditLogs]         = useState(() => lsGet(LS.AUDIT_LOGS, []))
  const [holderNames, setHolderNames]     = useState(() => lsGet(LS.HOLDER_NAMES, {}))
  const [nameChangeRequests, setNameChangeRequests] = useState(
    () => lsGet(LS.NAME_CHANGES, [])
  )
  const [loginLogs, setLoginLogs] = useState(() => lsGet(LS.LOGIN_LOGS, []))

  // currentUser — restored from "remember me" session on first load
  const [currentUser, setCurrentUser] = useState(() => {
    const session = lsGet(LS.SESSION, null)
    if (!session?.userId || !session?.remember) return null
    const savedUsers = lsGet(LS.USERS, USERS_MOCK)
    return savedUsers.find(u => u.id === session.userId) || null
  })

  // ── Persist to localStorage whenever state changes ──────────────────────────
  useEffect(() => { lsSet(LS.USERS,        users)              }, [users])
  useEffect(() => { lsSet(LS.HOLDER_NAMES, holderNames)        }, [holderNames])
  useEffect(() => { lsSet(LS.PENDING_REGS, pendingRegs)        }, [pendingRegs])
  useEffect(() => { lsSet(LS.LOGIN_LOGS,   loginLogs)          }, [loginLogs])
  useEffect(() => { lsSet(LS.AUDIT_LOGS,   auditLogs)          }, [auditLogs])
  useEffect(() => { lsSet(LS.NAME_CHANGES, nameChangeRequests) }, [nameChangeRequests])

  // ── Auth ────────────────────────────────────────────────────────────────────
  const _recordLogin = (user) => {
    const at = new Date().toLocaleString('ar-OM')
    setLoginLogs(prev => [
      { userId: user.id, fullName: user.fullName, role: user.role, username: user.username, at, ts: Date.now() },
      ...prev,
    ])
  }

  const login = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) { setCurrentUser(user); _recordLogin(user) }
  }

  // remember = true → save session in localStorage so next open auto-logs in
  const loginWithCredentials = (username, password, remember = false) => {
    const user = users.find(u =>
      u.username?.toLowerCase() === username.trim().toLowerCase() && u.password === password
    )
    if (user) {
      setCurrentUser(user)
      _recordLogin(user)
      lsSet(LS.SESSION, remember ? { userId: user.id, remember: true } : null)
      return { ok: true }
    }
    return { ok: false }
  }

  const logout = () => {
    setCurrentUser(null)
    lsSet(LS.SESSION, null)
  }

  const t = (ar, en) => lang === 'ar' ? ar : en

  const logAudit = ({ actor, action, entity }) => {
    const at = new Date().toLocaleString('ar-OM')
    setAuditLogs(prev => [{ actor, action, entity, at }, ...prev])
  }

  // ─── Approve registration: assign role + credentials then add user ─────────
  const approveReg = (regId, { role, username, password, holderId }) => {
    const reg = pendingRegs.find(r => r.id === regId)
    if (!reg) return
    const newUser = {
      id: `u_${Date.now()}`,
      fullName: reg.fullName,
      username,
      password,
      phone: reg.phone,
      role,
      status: 'active',
      language: 'ar',
      holderId: holderId || reg.requestedHolderId || null,
      relationType: reg.relationType || null,
    }
    setUsers(prev => [...prev, newUser])
    setPendingRegs(prev => prev.filter(r => r.id !== regId))
    logAudit({
      actor: currentUser?.fullName || '—',
      action: `اعتماد تسجيل — ${role === 'admin' ? 'أدمن' : 'مستفيد'}`,
      entity: `${reg.fullName} (@${username})`,
    })
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

  // ─── Avatar upload — also refreshes currentUser if it's the same person ────
  const updateAvatar = (userId, avatarDataUrl) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, avatar: avatarDataUrl } : u))
    if (currentUser?.id === userId)
      setCurrentUser(prev => prev ? { ...prev, avatar: avatarDataUrl } : prev)
  }

  // ─── Edit registered user's display name ─────────────────────────────────
  const updateUserName = (userId, newName, oldName) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, fullName: newName } : u))
    if (currentUser?.id === userId)
      setCurrentUser(prev => prev ? { ...prev, fullName: newName } : prev)
    logAudit({
      actor: currentUser?.fullName || '—',
      action: 'تعديل اسم مستخدم مسجّل',
      entity: `${oldName} ← ${newName}`,
    })
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
      users, loginLogs,
      updateAvatar, updateUserName,
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
