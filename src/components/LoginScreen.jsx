import { useState } from 'react'
import { useApp } from '../hooks/useAppState'
import RegisterPage from '../pages/RegisterPage'
import SuccessPage from '../pages/SuccessPage'

const DEMO_USERS = [
  { id:'u01', label:'خليفة بن محفوظ التوبي', labelEn:'Khalifa bin Mahfouz Al-Tobi', role:'مستفيد', roleEn:'Beneficiary', color:'#1A6B8A', bg:'linear-gradient(135deg,#1A6B8A,#4A9DB5)', icon:'ti-user', desc:'التوبي', descEn:'Al-Tobi Tribe' },
  { id:'u02', label:'أحمد بن سيف الرمضاني',   labelEn:'Ahmed bin Saif Al-Ramdani',   role:'أدمن',      roleEn:'Admin',        color:'#2D6A2D', bg:'linear-gradient(135deg,#2D6A2D,#4A9A4A)', icon:'ti-shield-half', desc:'الرمضاني', descEn:'Al-Ramdani Tribe' },
  { id:'u03', label:'سيف بن خلفان الرمضاني',  labelEn:'Saif bin Khalfan Al-Ramdani', role:'سوبر أدمن', roleEn:'Super Admin',  color:'#7A3055', bg:'linear-gradient(135deg,#7A3055,#A84A7A)', icon:'ti-shield-star', desc:'الرمضاني', descEn:'Al-Ramdani Tribe' },
]

const DEMO_SUPER_PIN = '1234'

export default function LoginScreen() {
  const { login, lang, setLang, t } = useApp()
  const [screen, setScreen] = useState('login') // login | register | success
  const [lastReg, setLastReg] = useState(null)
  const [pendingUser, setPendingUser] = useState(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  if (screen === 'register') {
    return (
      <RegisterPage
        onBack={() => setScreen('login')}
        onSuccess={(reg) => { setLastReg(reg); setScreen('success') }}
      />
    )
  }
  if (screen === 'success') {
    return <SuccessPage registration={lastReg} onBack={() => setScreen('login')}/>
  }

  return (
    <div className="login-screen" dir={lang==='ar'?'rtl':'ltr'}>
      <div className="login-pattern"/>

      <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#1A6B8A,#4A9DB5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,color:'#fff',boxShadow:'0 8px 40px rgba(26,107,138,.5),0 0 0 12px rgba(26,107,138,.1)',position:'relative',zIndex:1,animation:'logoFloat 4s ease-in-out infinite'}}>
        <i className="ti ti-droplet"/>
      </div>

      <div style={{textAlign:'center',position:'relative',zIndex:1}}>
        <div style={{fontSize:26,fontWeight:700,color:'#fff',letterSpacing:'.02em'}}>
          {t('فلج القري','Falaj Al-Qari')}
        </div>
        <div style={{fontSize:13,color:'rgba(255,255,255,.45)',marginTop:6}}>
          {t('نظام إدارة توزيع المياه','Water Distribution Management')}
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:5,marginTop:12,opacity:.5}}>
          {[12,18,14,22,16,20,14].map((h,i)=>(
            <div key={i} style={{width:3,height:h,borderRadius:2,background:'rgba(74,157,181,.9)'}}/>
          ))}
        </div>
      </div>

      <div style={{background:'rgba(255,255,255,.97)',borderRadius:24,padding:24,width:'100%',maxWidth:360,position:'relative',zIndex:1,boxShadow:'0 20px 60px rgba(13,31,45,.4)'}}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--c-soil)'}}>
            {t('اختر حسابك','Select your account')}
          </div>
          <div style={{display:'flex',gap:4}}>
            {['ar','en'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{fontSize:11,padding:'4px 9px',borderRadius:7,cursor:'pointer',border:'1.5px solid',borderColor:lang===l?'#1A6B8A':'rgba(44,31,14,.15)',background:lang===l?'#1A6B8A':'transparent',color:lang===l?'#fff':'#8A7A6A',fontWeight:lang===l?700:400,transition:'all .18s'}}>
                {l==='ar'?'ع':'EN'}
              </button>
            ))}
          </div>
        </div>

        {/* PIN gate for super admin */}
        {pendingUser === 'u03' && (
          <div style={{marginBottom:14,padding:'14px 16px',borderRadius:14,background:'rgba(122,48,85,.06)',border:'1.5px solid rgba(122,48,85,.2)'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#7A3055',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
              <i className="ti ti-shield-star" style={{fontSize:14}}/>
              {t('أدخل رمز سوبر أدمن','Enter super admin PIN')}
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              className="form-input"
              value={pin}
              onChange={e=>{ setPin(e.target.value); setPinError(false) }}
              placeholder={t('الرمز السري','PIN')}
              style={{letterSpacing:8,fontSize:20,textAlign:'center',marginBottom:8}}
              autoFocus
            />
            {pinError && (
              <div style={{fontSize:11,color:'#C0392B',textAlign:'center',marginBottom:8}}>
                {t('رمز خاطئ — حاول مجدداً','Wrong PIN — try again')}
              </div>
            )}
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={()=>{ setPendingUser(null); setPin(''); setPinError(false) }}>
                {t('إلغاء','Cancel')}
              </button>
              <button className="btn btn-primary btn-sm" style={{flex:1,background:'#7A3055',borderColor:'#7A3055'}}
                onClick={()=>{ if(pin===DEMO_SUPER_PIN){ login('u03'); setPendingUser(null); setPin('') } else { setPinError(true); setPin('') } }}>
                {t('دخول','Enter')}
              </button>
            </div>
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {DEMO_USERS.map(u => {
            const name = lang==='ar'?u.label:u.labelEn
            const ini  = name.split(' ').slice(0,2).map(w=>w[0]).join('')
            return (
              <button key={u.id} className="login-demo-btn" onClick={()=> u.id==='u03' ? setPendingUser('u03') : login(u.id)}>
                <div style={{width:46,height:46,borderRadius:'50%',background:u.bg,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,flexShrink:0,boxShadow:`0 4px 14px ${u.color}50`,border:'2px solid rgba(255,255,255,.6)'}}>
                  {ini}
                </div>
                <div style={{flex:1,textAlign:lang==='ar'?'right':'left'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--c-soil)',lineHeight:1.3}}>{name}</div>
                  <div style={{fontSize:11,color:'#8A7A6A',marginTop:2}}>
                    <i className={`ti ${u.icon}`} style={{fontSize:11,marginLeft:3}}/>{lang==='ar'?u.desc:u.descEn}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <span style={{fontSize:10,padding:'3px 9px',borderRadius:10,fontWeight:700,background:`${u.color}18`,color:u.color,border:`1.5px solid ${u.color}35`}}>
                    {lang==='ar'?u.role:u.roleEn}
                  </span>
                  <i className="ti ti-chevron-left" style={{fontSize:12,color:'#8A7A6A',opacity:.5}}/>
                </div>
              </button>
            )
          })}
        </div>

        {/* فاصل */}
        <div style={{display:'flex',alignItems:'center',gap:10,margin:'18px 0'}}>
          <div style={{flex:1,height:1,background:'rgba(44,31,14,.08)'}}/>
          <span style={{fontSize:11,color:'var(--c-stone)'}}>{t('أو','or')}</span>
          <div style={{flex:1,height:1,background:'rgba(44,31,14,.08)'}}/>
        </div>

        {/* زر التسجيل */}
        <button className="btn btn-outline btn-full"
          style={{borderStyle:'dashed',borderColor:'rgba(26,107,138,.3)',color:'var(--c-water)',fontWeight:600}}
          onClick={()=>setScreen('register')}>
          <i className="ti ti-user-plus" style={{fontSize:16}}/>
          {t('تسجيل مستخدم جديد','Register New User')}
        </button>

        <div style={{marginTop:14,fontSize:11,color:'var(--c-stone)',textAlign:'center',lineHeight:1.6}}>
          {t('نظام تجريبي — البيانات من فلج القري الحقيقي بولاية إزكي','Demo — data from the real Falaj Al-Qari, Izki')}
        </div>
      </div>
    </div>
  )
}
