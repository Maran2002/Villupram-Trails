'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/common/ErrorState'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error('[AdminError]', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <ErrorState
          variant="fullscreen"
          icon={ShieldAlert}
          badge="Admin Console Error"
          title="Admin Error Occurred"
          message="We encountered an issue while loading this admin view. You can retry or head back to the admin overview."
          onRetry={reset}
          retryText="Try Again"
          secondaryAction={{
            label: 'Admin Overview',
            href: '/admin',
            icon: ArrowLeft,
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

