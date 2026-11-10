'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-neutral-50 dark:bg-[#1A1917] text-neutral-900 dark:text-white min-h-screen flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-white dark:bg-[#242320] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-10 text-center shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center mx-auto mb-6 text-red-500 shadow-lg shadow-red-500/10">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-3 tracking-tight">
            Application Error
          </h1>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
            A critical system error occurred. We have logged the issue and are working to resolve it.
          </p>

          {process.env.NODE_ENV === 'development' && error?.message && (
            <pre className="mb-6 text-left text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl p-3 overflow-x-auto max-h-36">
              {error.message}
            </pre>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#9E6B08] hover:bg-[#845006] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-[#9E6B08]/20 cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 font-semibold rounded-xl text-sm transition-all"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}

