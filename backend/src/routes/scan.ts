import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../prisma'
import { getThreatIntelForUrl } from '../services/threatIntel'

const router = express.Router()

// Very simple in-memory rate limiter per IP + path
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 30
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = `${req.ip}:${req.path}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return next()
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests, please slow down.' })
  }

  entry.count += 1
  return next()
}

type ScanVerdict = 'SAFE' | 'WARNING' | 'UNKNOWN' | 'COMMUNITY_REPORTED'

async function ensureGoogleSafeBrowsingIntel(urlId: string, normalizedUrl: string) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  if (!apiKey) return

  // If we already have a Google Safe Browsing hit, skip
  const existing = await prisma.threatIntelHit.findFirst({
    where: {
      urlId,
      provider: 'google_safe_browsing',
    },
  })
  if (existing) return

  const body = {
    client: {
      clientId: 'zerobait',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url: normalizedUrl }],
    },
  }

  try {
    // This should always appear when we call Google Safe Browsing
    console.log('GSB lookup for', normalizedUrl)
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )

    if (!response.ok) return

    const data = (await response.json()) as { matches?: unknown[] }
    if (Array.isArray(data.matches) && data.matches.length > 0) {
      await prisma.threatIntelHit.create({
        data: {
          provider: 'google_safe_browsing',
          verdict: 'phishing',
          urlId,
        },
      })
    }
  } catch {
    // fail closed: just skip intel if the API errors
  }
}

function normalizeUrl(input: string): string | null {
  try {
    const url = new URL(input.trim())
    // Normalize by lowercasing host and removing default ports and trailing slash
    url.hostname = url.hostname.toLowerCase()
    if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) {
      url.port = ''
    }
    if (url.pathname === '/') {
      url.pathname = ''
    }
    return url.toString()
  } catch {
    return null
  }
}

function evaluateHeuristics(originalUrl: string): { isSuspicious: boolean; reasons: string[] } {
  const reasons: string[] = []
  const lower = originalUrl.toLowerCase()

  if (lower.includes('@')) {
    reasons.push('URL contains "@" which can be used to obscure the real destination')
  }
  if (lower.includes('xn--')) {
    reasons.push('URL contains punycode which can be used for lookalike domains')
  }
  if (lower.includes('login') || lower.includes('verify') || lower.includes('secure') || lower.includes('update')) {
    reasons.push('URL contains sensitive keywords often used in phishing (login/verify/secure/update)')
  }
  try {
    const url = new URL(originalUrl)
    if (url.hostname.length > 60) {
      reasons.push('Domain name is unusually long')
    }
    if (url.hostname.split('.').length > 4) {
      reasons.push('Domain has many subdomains, which can be used to mimic trusted sites')
    }
    if (/^[0-9.]+$/.test(url.hostname)) {
      reasons.push('Domain looks like an IP address, which is often used in malicious links')
    }
    if (url.searchParams.toString().length > 100) {
      reasons.push('URL has a very long query string, which may hide tracking or malicious parameters')
    }
  } catch {
    // ignore parse errors here; normalization already validated
  }

  return { isSuspicious: reasons.length > 0, reasons }
}

router.post('/scan', rateLimit, async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string }

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "url" in request body' })
  }

  const normalizedUrl = normalizeUrl(url)
  if (!normalizedUrl) {
    return res.status(400).json({ error: 'Invalid URL format' })
  }

  try {
    const urlRecord = await prisma.url.upsert({
      where: { normalizedUrl },
      update: {},
      create: {
        originalUrl: url,
        normalizedUrl,
      },
    })

    // Ensure we have Google Safe Browsing intel cached for this URL (if any)
    await ensureGoogleSafeBrowsingIntel(urlRecord.id, normalizedUrl)

    const reportCount = await prisma.urlReport.count({
      where: { urlId: urlRecord.id },
    })

    const heuristics = evaluateHeuristics(url)
    const intel = await getThreatIntelForUrl(urlRecord.id)

    let verdict: ScanVerdict = 'SAFE'

    if (intel.hasPhishTankHit || intel.hasGoogleSafeBrowsingHit) {
      verdict = 'WARNING'
    } else if (reportCount >= 3) {
      verdict = 'WARNING'
    } else if (reportCount > 0) {
      verdict = 'COMMUNITY_REPORTED'
    } else if (heuristics.isSuspicious) {
      verdict = 'UNKNOWN'
    }

    return res.json({
      url: urlRecord.originalUrl,
      normalizedUrl: urlRecord.normalizedUrl,
      verdict,
      reasons: [...heuristics.reasons, ...intel.reasons],
      reportCount,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to scan URL' })
  }
})

router.post('/report-url', rateLimit, async (req: Request, res: Response) => {
  const { url, reason } = req.body as { url?: string; reason?: string }

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "url" in request body' })
  }

  const normalizedUrl = normalizeUrl(url)
  if (!normalizedUrl) {
    return res.status(400).json({ error: 'Invalid URL format' })
  }

  try {
    const urlRecord = await prisma.url.upsert({
      where: { normalizedUrl },
      update: {},
      create: {
        originalUrl: url,
        normalizedUrl,
      },
    })

    await prisma.urlReport.create({
      data: {
        urlId: urlRecord.id,
        reason: reason ?? null,
      },
    })

    const reportCount = await prisma.urlReport.count({
      where: { urlId: urlRecord.id },
    })

    return res.status(201).json({
      success: true,
      normalizedUrl,
      reportCount,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to report URL' })
  }
})

export default router
