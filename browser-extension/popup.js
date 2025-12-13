const API_BASE = 'http://localhost:4000/api'

// Simple i18n for popup
const dict = {
  tr: {
    scanning: 'Taranıyor…',
    rescan: 'Yeniden Tara',
    report: 'Bildir',
    open_app: 'Uygulamayı Aç',
    low: 'DÜŞÜK RİSK',
    medium: 'ORTA RİSK',
    high: 'YÜKSEK RİSK',
    score: 'Risk Skoru',
    url: 'URL',
    report_failed: 'Bildirim başarısız',
  },
  en: {
    scanning: 'Scanning…',
    rescan: 'Rescan',
    report: 'Report',
    open_app: 'Open App',
    low: 'LOW RISK',
    medium: 'MODERATE RISK',
    high: 'HIGH RISK',
    score: 'Risk Score',
    url: 'URL',
    report_failed: 'Report failed',
  },
}

let LANG = 'tr'
try {
  // Allow persisted choice if saved by the web app in localStorage-equivalent for extension
  // or infer from browser
  LANG = (localStorage.getItem('zb_lang') || '').toLowerCase() || (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en'
  if (LANG !== 'tr' && LANG !== 'en') LANG = 'tr'
} catch {}

function t(key) {
  return (dict[LANG] && dict[LANG][key]) || (dict.en && dict.en[key]) || key
}

function verdictOf(score) {
  if (score >= 70) return { label: t('high'), color: '#ef4444' }
  if (score >= 40) return { label: t('medium'), color: '#f59e0b' }
  return { label: t('low'), color: '#10b981' }
}

function normalizeUrl(url) {
  try {
    let s = String(url || '').trim()
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s
    const u = new URL(s)
    u.protocol = 'https:'
    u.search = ''
    u.hash = ''
    return u
  } catch {
    return null
  }
}

async function scan(u) {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: u.toString() }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Scan failed')
  return data
}

async function report(u) {
  const res = await fetch(`${API_BASE}/report-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: u.toString() }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) throw new Error(data.error || 'Report failed')
  return data
}

async function getActiveUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab?.url || ''
}

async function refresh() {
  const loading = document.getElementById('loading')
  const content = document.getElementById('content')
  const urlEl = document.getElementById('url')
  const hostEl = document.getElementById('hostname')
  const dot = document.getElementById('dot')
  const bar = document.getElementById('bar')
  const summary = document.getElementById('summary')
  const loadingText = document.getElementById('loadingText')
  const btnScan = document.getElementById('btn-scan')
  const btnReport = document.getElementById('btn-report')
  const btnOpenApp = document.getElementById('btn-open-app')
  // reset UI to loading
  if (loading) loading.classList.remove('hidden')
  if (content) content.classList.add('hidden')
  if (loadingText) loadingText.textContent = t('scanning')
  if (btnScan) btnScan.textContent = t('rescan')
  if (btnReport) btnReport.textContent = t('report')
  if (btnOpenApp) btnOpenApp.textContent = t('open_app')
  const active = await getActiveUrl()
  const u = normalizeUrl(active)
  if (!u) return
  urlEl.textContent = `${t('url')}: ${u.toString()}`
  hostEl.textContent = u.hostname
  try {
    const data = await scan(u)
    const risk = Number(data?.risk_score || 0)
    const { label, color } = verdictOf(risk)
    document.querySelector('#content .row div:nth-child(2)').textContent = label
    dot.style.background = color
    bar.style.width = `${Math.min(100, Math.max(0, risk))}%`
    bar.style.background = color
    summary.textContent = data?.ai_summary || ''
    // show result
    if (loading) loading.classList.add('hidden')
    if (content) content.classList.remove('hidden')
    // auto-close after 5 seconds
    scheduleAutoClose()
  } catch (e) {
    summary.textContent = 'Scan failed.'
    if (loading) loading.classList.add('hidden')
    if (content) content.classList.remove('hidden')
    scheduleAutoClose()
  }
}

let autoCloseTimer = null
function scheduleAutoClose() {
  try { if (autoCloseTimer) clearTimeout(autoCloseTimer) } catch {}
  autoCloseTimer = setTimeout(() => {
    try { window.close() } catch {}
  }, 5000)
}

async function bootstrap() {
  document.getElementById('btn-scan').addEventListener('click', () => {
    try { if (autoCloseTimer) clearTimeout(autoCloseTimer) } catch {}
    refresh()
  })
  document.getElementById('btn-report').addEventListener('click', async () => {
    const active = await getActiveUrl()
    const u = normalizeUrl(active)
    if (!u) return
    try {
      await report(u)
      alert('Thanks for your report!')
    } catch (e) {
      alert(t('report_failed') + ': ' + e.message)
    }
  })
  await refresh()
}

bootstrap()
