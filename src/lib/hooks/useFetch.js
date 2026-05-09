'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/api'

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (options.enabled === false) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const { data: responseData } = await apiClient.get(url)
        setData(responseData.data || null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    if (options.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [url, options.enabled, options.refetchInterval])

  return { data, loading, error }
}
