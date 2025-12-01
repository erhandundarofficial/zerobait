import { useState } from 'react'

type ScanVerdict = 'SAFE' | 'WARNING' | 'UNKNOWN' | 'COMMUNITY_REPORTED'

type ScanResponse = {
  url: string
  normalizedUrl: string
  verdict: ScanVerdict
  reasons: string[]
  reportCount: number
}

function App() {
  const [url, setUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null)
  const [isReporting, setIsReporting] = useState(false)
  const [reportMessage, setReportMessage] = useState<string | null>(null)

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    setScanError(null)
    setReportMessage(null)

    const trimmed = url.trim()
    if (!trimmed) {
      setScanError('Please enter a URL to scan.')
      return
    }

    setIsScanning(true)
    try {
      const response = await fetch('http://localhost:4000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setScanError(data.error || 'Failed to scan URL.')
        setScanResult(null)
        return
      }

      const data = (await response.json()) as ScanResponse
      setScanResult(data)
    } catch (error) {
      setScanError('Network error while scanning URL.')
      setScanResult(null)
    } finally {
      setIsScanning(false)
    }
  }

  async function handleReport() {
    if (!scanResult) return

    setIsReporting(true)
    setReportMessage(null)
    try {
      const response = await fetch('http://localhost:4000/api/report-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanResult.url }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        setReportMessage(data.error || 'Failed to report URL.')
        return
      }

      setReportMessage('Thanks for your report!')
      // Optionally refresh scanResult with updated reportCount
      setScanResult((current) =>
        current ? { ...current, reportCount: data.reportCount ?? current.reportCount } : current,
      )
    } catch (error) {
      setReportMessage('Network error while reporting URL.')
    } finally {
      setIsReporting(false)
    }
  }

  const verdictColorClasses: Record<ScanVerdict, string> = {
    SAFE: 'border-green-500/30 bg-green-500/10 text-green-400',
    WARNING: 'border-red-500/30 bg-red-500/10 text-red-400',
    UNKNOWN: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    COMMUNITY_REPORTED: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  }

  const currentVerdict = scanResult?.verdict ?? 'SAFE'

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

            {/* Input Form */}
            <div className="mt-10 sm:mt-12">
              <form
                className="flex w-full flex-col items-center gap-4 sm:flex-row"
                onSubmit={handleScan}
              >
                <div className="relative w-full flex-grow">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="material-symbols-outlined text-gray-400">link</span>
                  </div>
                  <input
                    className="h-14 w-full min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 p-4 pl-12 text-base font-normal leading-normal text-white placeholder:text-gray-400 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter URL to scan (e.g., https://example.com)"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <button
                  className="flex h-14 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary px-8 text-base font-bold leading-normal text-background-dark transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  type="submit"
                  disabled={isScanning}
                >
                  <span className="truncate">{isScanning ? 'Scanning…' : 'Scan Now'}</span>
                </button>
              </form>
              {scanError && (
                <p className="mt-3 text-sm text-red-400 text-center">{scanError}</p>
              )}
            </div>

            {/* Results */}
            <div className="mt-10 sm:mt-16">
              <div
                className={`flex flex-col items-center gap-6 rounded-xl border p-6 text-center sm:p-8 ${verdictColorClasses[currentVerdict]}`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                  <span className="material-symbols-outlined text-4xl">
                    {currentVerdict === 'WARNING' ? 'gpp_bad' : 'verified_user'}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">
                    {currentVerdict === 'SAFE' && 'SAFE'}
                    {currentVerdict === 'WARNING' && 'WARNING'}
                    {currentVerdict === 'UNKNOWN' && 'CHECK CAREFULLY'}
                    {currentVerdict === 'COMMUNITY_REPORTED' && 'COMMUNITY REPORTED'}
                  </h3>
                  <p className="text-gray-300">
                    {scanResult
                      ? `Reports: ${scanResult.reportCount} • URL: ${scanResult.normalizedUrl}`
                      : 'Scan a URL to see results from the Zerobait engine.'}
                  </p>
                  {scanResult && scanResult.reasons.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 text-left text-sm text-gray-200">
                      {scanResult.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {scanResult && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary/80 hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleReport}
                      disabled={isReporting}
                    >
                      {isReporting ? 'Reporting…' : 'Report this URL'}
                    </button>
                    {reportMessage && (
                      <p className="text-xs text-gray-300">{reportMessage}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App