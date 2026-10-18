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
    <div className="login-screen" dir={lang==='ar'?'rtl':'ltr'} style={{padding:0,justifyContent:'flex-start',background:'#0D1F2D'}}>

      {/* Hero image */}
      <div style={{position:'relative',width:'100%',height:220,overflow:'hidden',flexShrink:0}}>
        <img
          src="https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80"
          alt="فلج"
          style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 60%',filter:'brightness(.55)'}}
          onError={e=>{e.target.style.display='none'}}
        />
        {/* gradient overlay bottom */}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(13,31,45,0) 30%,rgba(13,31,45,1) 100%)'}}/>

        {/* language toggle */}
        <div style={{position:'absolute',top:16,left:lang==='ar'?16:'auto',right:lang==='ar'?'auto':16,display:'flex',gap:4,zIndex:2}}>
          {['ar','en'].map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{fontSize:11,padding:'4px 9px',borderRadius:7,cursor:'pointer',border:'1.5px solid',borderColor:lang===l?'#fff':'rgba(255,255,255,.3)',background:lang===l?'rgba(255,255,255,.9)':'rgba(0,0,0,.3)',color:lang===l?'#0D1F2D':'rgba(255,255,255,.8)',fontWeight:lang===l?700:400,backdropFilter:'blur(6px)',transition:'all .18s'}}>
              {l==='ar'?'ع':'EN'}
            </button>
          ))}
        </div>

        {/* App identity over image */}
        <div style={{position:'absolute',bottom:18,width:'100%',textAlign:'center',zIndex:2,padding:'0 20px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:6}}>
            <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#1A6B8A,#4A9DB5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:'#fff',boxShadow:'0 4px 20px rgba(26,107,138,.6)',border:'2px solid rgba(255,255,255,.25)'}}>
              <i className="ti ti-droplet-half-2"/>
            </div>
            <div style={{textAlign:lang==='ar'?'right':'left'}}>
              <div style={{fontSize:28,fontWeight:800,color:'#fff',lineHeight:1,letterSpacing:'.01em',textShadow:'0 2px 12px rgba(0,0,0,.5)'}}>
                {t('أثر','Athar')}
              </div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontWeight:500,marginTop:2}}>
                {t('فلج القري','Falaj Al-Qari')}
              </div>
            </div>
          </div>
          <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'rgba(0,0,0,.35)',backdropFilter:'blur(8px)',borderRadius:20,padding:'5px 14px',border:'1px solid rgba(255,255,255,.12)'}}>
            <i className="ti ti-map-pin" style={{fontSize:11,color:'#4A9DB5'}}/>
            <span style={{fontSize:11,color:'rgba(255,255,255,.75)',letterSpacing:'.03em'}}>
              {t('قرية سيجاء · ولاية سمائل','Sayjah Village · Samail Wilayat')}
            </span>
          </div>
        </div>
      </div>

      <div style={{background:'rgba(255,255,255,.97)',borderRadius:'24px 24px 0 0',padding:24,width:'100%',maxWidth:480,position:'relative',zIndex:1,marginTop:-12,flex:1}}>

        <div style={{marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--c-soil)'}}>
            {t('اختر حسابك','Select your account')}
          </div>
          <div style={{fontSize:11,color:'var(--c-stone)',marginTop:3}}>
            {t('نظام إدارة توزيع مياه الفلج','Falaj water distribution management system')}
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

        <div style={{marginTop:14,fontSize:11,color:'var(--c-stone)',textAlign:'center',lineHeight:1.8}}>
          {t('نظام تجريبي · البيانات من فلج القري الحقيقي','Demo system · data from the real Falaj Al-Qari')}
          <br/>
          <span style={{color:'var(--c-water)',fontWeight:600}}>{t('سيجاء · سمائل · عُمان','Sayjah · Samail · Oman')}</span>
        </div>
      </div>
    </div>
  )
}
