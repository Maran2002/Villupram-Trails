'use client'

import { useState, useEffect, useCallback } from 'react'
import apiClient from '@/lib/api'

export function useFetch(url, options = {}) {
  const [resolvedUrl, setResolvedUrl] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(options.enabled !== false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (options.enabled === false) return

    let active = true

    apiClient.get(url)
      .then(({ data: responseData }) => {
        if (active) {
          setData(responseData.data || null)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      })
      .finally(() => {
        if (active) { setResolvedUrl(url); setLoading(false) }
      })

    if (options.refetchInterval) {
      const interval = setInterval(() => {
        apiClient.get(url)
          .then(({ data: responseData }) => {
            if (active) setData(responseData.data || null)
          })
          .catch((err) => {
            if (active) setError(err instanceof Error ? err : new Error('Unknown error'))
          })
      }, options.refetchInterval)

      return () => {
        active = false
        clearInterval(interval)
      }
    }

    return () => {
      active = false
    }
  }, [url, options.enabled, options.refetchInterval])

  const refetch = useCallback(async () => {
    if (options.enabled === false) return
    setLoading(true)
    setError(null)
    try {
      const { data: responseData } = await apiClient.get(url)
      setData(responseData.data || null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [url, options.enabled])

  const pending = options.enabled !== false && resolvedUrl !== url
  return { data: pending ? null : data, loading: pending || loading, error: pending ? null : error, refetch }
}
