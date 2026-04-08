import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AdminContextProvider from './context/AdminContext.jsx'
import DoctorContextProvider from './context/DoctorContext.jsx'
import AppContextProvider from './context/AppContext.jsx'

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
    <BrowserRouter>
      <AdminContextProvider>
        <DoctorContextProvider>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </DoctorContextProvider>
      </AdminContextProvider>
    </BrowserRouter>,
  )
})()
