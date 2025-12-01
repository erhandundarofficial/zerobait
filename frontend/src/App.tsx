function App() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col">
        {/* TopNavBar */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-center border-b border-white/10 bg-background-dark/80 backdrop-blur-sm">
          <nav className="flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 text-white">
              <div className="size-6 text-primary">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.824 21c-1.428 0-2.75-2.16-3.41-5.32-0.66 3.16-1.983 5.32-3.414 5.32s-2.753-2.16-3.414-5.32C7.923 18.84 6.6 21 5.176 21 3.012 21 1 16.523 1 11S3.012 1 5.176 1s3.415 2.16 4.075 5.32C9.913 3.16 11.237 1 12.667 1s2.753 2.16 3.414 5.32c0.66-3.16 1.982-5.32 3.414-5.32C21.988 1 24 5.477 24 11s-2.012 10-4.176 10Z" />
                </svg>
              </div>
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Zerobait – Phishing Scanner
              </h2>
            </div>
            <div className="hidden items-center gap-8 md:flex">
              <a className="text-white text-sm font-medium leading-normal transition-colors hover:text-primary" href="#">
                Dashboard
              </a>
              <a className="text-gray-400 text-sm font-medium leading-normal transition-colors hover:text-primary" href="#">
                Games
              </a>
              <a className="text-gray-400 text-sm font-medium leading-normal transition-colors hover:text-primary" href="#">
                Leaderboard
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary/20 px-4 text-sm font-bold leading-normal text-primary transition-colors hover:bg-primary/30">
                <span className="truncate">Log In</span>
              </button>
              <button className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold leading-normal text-background-dark transition-colors hover:bg-opacity-90">
                <span className="truncate">Sign Up</span>
              </button>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex w-full grow flex-col items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="w-full max-w-3xl">
            {/* Headline */}
            <div className="text-center">
              <h1 className="text-white text-4xl font-bold leading-tight tracking-tighter sm:text-5xl lg:text-6xl">
                Scan URL for Phishing Threats
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-normal text-gray-300 sm:text-lg">
                Enter a URL below to check for potential phishing threats in real-time using our detection engine.
              </p>
            </div>

            {/* Input Form (no logic yet) */}
            <div className="mt-10 sm:mt-12">
              <form className="flex w-full flex-col items-center gap-4 sm:flex-row">
                <div className="relative w-full flex-grow">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="material-symbols-outlined text-gray-400">link</span>
                  </div>
                  <input
                    className="h-14 w-full min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 p-4 pl-12 text-base font-normal leading-normal text-white placeholder:text-gray-400 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter URL to scan (e.g., https://example.com)"
                    type="url"
                  />
                </div>
                <button
                  className="flex h-14 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary px-8 text-base font-bold leading-normal text-background-dark transition-colors hover:bg-opacity-90 sm:w-auto"
                  type="button"
                >
                  <span className="truncate">Scan Now</span>
                </button>
              </form>
            </div>

            {/* Placeholder Results */}
            <div className="mt-10 sm:mt-16">
              <div className="flex flex-col items-center gap-6 rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center sm:p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                  <span className="material-symbols-outlined text-4xl">verified_user</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-green-400">SAFE</h3>
                  <p className="text-gray-300">
                    This is a placeholder result. We&apos;ll wire it to the backend scanner soon.
                  </p>
                </div>
                <button className="text-sm font-medium text-primary/80 hover:text-primary">
                  Show Details
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App