// Small runtime config helper for admin app.
export function getBackendUrl() {
  try {
    const env = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').trim()
    if (env) return env.replace(/\/+$/g, '')
  } catch (e) {
    // ignore
  }

  if (typeof window !== 'undefined' && window.__DEPLOYED && window.__DEPLOYED.backendUrl) {
    return String(window.__DEPLOYED.backendUrl).replace(/\/+$/g, '')
  }

  return ''
}

export default getBackendUrl
