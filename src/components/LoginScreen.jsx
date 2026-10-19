import { useState } from 'react'
import { useApp } from '../hooks/useAppState'
import RegisterPage from '../pages/RegisterPage'
import SuccessPage from '../pages/SuccessPage'

export default function LoginScreen() {
  const { loginWithCredentials, lang, setLang, t } = useApp()

  const [screen, setScreen] = useState('login') // login | register | success
  const [lastReg, setLastReg] = useState(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

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

  const handleLogin = () => {
    if (!username.trim() || !password) {
      setError(t('أدخل اسم المستخدم وكلمة المرور','Enter username and password'))
      return
    }
    setLoading(true)
    setTimeout(() => {
      const result = loginWithCredentials(username, password)
      setLoading(false)
      if (!result.ok) {
        setError(t('اسم المستخدم أو كلمة المرور غير صحيحة','Incorrect username or password'))
        setPassword('')
      }
    }, 400)
  }

  return (
    <div className="login-screen" dir={lang==='ar'?'rtl':'ltr'}
      style={{padding:0,justifyContent:'flex-start',background:'#0D1F2D'}}>

      {/* Hero image */}
      <div style={{position:'relative',width:'100%',height:220,overflow:'hidden',flexShrink:0}}>
        <img
          src="https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80"
          alt="فلج"
          style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 60%',filter:'brightness(.55)'}}
          onError={e=>{e.target.style.display='none'}}
        />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(13,31,45,0) 30%,rgba(13,31,45,1) 100%)'}}/>

        {/* language toggle */}
        <div style={{position:'absolute',top:16,left:lang==='ar'?16:'auto',right:lang==='ar'?'auto':16,display:'flex',gap:4,zIndex:2}}>
          {['ar','en'].map(l=>(
            <button key={l} onClick={()=>setLang(l)}
              style={{fontSize:11,padding:'4px 9px',borderRadius:7,cursor:'pointer',border:'1.5px solid',
                borderColor:lang===l?'#fff':'rgba(255,255,255,.3)',
                background:lang===l?'rgba(255,255,255,.9)':'rgba(0,0,0,.3)',
                color:lang===l?'#0D1F2D':'rgba(255,255,255,.8)',
                fontWeight:lang===l?700:400,backdropFilter:'blur(6px)',transition:'all .18s'}}>
              {l==='ar'?'ع':'EN'}
            </button>
          ))}
        </div>

        {/* App identity */}
        <div style={{position:'absolute',bottom:18,width:'100%',textAlign:'center',zIndex:2,padding:'0 20px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:6}}>
            <div style={{width:42,height:42,borderRadius:'50%',
              background:'linear-gradient(135deg,#1A6B8A,#4A9DB5)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:20,color:'#fff',
              boxShadow:'0 4px 20px rgba(26,107,138,.6)',
              border:'2px solid rgba(255,255,255,.25)'}}>
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
          <div style={{display:'inline-flex',alignItems:'center',gap:5,
            background:'rgba(0,0,0,.35)',backdropFilter:'blur(8px)',
            borderRadius:20,padding:'5px 14px',border:'1px solid rgba(255,255,255,.12)'}}>
            <i className="ti ti-map-pin" style={{fontSize:11,color:'#4A9DB5'}}/>
            <span style={{fontSize:11,color:'rgba(255,255,255,.75)',letterSpacing:'.03em'}}>
              {t('قرية سيجاء · ولاية سمائل','Sayjah Village · Samail Wilayat')}
            </span>
          </div>
        </div>
      </div>

      {/* Login card */}
      <div style={{background:'rgba(255,255,255,.97)',borderRadius:'24px 24px 0 0',
        padding:24,width:'100%',maxWidth:480,
        position:'relative',zIndex:1,marginTop:-12,flex:1}}>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:700,color:'var(--c-soil)'}}>
            {t('تسجيل الدخول','Sign In')}
          </div>
          <div style={{fontSize:11,color:'var(--c-stone)',marginTop:3}}>
            {t('أدخل بيانات حسابك للمتابعة','Enter your credentials to continue')}
          </div>
        </div>

        {/* Username */}
        <div className="form-group">
          <label className="form-label">{t('اسم المستخدم','Username')}</label>
          <div style={{position:'relative'}}>
            <i className="ti ti-user" style={{
              position:'absolute',top:'50%',transform:'translateY(-50%)',
              [lang==='ar'?'right':'left']:12,
              fontSize:16,color:'var(--c-stone)',pointerEvents:'none'}}/>
            <input
              className="form-input"
              value={username}
              onChange={e=>{setUsername(e.target.value);setError('')}}
              placeholder={t('مثال: fahad','e.g. fahad')}
              autoCapitalize="none"
              autoCorrect="off"
              style={{[lang==='ar'?'paddingRight':'paddingLeft']:38}}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">{t('كلمة المرور','Password')}</label>
          <div style={{position:'relative'}}>
            <i className="ti ti-lock" style={{
              position:'absolute',top:'50%',transform:'translateY(-50%)',
              [lang==='ar'?'right':'left']:12,
              fontSize:16,color:'var(--c-stone)',pointerEvents:'none'}}/>
            <input
              className="form-input"
              type={showPass?'text':'password'}
              value={password}
              onChange={e=>{setPassword(e.target.value);setError('')}}
              placeholder="••••••••"
              style={{[lang==='ar'?'paddingRight':'paddingLeft']:38,[lang==='ar'?'paddingLeft':'paddingRight']:40}}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
            />
            <button onClick={()=>setShowPass(v=>!v)} style={{
              position:'absolute',top:'50%',transform:'translateY(-50%)',
              [lang==='ar'?'left':'right']:10,
              background:'none',border:'none',cursor:'pointer',padding:4,
              color:'var(--c-stone)',fontSize:16}}>
              <i className={`ti ti-eye${showPass?'-off':''}`}/>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{display:'flex',alignItems:'center',gap:8,
            padding:'10px 12px',borderRadius:10,
            background:'rgba(192,57,43,.07)',border:'1px solid rgba(192,57,43,.2)',
            color:'#C0392B',fontSize:12,marginBottom:12}}>
            <i className="ti ti-alert-circle" style={{fontSize:15,flexShrink:0}}/>
            {error}
          </div>
        )}

        {/* Login button */}
        <button className="btn btn-primary btn-full"
          onClick={handleLogin}
          disabled={loading}
          style={{marginBottom:16,fontSize:14,fontWeight:700,letterSpacing:'.01em',
            opacity:loading?.7:1,transition:'opacity .2s'}}>
          {loading
            ? <><i className="ti ti-loader-2" style={{animation:'spin 1s linear infinite'}}/>{t('جاري الدخول...','Signing in...')}</>
            : <><i className="ti ti-login"/>{t('دخول','Sign In')}</>
          }
        </button>

        {/* Divider */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <div style={{flex:1,height:1,background:'rgba(44,31,14,.08)'}}/>
          <span style={{fontSize:11,color:'var(--c-stone)'}}>{t('أو','or')}</span>
          <div style={{flex:1,height:1,background:'rgba(44,31,14,.08)'}}/>
        </div>

        {/* Register button */}
        <button className="btn btn-outline btn-full"
          style={{borderStyle:'dashed',borderColor:'rgba(26,107,138,.3)',color:'var(--c-water)',fontWeight:600}}
          onClick={()=>setScreen('register')}>
          <i className="ti ti-user-plus" style={{fontSize:16}}/>
          {t('تسجيل مستخدم جديد','Register New User')}
        </button>

        <div style={{marginTop:14,fontSize:11,color:'var(--c-stone)',textAlign:'center',lineHeight:1.8}}>
          {t('نظام تجريبي · البيانات من فلج القري الحقيقي','Demo system · data from the real Falaj Al-Qari')}
          <br/>
          <span style={{color:'var(--c-water)',fontWeight:600}}>
            {t('سيجاء · سمائل · عُمان','Sayjah · Samail · Oman')}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
