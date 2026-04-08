// Small runtime config helper for pharmacist app.
export function getBackendUrl() {
  try {
    const env = (import.meta.env.VITE_BACKEND_URL || '').trim()
    if (env) return env.replace(/\/+$/g, '')
  } catch (e) {
    // ignore
  }
  if (typeof window !== 'undefined' && window.__DEPLOYED && window.__DEPLOYED.backendUrl) {
    return String(window.__DEPLOYED.backendUrl).replace(/\/+$/g, '')
  }
  // fallback
  return ''
}

export default getBackendUrl
