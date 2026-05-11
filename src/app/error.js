'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-dark-900 px-4 text-center">
      <div className="relative mb-8">
        <p className="text-[120px] font-serif font-bold text-neutral-100 dark:text-dark-800 leading-none select-none">!</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl">⚠️</span>
        </div>
      </div>
      <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-3">
        Something Went Wrong
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm leading-relaxed">
        An unexpected error occurred. You can try again or return to the home page.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mb-6 text-left text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4 max-w-xl w-full overflow-x-auto">
          {error?.message}
        </pre>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-md"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border-2 border-primary-500 text-primary-500 hover:bg-primary-500/5 font-semibold rounded-xl transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
