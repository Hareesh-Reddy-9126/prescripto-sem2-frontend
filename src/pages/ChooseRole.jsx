import React, { useEffect, useState } from 'react'

const ChooseRole = () => {
  const [urls, setUrls] = useState({
    admin: import.meta.env.VITE_ADMIN_URL || '',
    doctor: import.meta.env.VITE_DOCTOR_URL || '',
    pharmacist: import.meta.env.VITE_PHARMACIST_URL || '',
    frontend: import.meta.env.VITE_FRONTEND_URL || '',
    backend: import.meta.env.VITE_BACKEND_URL || ''
  })

  useEffect(() => {
    // if any URL missing, try to load fallback deployed.json hosted in public/
    const needsFallback = !urls.admin || !urls.pharmacist || !urls.frontend || !urls.backend
    if (needsFallback) {
      fetch('/deployed.json')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!data) return
          setUrls(prev => ({
            admin: prev.admin || data.adminUrl || '',
            doctor: prev.doctor || data.doctorUrl || '',
            pharmacist: prev.pharmacist || data.pharmacistUrl || '',
            frontend: prev.frontend || data.frontendUrl || '',
            backend: prev.backend || data.backendUrl || ''
          }))
        })
        .catch(() => {
          // ignore fetch errors — env vars may still be present
        })
    }
  }, [])

  const normalizeUrl = (u) => {
    if (!u) return ''
    // if url missing protocol but looks like hostname, prefix https://
    if (/^[a-z0-9.-]+(\/.*)?$/i.test(u)) return `https://${u}`
    return u
  }

  const open = (url, fallback, params = {}) => {
    // clear local tokens in current app to avoid immediate auto-login
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('aToken')
      localStorage.removeItem('dToken')
      localStorage.removeItem('pToken')
    } catch (e) {
      // ignore
    }

    let final = ''
    if (url) final = normalizeUrl(url)
    else if (fallback) final = normalizeUrl(fallback)
    else {
      alert('Dashboard URL not configured. Please ask the administrator.')
      return
    }

    try {
      const target = new URL(final, window.location.origin)
      const search = new URLSearchParams(target.search)
      // merge provided params
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) search.set(k, String(v))
      })
      // always force login
      search.set('forceLogin', '1')
      target.search = search.toString()
      // full navigation
      window.location.href = target.toString()
    } catch (e) {
      // fallback if URL parsing fails
      const sep = final.includes('?') ? '&' : '?'
      const pairs = []
      Object.entries(params).forEach(([k, v]) => v != null && pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`))
      pairs.push('forceLogin=1')
      window.location.href = final + sep + pairs.join('&')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-xl p-8 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Choose your dashboard</h2>
        <p className="mb-6 text-sm text-gray-600">Select the role you want to sign in as. If your project's live URL is configured, you'll be redirected to that app's login page.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => {
            // Ensure we navigate to the login route (not root) so the login form appears.
            const base = urls.frontend || ''
            const target = base ? `${base.replace(/\/+$/,'')}/login` : '/login'
            open(target, '/login')
          }} className="px-4 py-3 rounded-lg bg-primary text-white">Patient (User)</button>
          <button onClick={() => {
            const base = urls.doctor || urls.admin || ''
            if (!base) return alert('Doctor dashboard not configured')
            open(base, '', { role: 'doctor' })
          }} className="px-4 py-3 rounded-lg bg-indigo-600 text-white">Doctor</button>
          <button onClick={() => open(urls.pharmacist || '')} className="px-4 py-3 rounded-lg bg-emerald-600 text-white">Pharmacist</button>
          <button onClick={() => open(urls.admin || '')} className="px-4 py-3 rounded-lg bg-gray-800 text-white">Admin</button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Note: Configure the following Vite environment variables in each deployed frontend to make those buttons go to the live apps:</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>VITE_ADMIN_URL</code></li>
            <li><code>VITE_DOCTOR_URL</code></li>
            <li><code>VITE_PHARMACIST_URL</code></li>
            <li><code>VITE_FRONTEND_URL</code> (optional — usually this app)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ChooseRole
