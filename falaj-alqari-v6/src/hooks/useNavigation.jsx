import { createContext, useContext, useState, useCallback } from 'react'

const NavCtx = createContext(null)
export const useNav = () => useContext(NavCtx)

export function NavProvider({ children }) {
  // stack: [{tab, page, title, props}]
  const [stack, setStack] = useState([])
  const [activeTab, setActiveTab] = useState('home')

  // الذهاب لتبويب رئيسي — يمسح الـ stack
  const goTab = useCallback((tab) => {
    setActiveTab(tab)
    setStack([])
  }, [])

  // الذهاب لصفحة داخلية — يضيف للـ stack
  const push = useCallback((page, title, props = {}) => {
    setStack(prev => [...prev, { page, title, props }])
  }, [])

  // رجوع خطوة
  const pop = useCallback(() => {
    setStack(prev => prev.slice(0, -1))
  }, [])

  // رجوع للتبويب الرئيسي مباشرة
  const popToRoot = useCallback(() => {
    setStack([])
  }, [])

  const current = stack.length > 0 ? stack[stack.length - 1] : null
  const canGoBack = stack.length > 0

  return (
    <NavCtx.Provider value={{ activeTab, goTab, push, pop, popToRoot, current, canGoBack, stackDepth: stack.length }}>
      {children}
    </NavCtx.Provider>
  )
}
