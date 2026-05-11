import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found | Villupuram Travel Community',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-dark-900 px-4 text-center">
      <div className="relative mb-8">
        <p className="text-[120px] font-serif font-bold text-neutral-100 dark:text-dark-800 leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl">🗺️</span>
        </div>
      </div>
      <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-3">
        Destination Not Found
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm leading-relaxed">
        The page you&apos;re looking for seems to have wandered off the map. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-md"
        >
          Go Home
        </Link>
        <Link
          href="/explore"
          className="px-6 py-3 border-2 border-primary-500 text-primary-500 hover:bg-primary-500/5 font-semibold rounded-xl transition-colors"
        >
          Explore Places
        </Link>
      </div>
    </div>
  )
}
