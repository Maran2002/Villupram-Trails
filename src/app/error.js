'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/common/ErrorState'
import { AlertTriangle, Home } from 'lucide-react'

export default function SegmentError({ error, reset }) {
  useEffect(() => {
    console.error('[AppSegmentError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-dark-900 px-4">
      <div className="max-w-lg w-full">
        <ErrorState
          variant="fullscreen"
          icon={AlertTriangle}
          badge="Application Error"
          title="Something Went Wrong"
          message="An unexpected error occurred while rendering this page. You can try again or return to the homepage."
          onRetry={reset}
          retryText="Try Again"
          secondaryAction={{
            label: 'Go Home',
            href: '/',
            icon: Home,
          }}
        />
        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre className="mt-4 text-left text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4 w-full overflow-x-auto">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  )
}
