import express from 'express'
import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'

const router = express.Router()

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-insecure-secret-change-me'
}

router.get('/progress', async (req: Request, res: Response) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.slice('Bearer '.length)
  let userId: string
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { sub: string }
    userId = decoded.sub
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const games = await prisma.game.findMany({ select: { id: true, key: true, title: true, type: true } })
    const sessions = await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      select: { id: true, score: true, startedAt: true, completedAt: true, gameId: true },
    })

    const byGame: Record<string, { bestScore: number; attempts: number; lastScore: number; lastPlayedAt: Date | null }> = {}
    const gameIdToKey: Record<string, string> = {}
    for (const g of games) {
      byGame[g.key] = { bestScore: 0, attempts: 0, lastScore: 0, lastPlayedAt: null }
      gameIdToKey[g.id] = g.key
    }

    for (const s of sessions) {
      const key = gameIdToKey[s.gameId]
      if (!key) continue
      const agg = byGame[key]
      if (!agg) {
        byGame[key] = { bestScore: s.score, attempts: 1, lastScore: s.score, lastPlayedAt: s.completedAt ?? s.startedAt }
        continue
      }
      agg.attempts += 1
      if (s.score > agg.bestScore) agg.bestScore = s.score
      if (!agg.lastPlayedAt) {
        agg.lastPlayedAt = s.completedAt ?? s.startedAt
        agg.lastScore = s.score
      }
    }

    return res.json({ userId, perGame: byGame })
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load progress' })
  }
})

export default router
