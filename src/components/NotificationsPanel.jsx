import { useApp } from '../hooks/useAppState'

export default function NotificationsPanel({ onClose }) {
  const { notifications, markNotifRead, t } = useApp()

  const icons = {
    turn_reminder:  'ti-bell',
    split_approved: 'ti-git-branch',
    system:         'ti-info-circle',
    broadcast:      'ti-speakerphone',
  }

  return (
    <div style={{position:'absolute', top:60, left:0, right:0, zIndex:200, padding:'0 14px'}}>
      <div className="card" style={{boxShadow:'0 8px 32px rgba(44,31,14,.15)'}}>
        <div className="card-head">
          <span className="card-title">{t('الإشعارات','Notifications')}</span>
          <span style={{fontSize:12, color:'var(--c-stone)', cursor:'pointer'}} onClick={onClose}>
            {t('إغلاق','Close')} ✕
          </span>
        </div>
        <div className="card-body" style={{padding:0}}>
          {notifications.length === 0 && (
            <div style={{padding:'24px', textAlign:'center', color:'var(--c-stone)', fontSize:13}}>
              {t('لا توجد إشعارات','No notifications')}
            </div>
          )}
          {notifications.map(n => (
            <div key={n.id} className="notif-item" style={{padding:'12px 14px', cursor:'pointer'}}
              onClick={()=>markNotifRead(n.id)}>
              <div style={{width:32, height:32, borderRadius:'50%', background: n.isRead ? 'var(--c-sand)' : 'var(--c-water-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                <i className={`ti ${icons[n.type]||'ti-bell'}`} style={{fontSize:16, color: n.isRead ? 'var(--c-stone)' : 'var(--c-water)'}} aria-hidden="true"/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight: n.isRead ? 400 : 600, color:'var(--c-soil)'}}>{n.titleAr}</div>
                <div style={{fontSize:11, color:'var(--c-stone)', marginTop:2}}>{n.body}</div>
              </div>
              {!n.isRead && <div style={{width:7, height:7, borderRadius:'50%', background:'var(--c-water)', flexShrink:0, marginTop:6}}/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
