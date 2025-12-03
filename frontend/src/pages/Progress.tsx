import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'

type ProgressStore = {
  totalScore: number
  games: Record<string, { bestScore: number; attempts: number; lastScore: number; lastPlayedAt: string }>
}

type GameListItem = {
  key: string
  title: string
  description: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [games, setGames] = useState<GameListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [serverPerGame, setServerPerGame] = useState<Record<string, { bestScore: number; attempts: number; lastScore: number; lastPlayedAt: string | null }> | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch('http://localhost:4000/api/games')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load games')
        if (alive) setGames(data.games || [])
      } catch {
        if (alive) setGames([])
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  function getOrCreatePlayerId(): string {
    let id = localStorage.getItem('zb_player_id')
    if (!id) {
      id = 'player_' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem('zb_player_id', id)
    }
    return id
  }

  function getProgressStorageKey(currentUserId?: string | null): string {
    const owner = currentUserId || getOrCreatePlayerId()
    return `zb_progress_${owner}`
  }

  const progress: ProgressStore = useMemo(() => {
    try {
      const storageKey = getProgressStorageKey(user?.id)
      const raw = localStorage.getItem(storageKey)
      if (!raw) return { totalScore: 0, games: {} }
      const parsed = JSON.parse(raw) as ProgressStore
      return parsed ?? { totalScore: 0, games: {} }
    } catch {
      return { totalScore: 0, games: {} }
    }
  }, [loading, user?.id])

  const rows = useMemo(() => {
    const list = games.map((g) => {
      // Prefer server per-game stats when authenticated; otherwise use local namespaced stats
      const sp = serverPerGame?.[g.key]
      if (user && sp) {
        return {
          key: g.key,
          title: g.title,
          difficulty: g.difficulty,
          bestScore: sp.bestScore ?? 0,
          attempts: sp.attempts ?? 0,
          lastScore: sp.lastScore ?? 0,
          lastPlayedAt: sp.lastPlayedAt ?? '-',
        }
      }
      const p = progress.games[g.key]
      return {
        key: g.key,
        title: g.title,
        difficulty: g.difficulty,
        bestScore: p?.bestScore ?? 0,
        attempts: p?.attempts ?? 0,
        lastScore: p?.lastScore ?? 0,
        lastPlayedAt: p?.lastPlayedAt ?? '-',
      }
    })
    // Include any progress entries not in current game list (fallback)
    for (const k of Object.keys(progress.games)) {
      if (!list.find((r) => r.key === k)) {
        const p = progress.games[k]
        list.push({ key: k, title: k, difficulty: 'easy', bestScore: p.bestScore, attempts: p.attempts, lastScore: p.lastScore, lastPlayedAt: p.lastPlayedAt })
      }
    }
    return list
  }, [games, progress])

  // When authenticated, fetch server-side per-game progress for accurate stats
  useEffect(() => {
    let active = true
    async function loadServerProgress() {
      if (!user) {
        setServerPerGame(null)
        return
      }
      try {
        const token = localStorage.getItem('zb_token')
        if (!token) return
        const res = await fetch('http://localhost:4000/api/progress', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) return
        const perGame = data.perGame as Record<string, { bestScore: number; attempts: number; lastScore: number; lastPlayedAt: string | null }>
        if (active) setServerPerGame(perGame)
      } catch {
        // ignore network/server errors and keep local fallback
      }
    }
    loadServerProgress()
    return () => {
      active = false
    }
  }, [user?.id])

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-white text-4xl font-bold leading-tight tracking-tighter sm:text-5xl lg:text-6xl">My Progress</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-normal text-gray-300 sm:text-lg">
          Track your best scores and recent activity across all games.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="text-2xl font-semibold text-emerald-300">
          Total Score: {user ? user.score : progress.totalScore}
        </div>
        <p className="text-gray-300 text-sm mt-1">
          {user
            ? 'This is your account score, saved to the server.'
            : 'This is a local score (guest). Sign up to save progress across devices.'}
        </p>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((r) => (
            <div key={r.key} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">{r.title}</h3>
                <span className="text-xs px-2 py-1 rounded-md bg-white/10 text-gray-200 uppercase">{r.difficulty}</span>
              </div>
              <div className="mt-3 text-sm text-gray-300 grid grid-cols-2 gap-2">
                <div>Best Score: <span className="text-emerald-300 font-semibold">{r.bestScore}</span></div>
                <div>Attempts: {r.attempts}</div>
                <div>Last Score: {r.lastScore}</div>
                <div>Last Played: {r.lastPlayedAt === '-' ? '-' : new Date(r.lastPlayedAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
