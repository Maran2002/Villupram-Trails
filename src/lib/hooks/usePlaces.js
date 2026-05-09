'use client'

import { useFetch } from './useFetch'

export function usePlaces(page = 1, limit = 12, category) {
  const queryObj = {
    page: page.toString(),
    limit: limit.toString(),
  }
  if (category) queryObj.category = category
  const query = new URLSearchParams(queryObj)

  return useFetch(`/places?${query}`)
}

export function usePlace(placeId) {
  return useFetch(`/places/${placeId}`, {
    enabled: !!placeId,
  })
}
