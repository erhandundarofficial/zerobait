import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import { useI18n } from './i18n'
import LanguageSwitcher from './components/LanguageSwitcher'

function App() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const path = location.pathname
  const isHome = path === '/'
  const isLogin = path === '/login'
  const isSignup = path === '/signup'
  const isGames = path.startsWith('/games')
  const frameless = isHome || isLogin || isSignup || isGames
  return (
    <div className={`font-display min-h-screen ${frameless ? '' : 'bg-gray-950 text-gray-100'}`}>
      <div className="relative flex min-h-screen w-full flex-col">
        {/* TopNavBar (persistent, hidden on Home) */}
        {!frameless && (
          <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-center border-b border-white/10 bg-gray-950/80 backdrop-blur-sm">
            <nav className="flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 text-white">
                <div className="size-6 text-emerald-400">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.824 21c-1.428 0-2.75-2.16-3.41-5.32-0.66 3.16-1.983 5.32-3.414 5.32s-2.753-2.16-3.414-5.32C7.923 18.84 6.6 21 5.176 21 3.012 21 1 16.523 1 11S3.012 1 5.176 1s3.415 2.16 4.075 5.32C9.913 3.16 11.237 1 12.667 1s2.753 2.16 3.414 5.32c0.66-3.16 1.982-5.32 3.414-5.32C21.988 1 24 5.477 24 11s-2.012 10-4.176 10Z" />
                  </svg>
                </div>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                  {t('app.name')}
                </h2>
              </div>
              <div className="hidden items-center gap-8 md:flex">
                <Link className="text-white text-sm font-medium leading-normal transition-colors hover:text-emerald-300" to="/">
                  {t('nav.dashboard')}
                </Link>
                <Link className="text-gray-300 text-sm font-medium leading-normal transition-colors hover:text-emerald-300" to="/games">
                  {t('nav.games')}
                </Link>
                <Link className="text-gray-300 text-sm font-medium leading-normal transition-colors hover:text-emerald-300" to="/progress">
                  {t('nav.progress')}
                </Link>
                <a className="text-gray-300 text-sm font-medium leading-normal transition-colors hover:text-emerald-300" href="#">
                  {t('nav.leaderboard')}
                </a>
              </div>
              <div className="flex items-center gap-2">
                {!user ? (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-emerald-400/15 px-4 text-sm font-bold leading-normal text-emerald-300 transition-colors hover:bg-emerald-400/25"
                    >
                      <span className="truncate">{t('nav.login')}</span>
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-emerald-400 px-4 text-sm font-bold leading-normal text-gray-900 transition-colors hover:bg-emerald-300"
                    >
                      <span className="truncate">{t('nav.signup')}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300">{t('nav.hello_name', { name: user.username ?? 'user' })}</span>
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white/10 px-3 text-xs font-semibold leading-normal text-gray-200 transition-colors hover:bg-white/20"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
                <div className="ml-2"><LanguageSwitcher /></div>
              </div>
            </nav>
          </header>
        )}

        {/* Routed Content */}
        {frameless ? (
          <Outlet />
        ) : (
          <main className="flex w-full grow flex-col items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
            <div className="w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        )}
      </div>
    </div>
  )
}

export default App