import { prisma } from '../prisma'

export type ThreatIntelSummary = {
  hasPhishTankHit: boolean
  hasGoogleSafeBrowsingHit: boolean
  reasons: string[]
}

export async function getThreatIntelForUrl(urlId: string): Promise<ThreatIntelSummary> {
  const hits = await prisma.threatIntelHit.findMany({
    where: { urlId },
  })

  const reasons: string[] = []

  const phishTankHits = hits.filter((h) => h.provider.toLowerCase() === 'phishtank')
  const hasPhishTankHit = phishTankHits.length > 0
  if (hasPhishTankHit) {
    reasons.push('Flagged as phishing in PhishTank database')
  }

  const googleHits = hits.filter((h) => h.provider.toLowerCase() === 'google_safe_browsing')
  const hasGoogleSafeBrowsingHit = googleHits.length > 0
  if (hasGoogleSafeBrowsingHit) {
    reasons.push('Flagged as unsafe by Google Safe Browsing')
  }

  return {
    hasPhishTankHit,
    hasGoogleSafeBrowsingHit,
    reasons,
  }
}
