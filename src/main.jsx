import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx'

// Load runtime deployed.json (if present) before hydrating the app so
// code can read runtime URLs when Vite build-time envs were not provided.
;(async function loadRuntimeAndRender() {
  try {
    const res = await fetch('/deployed.json')
    if (res.ok) {
      // attach to window for runtime helpers to read
      window.__DEPLOYED = await res.json()
    }
  } catch (e) {
    // ignore; fall back to Vite envs embedded at build time
    // console.warn('runtime deployed.json not loaded', e)
  }

  // If the incoming URL explicitly requests a forced login, clear any
  // stored tokens immediately before React mounts to avoid race conditions
  // where components read a stale token and auto-redirect.
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params && params.get('forceLogin') === '1') {
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('aToken')
          localStorage.removeItem('dToken')
          localStorage.removeItem('pToken')
        } catch (e) {
          // ignore storage errors
        }
      }
    }
  } catch (e) {
    // ignore
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>,
  )
})()
