import { useState } from 'react'
import { useApp } from '../hooks/useAppState'
import RegisterPage from '../pages/RegisterPage'
import SuccessPage from '../pages/SuccessPage'
import { USERS_MOCK } from '../data/falajData'

const ROLE_COLOR = {
  beneficiary:  { bg:'#1A6B8A', label:'مستفيد',    labelEn:'Beneficiary'  },
  admin:        { bg:'#2D6A2D', label:'أدمن',       labelEn:'Admin'        },
  super_admin:  { bg:'#7A3055', label:'سوبر أدمن',  labelEn:'Super Admin'  },
}

export default function LoginScreen() {
  const { loginWithCredentials, lang, setLang, t } = useApp()

  const [screen, setScreen] = useState('login') // login | register | success
  const [lastReg, setLastReg] = useState(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showDemo, setShowDemo] = useState(false)

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

  const quickLogin = (user) => {
    setUsername(user.username)
    setPassword(user.password)
    setError('')
    setShowDemo(false)
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

        {/* Demo accounts */}
        <div style={{borderRadius:12,border:'1px solid rgba(44,31,14,.1)',overflow:'hidden',marginBottom:16}}>
          <button
            onClick={()=>setShowDemo(v=>!v)}
            style={{width:'100%',padding:'10px 14px',background:'rgba(44,31,14,.03)',
              border:'none',cursor:'pointer',display:'flex',alignItems:'center',
              justifyContent:'space-between',gap:8}}>
            <span style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--c-stone)',fontWeight:600}}>
              <i className="ti ti-users" style={{fontSize:14,color:'var(--c-water)'}}/>
              {t('حسابات تجريبية للاختبار','Demo accounts for testing')}
            </span>
            <i className={`ti ti-chevron-${showDemo?'up':'down'}`} style={{fontSize:13,color:'var(--c-stone)'}}/>
          </button>

          {showDemo && (
            <div style={{borderTop:'1px solid rgba(44,31,14,.08)'}}>
              {USERS_MOCK.map(u => {
                const rc = ROLE_COLOR[u.role] || ROLE_COLOR.beneficiary
                return (
                  <button key={u.id} onClick={()=>quickLogin(u)}
                    style={{width:'100%',padding:'10px 14px',background:'none',
                      border:'none',borderBottom:'1px solid rgba(44,31,14,.05)',
                      cursor:'pointer',display:'flex',alignItems:'center',gap:10,
                      textAlign:lang==='ar'?'right':'left'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',flexShrink:0,
                      background:rc.bg,color:'#fff',display:'flex',alignItems:'center',
                      justifyContent:'center',fontSize:13,fontWeight:700}}>
                      {u.fullName.split(' ').slice(0,2).map(w=>w[0]).join('')}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:'var(--c-soil)',
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {u.fullName}
                      </div>
                      <div style={{fontSize:10,color:'var(--c-stone)',marginTop:1,
                        display:'flex',alignItems:'center',gap:6}}>
                        <code style={{background:'rgba(44,31,14,.06)',padding:'1px 5px',borderRadius:4,letterSpacing:'.03em'}}>
                          {u.username}
                        </code>
                        <span style={{padding:'1px 6px',borderRadius:8,fontWeight:700,
                          background:`${rc.bg}18`,color:rc.bg,border:`1px solid ${rc.bg}30`,fontSize:9}}>
                          {lang==='ar'?rc.label:rc.labelEn}
                        </span>
                      </div>
                    </div>
                    <i className="ti ti-arrow-left" style={{fontSize:12,color:'var(--c-stone)',opacity:.4,
                      transform:lang==='ar'?'none':'scaleX(-1)'}}/>
                  </button>
                )
              })}
            </div>
          )}
        </div>

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
