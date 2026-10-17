import { useApp } from '../hooks/useAppState'

export default function SuccessPage({ registration, onBack }) {
  const { t } = useApp()
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0D2A1A,#0D1F2D)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,gap:20}}>
      <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(29,158,117,.15),transparent 70%)'}}/>

      {/* أيقونة النجاح */}
      <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#1D9E75,#2DC48A)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 40px rgba(29,158,117,.4)',animation:'popIn .4s cubic-bezier(.34,1.56,.64,1)'}}>
        <i className="ti ti-check" style={{fontSize:36,color:'#fff'}}/>
      </div>

      <div style={{textAlign:'center'}}>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:8}}>
          {t('تم إرسال طلبك!','Request Submitted!')}
        </div>
        <div style={{fontSize:13,color:'rgba(255,255,255,.5)',lineHeight:1.7}}>
          {t(
            'سيراجع الأدمن طلبك ويتواصل معك على رقم هاتفك المسجل عند الاعتماد.',
            'Admin will review your request and contact you on your registered phone when approved.'
          )}
        </div>
      </div>

      <div style={{background:'rgba(255,255,255,.07)',borderRadius:20,padding:20,width:'100%',maxWidth:360,border:'1px solid rgba(255,255,255,.1)'}}>
        <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:14}}>{t('ملخص طلبك','Your Request Summary')}</div>
        {[
          { label:t('الاسم','Name'),   value:registration.fullName },
          { label:t('الهاتف','Phone'), value:registration.phone    },
        ].map((row,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.06)',fontSize:13}}>
            <span style={{color:'rgba(255,255,255,.4)'}}>{row.label}</span>
            <span style={{color:'#fff',fontWeight:500}}>{row.value}</span>
          </div>
        ))}
        <div style={{marginTop:14,background:'rgba(29,158,117,.15)',borderRadius:10,padding:'10px 12px',display:'flex',alignItems:'center',gap:8,fontSize:12,color:'rgba(255,255,255,.7)'}}>
          <i className="ti ti-clock" style={{fontSize:14,color:'#2DC48A',flexShrink:0}}/>
          {t('متوسط وقت المراجعة: 24 ساعة','Average review time: 24 hours')}
        </div>
      </div>

      <button className="btn btn-outline" style={{color:'rgba(255,255,255,.7)',borderColor:'rgba(255,255,255,.2)',background:'rgba(255,255,255,.05)'}} onClick={onBack}>
        <i className="ti ti-arrow-right"/>
        {t('العودة لتسجيل الدخول','Back to Sign In')}
      </button>

      <style>{`@keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}
