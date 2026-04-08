// Small runtime config helper: prefer VITE_BACKEND_URL embedded at build time,
// otherwise read the runtime deployed.json attached to window.__DEPLOYED.
export function getBackendUrl() {
  try {
    const env = (import.meta.env.VITE_BACKEND_URL || '').trim()
    if (env) return env.replace(/\/+$|\s+$/g, '')
  } catch (e) {
    // import.meta may not be available in some contexts; ignore
  }
  if (typeof window !== 'undefined' && window.__DEPLOYED && window.__DEPLOYED.backendUrl) {
    return String(window.__DEPLOYED.backendUrl).replace(/\/+$/g, '')
  }
  return ''
}

export default getBackendUrl
