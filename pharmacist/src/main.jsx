import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { PharmacistProvider } from './context/PharmacistContext.jsx'

// Load runtime deployed.json (if present) before hydrating the app so
// runtime code can use runtime URLs when Vite envs were not provided.
;(async function loadRuntimeAndRender() {
  try {
    const res = await fetch('/deployed.json')
    if (res.ok) {
      window.__DEPLOYED = await res.json()
    }
  } catch (e) {
    // ignore
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <PharmacistProvider>
          <App />
        </PharmacistProvider>
      </BrowserRouter>
    </React.StrictMode>,
  )
})()
