import { useNav } from '../hooks/useNavigation'
import { useEffect, useRef } from 'react'

// يُغلّف كل صفحة بتأثير انتقال
export default function PageShell({ children }) {
  const { stackDepth } = useNav()
  const ref = useRef(null)
  const prevDepth = useRef(stackDepth)

  useEffect(() => {
    if (!ref.current) return
    const goingDeeper = stackDepth > prevDepth.current
    const anim = goingDeeper ? 'slideInRight' : 'slideInLeft'
    ref.current.style.animation = 'none'
    // trigger reflow
    void ref.current.offsetWidth
    ref.current.style.animation = `${anim} .22s cubic-bezier(.25,.8,.25,1) both`
    prevDepth.current = stackDepth
  }, [stackDepth])

  return (
    <div ref={ref} style={{flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
      {children}
    </div>
  )
}
