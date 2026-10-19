import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, SUPABASE_READY } from '../lib/supabase'
import { USERS_MOCK, PENDING_REGISTRATIONS, NOTIFICATIONS_MOCK } from '../data/falajData'

// ─── Local-only key: stores session token only (not the full user) ────────────
const SESSION_TOKEN_KEY = 'athar_v2_token'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

// ─── DB → app shape normalizers ───────────────────────────────────────────────
const nu = (u) => u ? ({
  id: u.id, fullName: u.full_name, username: u.username, password: u.password,
  phone: u.phone, role: u.role, status: u.status, language: u.language || 'ar',
  holderId: u.holder_id, relationType: u.relation_type, avatar: u.avatar,
}) : null

const nr = (r) => r ? ({
  id: r.id, fullName: r.full_name, phone: r.phone,
  requestedHolderId: r.requested_holder_id, relationType: r.relation_type,
  relationNote: r.relation_note,
  submittedAt: r.submitted_at,
}) : null

const nn = (n) => n ? ({
  id: n.id, titleAr: n.title_ar, body: n.body,
  type: n.type, isRead: n.is_read, createdAt: n.created_at,
}) : null

const na = (l) => l ? ({
  actor: l.actor, action: l.action, entity: l.entity,
  at: l.at || new Date(l.created_at).toLocaleString('ar-OM',{timeZone:'Asia/Muscat'}),
}) : null

const nl = (l) => l ? ({
  userId: l.user_id, fullName: l.full_name, username: l.username,
  role: l.role, at: l.at || new Date(l.created_at).toLocaleString('ar-OM',{timeZone:'Asia/Muscat'}),
  ts: l.ts || new Date(l.created_at).getTime(),
}) : null

const ncr = (r) => r ? ({
  id: r.id, holderId: r.holder_id, currentName: r.current_name, newName: r.new_name,
  reason: r.reason, note: r.note, requestedBy: r.requested_by,
  requestedByName: r.requested_by_name, requestedAt: r.requested_at,
  status: r.status, reviewedBy: r.reviewed_by, reviewedAt: r.reviewed_at,
}) : null

// ─── Offline fallback (no Supabase env vars) ──────────────────────────────────
const OFFLINE = !SUPABASE_READY

// ─── localStorage helpers (offline mode only) ─────────────────────────────────
const LS = {
  USERS:'athar_v1_users', HOLDER_NAMES:'athar_v1_holder_names',
  PENDING_REGS:'athar_v1_pending_regs', SESSION:'athar_v1_session',
  LOGIN_LOGS:'athar_v1_login_logs', AUDIT_LOGS:'athar_v1_audit_logs',
  NAME_CHANGES:'athar_v1_name_changes',
}
const lsGet = (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb } catch { return fb } }
const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

// ─────────────────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [lang, setLang] = useState('ar')
  const [appReady, setAppReady]   = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [users,       setUsers]       = useState([])
  const [pendingRegs, setPendingRegs] = useState([])
  const [notifications, setNotifications] = useState([])
  const [auditLogs,   setAuditLogs]   = useState([])
  const [loginLogs,   setLoginLogs]   = useState([])
  const [holderNames, setHolderNames] = useState({})
  const [nameChangeRequests, setNameChangeRequests] = useState([])

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => { OFFLINE ? bootOffline() : bootOnline() }, [])

  // ── ONLINE boot ────────────────────────────────────────────────────────────
  const bootOnline = async () => {
    try {
      // 1. Restore session
      const token = localStorage.getItem(SESSION_TOKEN_KEY)
      let me = null
      if (token) {
        const { data: sess } = await supabase
          .from('sessions')
          .select('*, app_users(*)')
          .eq('token', token)
          .gt('expires_at', new Date().toISOString())
          .single()
        if (sess?.app_users) me = nu(sess.app_users)
        else localStorage.removeItem(SESSION_TOKEN_KEY)
      }
      if (me) setCurrentUser(me)

      // 2. Load all shared tables in parallel
      const [
        { data: uData }, { data: rData }, { data: aData },
        { data: lData }, { data: hData }, { data: ncrData },
      ] = await Promise.all([
        supabase.from('app_users').select('*').order('created_at'),
        supabase.from('pending_registrations').select('*').order('submitted_at', { ascending: false }),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(300),
        supabase.from('login_logs').select('*').order('created_at', { ascending: false }).limit(300),
        supabase.from('holder_name_overrides').select('*'),
        supabase.from('name_change_requests').select('*').order('created_at', { ascending: false }),
      ])

      setUsers((uData || []).map(nu))
      setPendingRegs((rData || []).map(nr))
      setAuditLogs((aData || []).map(na))
      setLoginLogs((lData || []).map(nl))
      const namesObj = {}
      ;(hData || []).forEach(h => { namesObj[h.holder_id] = h.name })
      setHolderNames(namesObj)
      setNameChangeRequests((ncrData || []).map(ncr))

      // 3. Load notifications for this user
      if (me) await _loadNotifs(me.id)

    } catch (err) {
      console.error('[athar] boot error — falling back to offline', err)
      bootOffline()
      return
    }
    setAppReady(true)
  }

  const _loadNotifs = async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(60)
    setNotifications((data || []).map(nn))
  }

  // ── OFFLINE boot (localStorage, original behaviour) ────────────────────────
  const bootOffline = () => {
    const savedUsers = lsGet(LS.USERS, USERS_MOCK)
    setUsers(savedUsers)
    setPendingRegs(lsGet(LS.PENDING_REGS, PENDING_REGISTRATIONS))
    setAuditLogs(lsGet(LS.AUDIT_LOGS, []))
    setLoginLogs(lsGet(LS.LOGIN_LOGS, []))
    setHolderNames(lsGet(LS.HOLDER_NAMES, {}))
    setNameChangeRequests(lsGet(LS.NAME_CHANGES, []))
    setNotifications(NOTIFICATIONS_MOCK)
    // Restore session
    const sess = lsGet(LS.SESSION, null)
    if (sess?.userId && sess?.remember) {
      const u = savedUsers.find(u => u.id === sess.userId)
      if (u) setCurrentUser(u)
    }
    setAppReady(true)
  }

  // ── Persist offline state ──────────────────────────────────────────────────
  useEffect(() => { if (OFFLINE) lsSet(LS.USERS, users) }, [users])
  useEffect(() => { if (OFFLINE) lsSet(LS.PENDING_REGS, pendingRegs) }, [pendingRegs])
  useEffect(() => { if (OFFLINE) lsSet(LS.AUDIT_LOGS, auditLogs) }, [auditLogs])
  useEffect(() => { if (OFFLINE) lsSet(LS.LOGIN_LOGS, loginLogs) }, [loginLogs])
  useEffect(() => { if (OFFLINE) lsSet(LS.HOLDER_NAMES, holderNames) }, [holderNames])
  useEffect(() => { if (OFFLINE) lsSet(LS.NAME_CHANGES, nameChangeRequests) }, [nameChangeRequests])

  // ── Real-time: notifications ───────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || OFFLINE) return
    const ch = supabase
      .channel(`notifs-${currentUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${currentUser.id}`,
      }, ({ new: row }) => {
        setNotifications(prev =>
          prev.find(n => n.id === row.id) ? prev : [nn(row), ...prev]
        )
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [currentUser?.id])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const t = (ar, en) => lang === 'ar' ? ar : en

  const _logAudit = async ({ actor, action, entity }) => {
    const at = new Date().toLocaleString('ar-OM',{timeZone:'Asia/Muscat'})
    const entry = { actor, action, entity, at }
    setAuditLogs(prev => [entry, ...prev])
    if (!OFFLINE)
      await supabase.from('audit_logs').insert({ actor, action, entity, at })
  }

  const _recordLogin = async (user) => {
    const at = new Date().toLocaleString('ar-OM',{timeZone:'Asia/Muscat'})
    const ts = Date.now()
    const entry = { userId: user.id, fullName: user.fullName, username: user.username, role: user.role, at, ts }
    setLoginLogs(prev => [entry, ...prev])
    if (!OFFLINE)
      await supabase.from('login_logs').insert({ user_id: user.id, full_name: user.fullName, username: user.username, role: user.role, at, ts })
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  const loginWithCredentials = async (username, password, remember = false) => {
    if (OFFLINE) {
      const user = users.find(u =>
        u.username?.toLowerCase() === username.trim().toLowerCase() && u.password === password && u.status === 'active'
      )
      if (!user) return { ok: false }
      setCurrentUser(user)
      _recordLogin(user)
      lsSet(LS.SESSION, remember ? { userId: user.id, remember: true } : null)
      return { ok: true }
    }

    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .ilike('username', username.trim())
      .eq('password', password)
      .eq('status', 'active')
      .single()

    if (error || !data) return { ok: false }

    const user = nu(data)
    setCurrentUser(user)
    _recordLogin(user)

    // Always save session; "remember" controls duration (30d vs 1d)
    const expiresAt = remember
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() +      24 * 60 * 60 * 1000).toISOString()
    const { data: sess } = await supabase
      .from('sessions').insert({ user_id: user.id, expires_at: expiresAt }).select().single()
    if (sess) localStorage.setItem(SESSION_TOKEN_KEY, sess.token)

    await _loadNotifs(user.id)
    return { ok: true }
  }

  const login = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) { setCurrentUser(user); _recordLogin(user) }
  }

  const logout = async () => {
    if (!OFFLINE) {
      const token = localStorage.getItem(SESSION_TOKEN_KEY)
      if (token) {
        await supabase.from('sessions').delete().eq('token', token)
        localStorage.removeItem(SESSION_TOKEN_KEY)
      }
    } else {
      lsSet(LS.SESSION, null)
    }
    setCurrentUser(null)
    setNotifications([])
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────
  const updateAvatar = async (userId, avatarDataUrl) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, avatar: avatarDataUrl } : u))
    if (currentUser?.id === userId)
      setCurrentUser(prev => prev ? { ...prev, avatar: avatarDataUrl } : prev)
    if (!OFFLINE)
      await supabase.from('app_users').update({ avatar: avatarDataUrl }).eq('id', userId)
  }

  // ── Name ───────────────────────────────────────────────────────────────────
  const updateUserName = async (userId, newName, oldName) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, fullName: newName } : u))
    if (currentUser?.id === userId)
      setCurrentUser(prev => prev ? { ...prev, fullName: newName } : prev)
    if (!OFFLINE)
      await supabase.from('app_users').update({ full_name: newName }).eq('id', userId)
    _logAudit({ actor: currentUser?.fullName || '—', action: 'تعديل اسم مستخدم مسجّل', entity: `${oldName} ← ${newName}` })
  }

  // ── Phone ──────────────────────────────────────────────────────────────────
  const updatePhone = async (userId, newPhone) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, phone: newPhone } : u))
    if (currentUser?.id === userId)
      setCurrentUser(prev => prev ? { ...prev, phone: newPhone } : prev)
    if (!OFFLINE)
      await supabase.from('app_users').update({ phone: newPhone }).eq('id', userId)
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  const markNotifRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    if (!OFFLINE)
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const logReminder = () => {} // ephemeral, not stored

  // ── Broadcast ─────────────────────────────────────────────────────────────
  const broadcastNotif = async (message) => {
    const titleAr = t('إشعار من الإدارة', 'Admin Notification')

    if (!OFFLINE) {
      // Insert one notification row per active user
      const rows = users
        .filter(u => u.status === 'active')
        .map(u => ({ user_id: u.id, title_ar: titleAr, body: message, type: 'broadcast', is_read: false }))
      if (rows.length) await supabase.from('notifications').insert(rows)
      // The current user's copy will arrive via real-time channel
    } else {
      const notif = {
        id: `notif_${Date.now()}`, titleAr, body: message,
        isRead: false, type: 'broadcast', createdAt: new Date().toISOString(),
      }
      setNotifications(prev => [notif, ...prev])
    }

    _logAudit({
      actor: currentUser?.fullName || '—',
      action: 'إرسال إشعار جماعي',
      entity: message.length > 40 ? message.slice(0, 40) + '…' : message,
    })
  }

  // ── Registration flow ─────────────────────────────────────────────────────
  const submitRegistration = async ({ fullName, phone, requestedHolderId, relationType, relationNote }) => {
    const row = {
      full_name: fullName, phone,
      requested_holder_id: requestedHolderId,
      relation_type: relationType, relation_note: relationNote,
    }
    if (!OFFLINE) {
      const { data, error } = await supabase.from('pending_registrations').insert(row).select().single()
      if (error) return { ok: false, error }
      setPendingRegs(prev => [nr(data), ...prev])
    } else {
      const local = { ...row, id: `reg_${Date.now()}`, submittedAt: new Date().toISOString() }
      setPendingRegs(prev => [nr({ ...local, full_name: fullName, requested_holder_id: requestedHolderId, relation_type: relationType, relation_note: relationNote }), ...prev])
    }
    return { ok: true }
  }

  const approveReg = async (regId, { role, username, password, holderId }) => {
    const reg = pendingRegs.find(r => r.id === regId)
    if (!reg) return

    if (!OFFLINE) {
      const { data, error } = await supabase.from('app_users').insert({
        full_name: reg.fullName, username, password, phone: reg.phone,
        role, status: 'active', language: 'ar',
        holder_id: holderId || reg.requestedHolderId || null,
        relation_type: reg.relationType || null,
      }).select().single()
      if (error) { console.error(error); return }
      await supabase.from('pending_registrations').delete().eq('id', regId)
      setUsers(prev => [...prev, nu(data)])
    } else {
      const newUser = {
        id: `u_${Date.now()}`, fullName: reg.fullName, username, password,
        phone: reg.phone, role, status: 'active', language: 'ar',
        holderId: holderId || reg.requestedHolderId || null,
        relationType: reg.relationType || null,
      }
      setUsers(prev => [...prev, newUser])
    }
    setPendingRegs(prev => prev.filter(r => r.id !== regId))
    _logAudit({ actor: currentUser?.fullName || '—', action: `اعتماد تسجيل — ${role === 'admin' ? 'أدمن' : 'مستفيد'}`, entity: `${reg.fullName} (@${username})` })
  }

  const rejectReg = async (regId) => {
    const reg = pendingRegs.find(r => r.id === regId)
    if (reg) _logAudit({ actor: currentUser?.fullName || '—', action: 'رفض تسجيل', entity: reg.fullName })
    if (!OFFLINE) await supabase.from('pending_registrations').delete().eq('id', regId)
    setPendingRegs(prev => prev.filter(r => r.id !== regId))
  }

  // ── Holder name changes ────────────────────────────────────────────────────
  const directEditName = async ({ holderId, currentName, newName, reason, note }) => {
    setHolderNames(prev => ({ ...prev, [holderId]: newName }))
    if (!OFFLINE)
      await supabase.from('holder_name_overrides')
        .upsert({ holder_id: holderId, name: newName, updated_at: new Date().toISOString() })
    _logAudit({ actor: currentUser?.fullName || '—', action: `تعديل اسم — ${reason}`, entity: `${currentName} ← ${newName}${note ? ' · ' + note : ''}` })
  }

  const requestNameChange = async ({ holderId, currentName, newName, reason, note }) => {
    const row = {
      holder_id: holderId, current_name: currentName, new_name: newName,
      reason, note, requested_by: currentUser?.id,
      requested_by_name: currentUser?.fullName,
      requested_at: new Date().toLocaleString('ar-OM',{timeZone:'Asia/Muscat'}), status: 'pending',
    }
    if (!OFFLINE) {
      const { data, error } = await supabase.from('name_change_requests').insert(row).select().single()
      if (error) return
      setNameChangeRequests(prev => [ncr(data), ...prev])
    } else {
      setNameChangeRequests(prev => [ncr({ ...row, id: `ncr_${Date.now()}` }), ...prev])
    }
  }

  const approveNameChange = async (reqId) => {
    const req = nameChangeRequests.find(r => r.id === reqId)
    if (!req) return
    const reviewedAt = new Date().toLocaleString('ar-OM',{timeZone:'Asia/Muscat'})
    setHolderNames(prev => ({ ...prev, [req.holderId]: req.newName }))
    setNameChangeRequests(prev => prev.map(r => r.id === reqId
      ? { ...r, status: 'approved', reviewedBy: currentUser?.fullName, reviewedAt } : r))
    if (!OFFLINE) {
      await supabase.from('holder_name_overrides')
        .upsert({ holder_id: req.holderId, name: req.newName, updated_at: new Date().toISOString() })
      await supabase.from('name_change_requests')
        .update({ status: 'approved', reviewed_by: currentUser?.fullName, reviewed_at: reviewedAt })
        .eq('id', reqId)
    }
    _logAudit({ actor: currentUser?.fullName || '—', action: `اعتماد تعديل اسم — ${req.reason}`, entity: `${req.currentName} ← ${req.newName}` })
  }

  const rejectNameChange = async (reqId) => {
    const req = nameChangeRequests.find(r => r.id === reqId)
    const reviewedAt = new Date().toLocaleString('ar-OM',{timeZone:'Asia/Muscat'})
    setNameChangeRequests(prev => prev.map(r => r.id === reqId
      ? { ...r, status: 'rejected', reviewedBy: currentUser?.fullName, reviewedAt } : r))
    if (!OFFLINE)
      await supabase.from('name_change_requests')
        .update({ status: 'rejected', reviewed_by: currentUser?.fullName, reviewed_at: reviewedAt })
        .eq('id', reqId)
    if (req) _logAudit({ actor: currentUser?.fullName || '—', action: 'رفض تعديل اسم', entity: req.currentName })
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const pendingNameChanges = nameChangeRequests.filter(r => r.status === 'pending')
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <AppCtx.Provider value={{
      appReady, isOffline: OFFLINE,
      currentUser, login, loginWithCredentials, logout,
      users, loginLogs,
      updateAvatar, updateUserName, updatePhone,
      broadcastNotif, submitRegistration,
      lang, setLang, t,
      pendingRegs, approveReg, rejectReg,
      notifications, markNotifRead, unreadCount,
      reminderLogs: [], logReminder,
      auditLogs, logAudit: _logAudit,
      holderNames, directEditName,
      nameChangeRequests, pendingNameChanges,
      requestNameChange, approveNameChange, rejectNameChange,
    }}>
      {children}
    </AppCtx.Provider>
  )
}
