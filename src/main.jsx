import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './hooks/useAppState'
import { CycleProvider } from './hooks/useCycleSettings'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <CycleProvider>
        <App/>
      </CycleProvider>
    </AppProvider>
  </React.StrictMode>
)
