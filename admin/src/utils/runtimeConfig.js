// Small runtime config helper for admin app.
export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const host = (window.location && window.location.hostname) || ''
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)

    if (isLocalHost) {
      const backendHost = host === '::1' ? 'localhost' : host
      return `http://${backendHost}:4000`
    }
  }

  try {
    const env = (import.meta.env.VITE_BACKEND_URL || '').trim()
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
