let fetch = null
try {
  fetch = globalThis.fetch
} catch (e) {
  // ignore
}
if (!fetch) {
  try {
    // try to require node-fetch for older Node versions
    // eslint-disable-next-line global-require
    fetch = require('node-fetch')
  } catch (e) {
    console.error('No fetch available. Please run `npm install node-fetch` or use Node 18+ which includes global fetch.')
    process.exit(1)
  }
}
const fs = require('fs')
const path = require('path')

async function checkUrl(name, url, timeout = 10000) {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(id)
    return { name, url, ok: res.ok, status: res.status }
  } catch (err) {
    return { name, url, ok: false, error: err.message }
  }
}

function loadDeployedJson(folder) {
  try {
    const p = path.join(__dirname, '..', folder, 'public', 'deployed.json')
    if (fs.existsSync(p)) {
      const str = fs.readFileSync(p, 'utf8')
      return JSON.parse(str)
    }
  } catch (e) {
    // ignore
  }
  return null
}

async function main() {
  const checks = []

  // try to load deployed.json from each frontend
  const frontend = loadDeployedJson('frontend')
  const admin = loadDeployedJson('admin')
  const pharmacist = loadDeployedJson('pharmacist')

  if (frontend && frontend.frontendUrl) checks.push({ name: 'frontend', url: frontend.frontendUrl })
  if (frontend && frontend.backendUrl) checks.push({ name: 'backend-via-frontend', url: frontend.backendUrl })

  if (admin && admin.adminUrl) checks.push({ name: 'admin', url: admin.adminUrl })
  if (admin && admin.backendUrl) checks.push({ name: 'backend-via-admin', url: admin.backendUrl })

  if (pharmacist && pharmacist.pharmacistUrl) checks.push({ name: 'pharmacist', url: pharmacist.pharmacistUrl })
  if (pharmacist && pharmacist.backendUrl) checks.push({ name: 'backend-via-pharmacist', url: pharmacist.backendUrl })

  // also try to read a backend URL from env (if set by user)
  if (process.env.PRESCRIPTO_BACKEND) checks.push({ name: 'backend-env', url: process.env.PRESCRIPTO_BACKEND })

  if (checks.length === 0) {
    console.log('No deployed.json found or no URLs configured. Please set deployed.json in frontend/admin/pharmacist public folders or set PRESCRIPTO_BACKEND env var.')
    process.exit(1)
  }

  console.log('Running smoke checks for', checks.length, 'endpoints...')

  const results = await Promise.all(checks.map(c => checkUrl(c.name, c.url)))

  for (const r of results) {
    if (r.ok) console.log(`✔ ${r.name} (${r.url}) -> ${r.status}`)
    else console.log(`✖ ${r.name} (${r.url}) -> ${r.error || ('HTTP ' + r.status)}`)
  }

  const failing = results.filter(r => !r.ok)
  if (failing.length > 0) process.exit(2)
  console.log('All checks passed.')
}

main()
